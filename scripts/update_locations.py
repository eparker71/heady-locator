#!/usr/bin/python
from __future__ import print_function

import html5lib
import requests
import time
import json
import boto3

print('Loading function')

GMAP_API_KEY = 'AIzaSyBMjY7LIkD44Dxbj8fVK4WK_jGYZSnFjZs'


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
                    loc_dict[item.attrib['class']] = item.text.strip() + \
                        ', Vermont'
                else:
                    loc_dict[item.attrib['class']] = item.text.strip()
        loc_list.append(loc_dict)
    return loc_list


def geocode_locations(loc_list):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Locations')
    with table.batch_writer() as batch:
        for l in loc_list:
            if l.get('street'):
                url = "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s" % (
                    l.get('street'), GMAP_API_KEY)
                r = requests.get(url).json()
                time.sleep(1)
                if len(r['results']) > 0:
                    l["lat"] = str(r['results'][0]['geometry']
                                   ['location']['lat'])
                    l["lng"] = str(r['results'][0]['geometry']
                                   ['location']['lng'])
                    print(l)
                    batch.put_item(Item=l)


def lambda_handler(event, context):
    #print("Getting locations...")
    locations = get_locations()
    #print("Geocoding locations...")
    geocoded_locations = geocode_locations(locations)
    message = '{} Locations updated...'.format(len(locations))
    sns = boto3.client('sns', region_name='us-east-1')
    response = sns.publish(
        TopicArn='arn:aws:sns:us-east-1:111326002412:api-view', Message=message)


# def main():
#     print("Getting locations...")
#     locations = get_locations()
#     print("Geocoding locations...")
#     geocoded_locations = geocode_locations(locations)
#     message = '{} Locations updated...'.format(len(locations))
#     sns = boto3.client('sns', region_name='us-east-1')
#     response = sns.publish(TopicArn='arn:aws:sns:us-east-1:111326002412:api-view', Message=message)
#
#
# if __name__ == "__main__":
#     main()
