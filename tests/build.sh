#!/bin/bash

set -euo pipefail

npm pack

mkdir ./build 2>/dev/null || true
mv -f papr*.tgz ./build/papr.tgz
tar xf ./build/papr.tgz --directory=./build/

cd tests/esm/
rm -f package-lock.json
pnpm install
cd ../..

cd tests/cjs/
rm -f package-lock.json
pnpm install
cd ../..

cd tests/ts/
rm -f package-lock.json
rm -f ./dist/*
pnpm install
cd ../..

cd tests/ts-nodenext/
rm -f package-lock.json
rm -f ./dist/*
pnpm install
cd ../..
