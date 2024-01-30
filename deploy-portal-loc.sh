#!/bin/bash
echo "Build the view in in test mode"
yarn build
echo "Build completed in build folder, start copying to local folder"
rm -rf /home/steve/lightapi/portal-config-loc/light-gateway/signin/build
cp -r ./build /home/steve/lightapi/portal-config-loc/light-gateway/signin
echo "Copied!"
