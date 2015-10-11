from lxml import html
import requests
import time
import json
import os

gmap_api_key = os.environ.get('GOOGLE_MAPS_API_KEY')
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

for l in loc_list:
	url = "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s" % (l['street'], gmap_api_key)
	r = requests.get(url).json()
	time.sleep(1)
		
	l["lat"] = r['results'][0]['geometry']['location']['lat']
	l["lng"] = r['results'][0]['geometry']['location']['lng']
	
	print r['results'][0]['geometry']['location']
	break

print '%s' % loc_list[0]

f = open('api2.php', 'w')
f.write('<?php\n')
f.write('$locations = array(\n')
for place in loc_list:
	print '%s' % place
	f.write('\tarray("delivery" => "{delivery}", "lat" => {lat}, "lng" => {lng}, "street" => "{street}", "name" => "{name}"),\n'.format(**place))
	break
f.write(")\n")
f.write("header('Content-Type: application/json');\n")
f.write("echo json_encode($locations);\n")
f.write("?>\n")
f.close()


