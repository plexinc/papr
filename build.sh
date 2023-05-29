#!/bin/bash

set -euxo pipefail

# ESM

pnpm tsc --project ./tsconfig-esm.json

# https://stackoverflow.com/a/22084103
# This works in Linux and MacOS
sed -i.backup -e "s/from '.\/\(.*\)';/from '.\/\1.js';/g" ./esm/*.js
sed -i.backup -e "s/from '.\/\(.*\)';/from '.\/\1.js';/g" ./esm/*.d.ts
rm ./esm/*.js.backup
rm ./esm/*.d.ts.backup

# CommonJS

pnpm tsc --project ./tsconfig-cjs.json

echo "{\"type\":\"commonjs\"}" > ./cjs/package.json
