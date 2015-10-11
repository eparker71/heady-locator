#!/usr/bin/python

import sys, getopt
from lxml import html
import requests
import time
import json
import os

GMAP_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

def get_locations():
    page = requests.get('http://alchemistbeer.com/buy/')
    tree = html.fromstring(page.text)
    locations = tree.xpath('//div[@class="location"]')
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

def geocode_locations(loc_list):
    for l in loc_list:
        url = "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s" % (l['street'], GMAP_API_KEY)
        r = requests.get(url).json()
        time.sleep(1)    
        l["lat"] = r['results'][0]['geometry']['location']['lat']
        l["lng"] = r['results'][0]['geometry']['location']['lng']
    return loc_list
    
def generate_php_api_file(loc_list, filename):
    content = '<?php\n'
    content += '$locations = array(\n'
    for place in loc_list:
        content +='array("delivery" => "{delivery}", "lat" => {lat}, "lng" => {lng}, "street" => "{street}", "name" => "{name}"),\n'.format(**place)
        
    # strip off the ending ',\n' or the php will have an error
    content = content.rstrip(',\n')
    content += ");\n"
    content += "header('Content-Type: application/json');\n"
    content += "echo json_encode($locations);\n"
    content += "?>\n"
    
    # write the contents to the file
    f = open(filename, 'w')
    f.write(content)
    f.close()

def main(argv):
    
    if not GMAP_API_KEY:
        print "Error: GOOGLE_MAPS_API_KEY not found"
        sys.exit(2);
        
    filename = ''

    try:
        opts, args = getopt.getopt(argv,"h:o:",["ifile="])
    except getopt.GetoptError:
        print 'update_heady_locations.py -o <outputfile>'
        sys.exit(2)
    
    for opt, arg in opts:
        if opt == '-h':
            print 'update_heady_locations.py -o <outputfile>'
            sys.exit(argv)
        elif opt in ("-o", "--ofile"):
            filename = arg

    print "Getting locations..."
    locations = get_locations()
    print "Geocoding locations..."
    geocoded_locations = geocode_locations(locations)
    print "Generating PHP file %s" % filename
    generate_php_api_file(geocoded_locations, filename)
    sys.exit()
    
if __name__ == "__main__":
    main(sys.argv[1:])
