#!/usr/bin/env bash
rm -f ./public/components
ln -s ../../lib/campsi-components/ ./lib/components/campsi
ln -s ../lib/components ./public
./node_modules/bower/bin/bower install