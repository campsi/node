#!/usr/bin/env bash
rm -f ./node_modules/array-diff
ln -s ../lib/array-diff ./node_modules
rm -f ./node_modules/campsi
ln -s ../lib/campsi ./node_modules
rm -f ./node_modules/cheerio-or-jquery
ln -s ../lib/cheerio-or-jquery ./node_modules
rm -f ./node_modules/app-context
ln -s ../lib/app-context ./node_modules
rm -f ./public/components
ln -s ../lib/components ./public
./node_modules/bower/bin/bower install