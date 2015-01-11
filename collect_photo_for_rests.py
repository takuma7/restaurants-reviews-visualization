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

def photo_url(keyid, format, shop_id, hit_per_page, offset_page):
    return "http://api.gnavi.co.jp/ouen/ver1/PhotoSearch?keyid={keyid}&format={format}&shop_id={shop_id}&hit_per_page={hit_per_page}&offset_page={offset_page}".format(keyid=keyid, format=format, shop_id=shop_id, hit_per_page=hit_per_page, offset_page=offset_page)

rests = res_collection.find({'$and': [{'votes': {'$exists':False}}, {'visited': {'$exists':False}}]})
rests_count = rests.count()
print "%s restaurants to go"%(rests_count)
i = 0

for cur in rests:
    shop_id = cur['id']
    # print cur['name']['name']
    cur['votes'] = []
    hit_per_page = 50
    offset_page = 1
    while True:
        response = urllib2.urlopen(photo_url(gnavi_api_key, "json", shop_id, hit_per_page, offset_page))
        data = response.read()
        data = json.loads(data)
        if 'gnavi' in data:
            # print "Error - {code}".format(code=data['gnavi'][0]['error']['code'])
            # print "="*80
            # print repr(data)
            break
        else:
            # print repr(data)
            for k, v in data['response'].items():
                if k == 'hit_per_page' or k == 'total_hit_count':
                    continue
                # if 'total_score' not in v['photo']:
                    # print json.dumps(v['photo'],ensure_ascii=False)
                if 'total_score' in v['photo']:
                    # print v['photo']['total_score'], " : ", v['photo']['comment']
                    cur['votes'].append({'score': v['photo']['total_score'], 'comment': v['photo']['comment']})
            offset_page += 1
    cur['visited'] = True
    res_collection.save(cur)
    pbar.draw(curval=i, maxval=rests_count)
    i += 1

