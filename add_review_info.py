# -*- coding: utf-8 -*-
# 口コミ情報のメタデータ（平均評価など）を計算する

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
    votes = cur['votes']
    votes_count = len(votes)
    total_score = 0 # すべてのスコアの合計
    score_count = 0 # スコアが何件ついたか
    avg_score = 0   # 平均スコア

    if votes:
        for vote in votes:
            score = float(vote['score'])
            total_score += score
            score_count += 1
        avg_score = total_score / score_count
        cur['total_score'] = total_score
        cur['avg_score'] = avg_score
        cur['score_count'] = score_count

    res_collection.save(cur)
    pbar.draw(curval=i, maxval=rests_count)
    i += 1

