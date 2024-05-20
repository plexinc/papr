#!/bin/bash

set -euo pipefail

./tests/build.sh

cd tests/esm/
node -v
node ./index.js
cd ../..

cd tests/cjs/
node -v
node ./index.js
cd ../..

cd tests/ts/
node -v
./node_modules/.bin/tsc --project ./tsconfig.json
node ./dist/index.js
cd ../..

cd tests/ts-nodenext/
node -v
./node_modules/.bin/tsc --project ./tsconfig.json
node ./dist/index.js
cd ../..
