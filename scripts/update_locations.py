#!/usr/bin/python
from __future__ import print_function

import html5lib
import requests
import time
import json
import boto3

print('Loading function')

def get_locations():
    page = requests.get('http://alchemistbeer.com/buy/')
    content = page.text
    document = html5lib.parse(content)
    locations = document.findall('.//*[@class="location"]')
    loc_list = []
    for loc in locations:
        loc_dict = {}
        for item in loc:
            if item.text:
                if item.attrib['class'] == 'street':
                    loc_dict[item.attrib['class']] = item.text.strip() + ', Vermont'
                else:
                    loc_dict[item.attrib['class']] = item.text.strip()
        loc_list.append(loc_dict)
    return loc_list

def get_map_key():
	"""
	The google map api key is stored in KMS
	"""
    s3client = boto3.client('s3')
    s3obj = s3client.get_object(Bucket='hopsale', Key='encrypted-secret')
    kmsclient = boto3.client('kms')
    kmsmapkey = kmsclient.decrypt(CiphertextBlob=s3obj['Body'].read())
    return kmsmapkey['Plaintext']
    
def geocode_locations(loc_list):
    gmapkey = get_map_key()
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Locations')
    with table.batch_writer() as batch:
        for l in loc_list:
            url = "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s" % (l['street'], gmapkey)
            r = requests.get(url).json()
            time.sleep(1) 
            if len(r['results']) > 0:
                l["lat"] = str(r['results'][0]['geometry']['location']['lat'])
                l["lng"] = str(r['results'][0]['geometry']['location']['lng'])
                print(l)
                batch.put_item(Item=l)
    
# the lambda_handler is used by AWS lambda to run the script
def lambda_handler(event, context):
    print("Getting locations...")
    locations = get_locations()
    print("Geocoding locations...")
    geocoded_locations = geocode_locations(locations)

#You can also uncomment the following lines to run this script from
#the command line. 
# def main():
#     print("Getting locations...")
#     locations = get_locations()
#     print("Geocoding locations...")
#     geocoded_locations = geocode_locations(locations)
#    
#     
# if __name__ == "__main__":
#     main()
