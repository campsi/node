#!/usr/bin/env bash
rm ./node_modules/array-diff
ln -s ../lib/array-diff ./node_modules
rm ./node_modules/campsi
ln -s ../lib/campsi ./node_modules
rm ./node_modules/cheerio-or-jquery
ln -s ../lib/cheerio-or-jquery ./node_modules
rm ./public/components
ln -s ../lib/components ./public
./node_modules/bower/bin/bower install