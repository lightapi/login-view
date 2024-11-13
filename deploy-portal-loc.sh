#!/bin/bash
echo "Build the view in in test mode"
yarn build-tst
echo "Build completed in build folder, start copying to local folder"
rm -rf /home/steve/lightapi/portal-config-loc/light-gateway/signin/dist
cp -r ./dist /home/steve/lightapi/portal-config-loc/light-gateway/signin
echo "Copied!"
