#!/usr/bin/env bash
rm -f ./public/components
ln -s ../lib/components ./public
ln -s ../lib/campsi-components ./public
./node_modules/bower/bin/bower install