# -*- coding: utf-8 -*-
"""
A simple progressbar
"""

__author__ = 'takuma7'

import time
import sys

class Progressbar:
    def __init__(self, fd=sys.stdout, label="Progress", width=40):
        self.fd = fd
        self.label = label
        self.width = width

    def draw(self, curval=0, maxval=100):
        """Draw Progressbar"""
        curwidth = int(self.width * curval/float(maxval))
        percentage = int(curval/float(maxval)*100)
        barstr = self.label + ":\t["
        barstr += "#"*curwidth
        barstr += " "*(self.width-curwidth)
        barstr += "] %i%%" % percentage
        self.fd.write("\r%s" % barstr)
        self.fd.flush()
        if percentage == 100:
            self.fd.write("\n")

if __name__ == "__main__":
    pa = Progressbar(label="Apple")
    pb = Progressbar(label="Banana", width=80)
    print "Example #1: Progressbar(label=\"Apple\")"
    for i in range(0, 400+1):
        pa.draw(i, 400)
        time.sleep(0.01)
    print ""
    print "Example #2: Progressbar(label=\"Banana\", width=80)"
    for i in range(0, 10+1):
        pb.draw(i, 10)
        time.sleep(0.1)

