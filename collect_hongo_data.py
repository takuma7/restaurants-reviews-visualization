# -*- coding: utf-8 -*-

import pymongo
import yaml
import urllib2
import json
import progressbar

file = open('secret.yml').read().decode('utf8')
secret = yaml.load(file)

gnavi_api_key = secret['gnavi']['key']

client = pymongo.MongoClient()
db = client['gnavi_data']
res_collection = db['hongo']

pbar = progressbar.Progressbar(width=80)

def restaurants_url(keyid, format, areacode_s, hit_per_page, offset_page):
    return "http://api.gnavi.co.jp/ver2/RestSearchAPI/?keyid={keyid}&format={format}&areacode_s={areacode_s}&hit_per_page={hit_per_page}&offset_page={offset_page}".format(keyid=keyid, format=format, areacode_s=areacode_s,hit_per_page=hit_per_page, offset_page=offset_page)

def pref_url(keyid):
    return "http://api.gnavi.co.jp/ver1/PrefSearchAPI/?keyid={keyid}".format(keyid=keyid)

pref_code = "PREF13"    # Tokyo
areacode_s = "AREAS2188"

offset_page = 1
hit_per_page = 500

while True:
    # print "page_offset: {offset_page}".format(offset_page=offset_page)
    response = urllib2.urlopen(restaurants_url(gnavi_api_key, "json", areacode_s, hit_per_page, offset_page))
    data = response.read()
    data = json.loads(data)
    if 'error' in data:
        print "Error"
        print repr(data)
        break
    else:
        rest = data['rest']
        total_hit_count = int(data['total_hit_count'])
        res_collection.insert(data['rest'])

        pbar.draw(curval=offset_page*hit_per_page, maxval=total_hit_count)
        offset_page += 1


