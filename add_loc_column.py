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
res_collection = db['restaurants']

pbar = progressbar.Progressbar(width=80)

rests = res_collection.find()
rests_count = rests.count()
print "%s restaurants to go"%(rests_count)
i = 0

for cur in rests:
    cur['loc'] = [
            float(cur['location']['longitude']),
            float(cur['location']['latitude'])
            ]
    cur['loc_wgs84'] = [
            float(cur['location']['longitude_wgs84']),
            float(cur['location']['latitude_wgs84'])
            ]
    res_collection.save(cur)
    pbar.draw(curval=i, maxval=rests_count)
    i += 1

