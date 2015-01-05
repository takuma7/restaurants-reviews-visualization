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

def photo_url(keyid, format, shop_id, hit_per_page, offset_page):
    return "http://api.gnavi.co.jp/ouen/ver1/PhotoSearch?keyid={keyid}&format={format}&shop_id={shop_id}&hit_per_page={hit_per_page}&offset_page={offset_page}".format(keyid=keyid, format=format, shop_id=shop_id, hit_per_page=hit_per_page, offset_page=offset_page)

for cur in res_collection.find():
    shop_id = cur['id']
    print cur['name']['name']
    cur['votes'] = [];
    hit_per_page = 50
    offset_page = 1
    while True:
        response = urllib2.urlopen(photo_url(gnavi_api_key, "json", shop_id, hit_per_page, offset_page))
        data = response.read()
        data = json.loads(data)
        if 'gnavi' in data:
            print "Error - {code}".format(code=data['gnavi'][0]['error']['code'])
            print "="*80
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
                    print v['photo']['total_score'], " : ", v['photo']['comment']
                    cur['votes'].append({'score': v['photo']['total_score'], 'comment': v['photo']['comment']})
            res_collection.save(cur)
            offset_page += 1

