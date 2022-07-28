# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [7.1.0](https://github.com/plexinc/papr/compare/v7.0.1...v7.1.0) (2022-07-28)


### Features

* Support for mongodb v4.8.1 ([#262](https://github.com/plexinc/papr/issues/262)) ([0b86f01](https://github.com/plexinc/papr/commit/0b86f01954cd6a9370ae7fd3924b6e862cf94473))

### [7.0.1](https://github.com/plexinc/papr/compare/v7.0.0...v7.0.1) (2022-07-05)


### Bug Fixes

* Customisable Hook context type ([#258](https://github.com/plexinc/papr/issues/258)) ([26d4628](https://github.com/plexinc/papr/commit/26d4628ef1fef0ca9266d4a4c6d21c3fc53313e7))

## [7.0.0](https://github.com/plexinc/papr/compare/v6.0.0...v7.0.0) (2022-07-05)


### ⚠ BREAKING CHANGES

* The hook parameters have been merged into a single object parameter.

### Features

* Send result to the after hook parameters ([#242](https://github.com/plexinc/papr/issues/242)) ([cef1536](https://github.com/plexinc/papr/commit/cef1536ba7eff4c2e6b52a2106eb88b9bff2149f))


### Bug Fixes

* Update sed command for macOS ([#234](https://github.com/plexinc/papr/issues/234)) ([0b6c476](https://github.com/plexinc/papr/commit/0b6c47620e670ac00ae42681b7f9f74c478e8112))

## [6.0.0](https://github.com/plexinc/papr/compare/v5.0.0...v6.0.0) (2022-06-15)


### ⚠ BREAKING CHANGES

* Arrays will no longer default to type (T | undefined)[]

### Features

* Make array members non-optional by default ([#231](https://github.com/plexinc/papr/issues/231)) ([2c52719](https://github.com/plexinc/papr/commit/2c52719f0025c85760c3d5a82660cdb5cf2c8c5b))

## [5.0.0](https://github.com/plexinc/papr/compare/v4.0.0...v5.0.0) (2022-06-02)


### ⚠ BREAKING CHANGES

* Removed undocumented support for a custom model generic type in
the `model()` function.

* Remove custom model type support ([#219](https://github.com/plexinc/papr/issues/219)) ([8675ffa](https://github.com/plexinc/papr/commit/8675ffa0cfcf247c85f41ed2254b497ae3cd1ff1))

## [4.0.0](https://github.com/plexinc/papr/compare/v3.0.1...v4.0.0) (2022-05-30)


### ⚠ BREAKING CHANGES

* `bulkWrite` operations types updated to handle defaults
for attributes.

Required changes: The defaults model type needs to be passed to any usage
of the `BulkWriteOperation` type.

### Features

* Better `bulkWrite` types for insert operations ([#211](https://github.com/plexinc/papr/issues/211)) ([8ae6182](https://github.com/plexinc/papr/commit/8ae6182d871fc6daec346884b3ed5bb2333d4964))

### [3.0.1](https://github.com/plexinc/papr/compare/v3.0.0...v3.0.1) (2022-05-26)


### Bug Fixes

* Allow explicit optional types on schemas ([#207](https://github.com/plexinc/papr/issues/207)) ([716dbb4](https://github.com/plexinc/papr/commit/716dbb404092162aa438eeb05dfa2afa393b735f))

## [3.0.0](https://github.com/plexinc/papr/compare/v2.3.0...v3.0.0) (2022-04-13)


### ⚠ BREAKING CHANGES

* `schema()` generic types have changed.

### Bug Fixes

* bump minimist from 1.2.5 to 1.2.6 ([#180](https://github.com/plexinc/papr/issues/180)) ([b9d5cea](https://github.com/plexinc/papr/commit/b9d5cea0713b286352790703e27365528fe02dd2))
* bump prismjs from 1.25.0 to 1.27.0 ([7c0d1d2](https://github.com/plexinc/papr/commit/7c0d1d212e3a63979ece1ced78f4d4999f7c95ca))
* Improve defaults type at schema declaration ([#178](https://github.com/plexinc/papr/issues/178)) ([efa5d92](https://github.com/plexinc/papr/commit/efa5d92b1ed47a4145b5bac7e27c1793ca029954))

## [2.3.0](https://github.com/plexinc/papr/compare/v2.2.0...v2.3.0) (2022-03-03)


### Features

* Support nested fields in projection ([#155](https://github.com/plexinc/papr/issues/155)) ([6ed7ba1](https://github.com/plexinc/papr/commit/6ed7ba12cc0216d1156d155f7a6eb0985b34bc0b))


### Bug Fixes

* bump node-fetch from 2.6.1 to 2.6.7 ([cb25d05](https://github.com/plexinc/papr/commit/cb25d05bdceb0d51ebee42ef87da868c67f40c26))
* bump shelljs from 0.8.4 to 0.8.5 ([#149](https://github.com/plexinc/papr/issues/149)) ([2ee4a30](https://github.com/plexinc/papr/commit/2ee4a30e6d99cad06339a1b290d29d25e8114a13))
* bump trim-off-newlines from 1.0.1 to 1.0.3 ([#152](https://github.com/plexinc/papr/issues/152)) ([6ed3ccd](https://github.com/plexinc/papr/commit/6ed3ccd1923d06a53e7210441f0e4f68e9e77782))

## [2.2.0](https://github.com/plexinc/papr/compare/v2.1.1...v2.2.0) (2021-12-02)


### Features

* Use mongodb v4.2.1 ([#141](https://github.com/plexinc/papr/issues/141)) ([a17e53f](https://github.com/plexinc/papr/commit/a17e53fcab7d0c307c11bce99728da625a484e68))


### Bug Fixes

* Support enum type with array of const values ([#133](https://github.com/plexinc/papr/issues/133)) ([f39003f](https://github.com/plexinc/papr/commit/f39003f29538826821554405ec656740dd2ab621))

### [2.1.1](https://github.com/plexinc/papr/compare/v2.1.0...v2.1.1) (2021-11-08)


### Bug Fixes

* bump normalize-url from 4.5.0 to 4.5.1 ([ebd58c2](https://github.com/plexinc/papr/commit/ebd58c20eda7c38bcf510ecbbb1d22fa7763e4db))
* bump path-parse from 1.0.6 to 1.0.7 ([e85b312](https://github.com/plexinc/papr/commit/e85b312f377e4736d39252378d2aeb60c2e08c1a))
* bump prismjs from 1.23.0 to 1.25.0 ([682db15](https://github.com/plexinc/papr/commit/682db15b9c254cf2306597c9c1bcca3a84449846))
* bump tmpl from 1.0.4 to 1.0.5 ([5907415](https://github.com/plexinc/papr/commit/5907415468d11d78a3a9e671a52a46fe8c7fb102))
* bump ws from 7.4.5 to 7.5.5 ([4962e37](https://github.com/plexinc/papr/commit/4962e3732e10e703d3b85f8c615b3ebcfc8e614c))
* ESM build with file extensions ([#122](https://github.com/plexinc/papr/issues/122)) ([b81a6de](https://github.com/plexinc/papr/commit/b81a6de3c67a779fef4ffa77ff26efc69d8e4c4d))

## [2.1.0](https://github.com/plexinc/papr/compare/v2.0.3...v2.1.0) (2021-09-02)


### Features

* Model.findOneAndDelete ([#75](https://github.com/plexinc/papr/issues/75)) ([c555246](https://github.com/plexinc/papr/commit/c55524668343e196fec65241cb778a1a4694c06a))
* Support IDs with strings or numbers ([#74](https://github.com/plexinc/papr/issues/74)) ([3e793cb](https://github.com/plexinc/papr/commit/3e793cbd40ad3539fda39b5436a1df7665e84f41))


### Bug Fixes

* Fix insert and projection types ([#72](https://github.com/plexinc/papr/issues/72)) ([344abab](https://github.com/plexinc/papr/commit/344abab587b4850351c535b8282184871a6afb9c))

### [2.0.3](https://github.com/plexinc/papr/compare/v2.0.2...v2.0.3) (2021-08-25)


### Bug Fixes

* Require mongodb >=v4.1.1 ([125d928](https://github.com/plexinc/papr/commit/125d928a2bf9175134a6ba672bdd98fb74854fea))
* Support custom dates in insert operations ([afe201a](https://github.com/plexinc/papr/commit/afe201ac9705f0acc46077dbeb73191b151766a6))

### [2.0.2](https://github.com/plexinc/papr/compare/v2.0.1...v2.0.2) (2021-07-21)


### Bug Fixes

* Filter defaults in bulkWrite to avoid conflicts ([#42](https://github.com/plexinc/papr/issues/42)) ([28d3fb4](https://github.com/plexinc/papr/commit/28d3fb489f65ecd97ffb63189421d67635cbec0e))

### [2.0.1](https://github.com/plexinc/papr/compare/v2.0.0...v2.0.1) (2021-07-20)


### Bug Fixes

* Apply defaults in bulkWrite updateOne operations ([#41](https://github.com/plexinc/papr/issues/41)) ([ee84388](https://github.com/plexinc/papr/commit/ee8438888cc3e57a90efe7fb00cfe82d441edd0e))

## [2.0.0](https://github.com/plexinc/papr/compare/v1.0.1...v2.0.0) (2021-07-15)


### ⚠ BREAKING CHANGES

* Requires peer dependency mongodb v4.*
* TypeScript types have changed - now using the embedded types from mongodb package.

### Features

* Use mongodb v4.* ([#36](https://github.com/plexinc/papr/issues/36)) ([74a5586](https://github.com/plexinc/papr/commit/74a55863b9229edfc2118b3a2b27fda13f4f43c5))


### Bug Fixes

* Customize benchmark db name via CLI arg ([#32](https://github.com/plexinc/papr/issues/32)) ([a159933](https://github.com/plexinc/papr/commit/a1599337a2909ba985b586816db4805d8768c7bc))
* Customize mongo URL in benchmark tool ([#19](https://github.com/plexinc/papr/issues/19)) ([2cfac08](https://github.com/plexinc/papr/commit/2cfac08a0e304eaf9b3ed027b70281e11086710a))

### [1.0.1](https://github.com/plexinc/papr/compare/v1.0.0...v1.0.1) (2021-06-04)


### Bug Fixes

* Use returnDocument instead of returnOriginal ([#7](https://github.com/plexinc/papr/issues/7)) ([bbbb651](https://github.com/plexinc/papr/commit/bbbb6519b98b64ff20b066955e4c613b24d37792))

## 1.0.0 (2021-05-10)


### Features

* Initial public commit ([740b1ef](https://github.com/plexinc/papr/commit/740b1efb5fd63db9e7d5bd50366fc78f4d458f3d))
