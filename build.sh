#!/bin/bash

set -euxo pipefail

# ESM

tsc --project ./tsconfig-esm.json

sed -i "s/from '.\/\(.*\)';/from '.\/\1.js';/g" ./esm/*.js

# CommonJS

tsc --project ./tsconfig-cjs.json

echo "{\"type\":\"commonjs\"}" > ./cjs/package.json
