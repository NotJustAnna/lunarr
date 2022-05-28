#!/usr/bin/env bash

cd $(dirname $0)/../frontend
echo "Building frontend..."
yarn build
echo "Copying frontend to public folder..."
cp -vr build/ ../public/
echo "Done!"
