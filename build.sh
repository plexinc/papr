#!/bin/bash

set -euxo pipefail

# ESM

yarn tsc --project ./tsconfig-esm.json

# https://stackoverflow.com/a/22084103
# This works in Linux and MacOS
sed -i.backup -e "s/from '.\/\(.*\)';/from '.\/\1.js';/g" ./esm/*.js
rm ./esm/*.js.backup

# CommonJS

yarn tsc --project ./tsconfig-cjs.json

echo "{\"type\":\"commonjs\"}" > ./cjs/package.json
