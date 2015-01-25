# -*- coding: utf8 -*-
# MongoDBの内容をjsonに書き出すスクリプト

import pymongo
import sys
import json
import codecs

if len(sys.argv) != 4:
    sys.exit("Usage: python %s <db> <col> <output file>" % (sys.argv[0]))


client = pymongo.MongoClient()

db = client[sys.argv[1]]
col = db[sys.argv[2]]

filename = sys.argv[3]

f = codecs.open(filename, "w", "utf-8")

for cur in col.find():
    del cur['_id']
    json.dump(cur, f, ensure_ascii=False)

f.close()

