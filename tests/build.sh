#!/bin/bash

set -euo pipefail

yarn build

npm pack

mkdir ./build 2>/dev/null || true
mv -f papr*.tgz ./build/papr.tgz
tar xf ./build/papr.tgz --directory=./build/

cd tests/esm/
rm -f package-lock.json
npm install
node ./index.js

cd ../cjs/
rm -f package-lock.json
npm install
node ./index.js