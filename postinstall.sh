#!/usr/bin/env bash
rm -f ./public/components
ln -s ../lib/components ./public
./node_modules/bower/bin/bower install