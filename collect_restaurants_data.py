# -*- coding: utf-8 -*-
# 東京のレストランすべてのデータをぐるなびAPIより取得

import pymongo
import yaml
import urllib2
import json
import progressbar

file = open('secret.yml').read().decode('utf8')
secret = yaml.load(file)

# secret.ymlに格納されたぐるなびAPIのkeyidを取得
gnavi_api_key = secret['gnavi']['key']

# MongoDBに接続
client = pymongo.MongoClient()
db = client['gnavi_data']
res_collection = db['restaurants']

# プログレスバーを用意
pbar = progressbar.Progressbar(width=80)

# ぐるなびAPIのレストラン取得URLを組み立てる関数
def restaurants_url(keyid, format, pref, hit_per_page, offset_page):
    return "http://api.gnavi.co.jp/ver2/RestSearchAPI/?keyid={keyid}&format={format}&pref={pref}&hit_per_page={hit_per_page}&offset_page={offset_page}".format(keyid=keyid, format=format, pref=pref,hit_per_page=hit_per_page, offset_page=offset_page)

def pref_url(keyid):
    return "http://api.gnavi.co.jp/ver1/PrefSearchAPI/?keyid={keyid}".format(keyid=keyid)

pref_code = "PREF13"    # 東京のPREF CODE

offset_page = 1
hit_per_page = 500 # 1リクエストあたり最大500件のデータを取得することにする

while True:
    # print "page_offset: {offset_page}".format(offset_page=offset_page)
    response = urllib2.urlopen(restaurants_url(gnavi_api_key, "json", pref_code, hit_per_page, offset_page))
    data = response.read()
    data = json.loads(data)
    if 'error' in data:
        # エラー発生もしくはデータすべて取得完了
        print "Error"
        print repr(data)
        break
    else:
        rest = data['rest']
        total_hit_count = int(data['total_hit_count'])
        # DBにレストラン情報を格納。バルクインサートを行う。
        res_collection.insert(data['rest'])

        pbar.draw(curval=offset_page*hit_per_page, maxval=total_hit_count)
        offset_page += 1


