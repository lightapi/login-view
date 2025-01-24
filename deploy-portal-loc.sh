#!/bin/bash
echo "Build the view"
yarn build
echo "Build completed in build folder, start copying to local folder"
rm -rf /home/steve/lightapi/portal-config-loc/all-in-one/light-gateway/signin/dist
cp -r ./dist /home/steve/lightapi/portal-config-loc/all-in-one/light-gateway/signin
rm -rf /home/steve/lightapi/portal-config-loc/all-in-one-light/light-gateway/signin/dist
cp -r ./dist /home/steve/lightapi/portal-config-loc/all-in-one-light/light-gateway/signin
echo "Copied!"
