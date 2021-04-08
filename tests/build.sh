#!/bin/bash

yarn build

npm pack

mkdir ./build 2>/dev/null || true
mv -f papr*.tgz ./build/papr.tgz

cd tests/esm/
npm install
node --experimental-specifier-resolution=node ./index.js

cd ../cjs/
npm install
node ./index.js