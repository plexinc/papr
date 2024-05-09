#!/bin/bash

set -euo pipefail

./tests/build.sh

cd tests/esm/
rm -f package-lock.json
node -v
pnpm install
cd ../..

cd tests/cjs/
rm -f package-lock.json
node -v
pnpm install
cd ../..

cd tests/ts/
rm -f package-lock.json
rm -f ./dist/*
node -v
pnpm install
./node_modules/.bin/tsc --project ./tsconfig.json
cd ../..

cd tests/ts-nodenext/
rm -f package-lock.json
rm -f ./dist/*
node -v
pnpm install
./node_modules/.bin/tsc --project ./tsconfig.json
cd ../..
