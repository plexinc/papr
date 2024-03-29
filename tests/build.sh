#!/bin/bash

set -euo pipefail

pnpm build

npm pack

mkdir ./build 2>/dev/null || true
mv -f papr*.tgz ./build/papr.tgz
tar xf ./build/papr.tgz --directory=./build/

cd tests/esm/
rm -f package-lock.json
node -v
pnpm install
node ./index.js
cd ../..

cd tests/cjs/
rm -f package-lock.json
node -v
pnpm install
node ./index.js
cd ../..

cd tests/ts/
rm -f package-lock.json
rm -f ./dist/*
node -v
pnpm install
./node_modules/.bin/tsc --project ./tsconfig.json
node ./dist/index.js
cd ../..

cd tests/ts-nodenext/
rm -f package-lock.json
rm -f ./dist/*
node -v
pnpm install
./node_modules/.bin/tsc --project ./tsconfig.json
node ./dist/index.js
cd ../..
