# Contributing

Contributions are always welcome, no matter how large or small!

When contributing to this repository, please first discuss the change you wish to make via an issue with the owners of this repository before making a change.

Please follow the [code of conduct](CODE_OF_CONDUCT.md) in all your interactions with the project.

## Developer Startup Guide

This section will walk you through how to get started working with the code.

### Environment

Verify that node.js is [installed](https://nodejs.org/en/download/).

Verify that Yarn v1 is [installed](https://classic.yarnpkg.com/en/docs/install).

Alternatively, we recommend you install [Volta](https://volta.sh) to run the correct node.js and package manager versions for this project.

All code changes must work on the minimum Node version specified in [package.json](./package.json) under the `engines` key.

### Setup

[Fork](https://help.github.com/articles/fork-a-repo/) the `papr` repository to your GitHub Account.

Then, run:

```sh
$ git clone https://github.com/<your-github-username>/papr
$ cd papr
$ yarn
```

### Running tests

Unit tests:

```sh
$ yarn test
```

TypeScript tests:

```sh
$ yarn test:types
```

Linting tests:

```sh
$ yarn lint
```

Running tests in watch mode:

```sh
$ yarn watch
$ yarn watch:types
```

### Commit messages

This repository follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.

The format should look something like the following (note the blank lines):

```txt
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

The types allowed are the types enforced by the [`@commitlint/config-conventional`](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) package:

- `build`
- `chore`
- `ci`
- `docs`
- `feat`
- `fix`
- `perf`
- `refactor`
- `revert`
- `style`
- `test`

This helps us automate the [HISTORY.md](HISTORY.md) generation.

This repository follows [semver](https://semver.org/) versioning. The metadata from the commit messages is used when determining the next version to be released:

- major versions: `feat` commits with `BREAKING CHANGE` labels inside the commit footer
- minor versions: `feat` commits
- patch versions: all non-`feat` commits

## Pull Request Process

1. Create your branch from `main`
1. Make your code or other changes.
1. Add or update relevant unit/type tests.
1. Push the code to your forked repository and open a draft pull request (please follow the guidelines in [How to write the perfect pull request](https://blog.github.com/2015-01-21-how-to-write-the-perfect-pull-request/))
1. Perform a self-review using the reviewer guidelines below prior to taking the PR out of draft state.

### Reviewer Guidelines

Reviewers should use the following questions to evaluate the implementation for correctness/completeness and ensure all housekeeping items have been addressed prior to merging the code.

- Correctness/completeness

  1. Do you fully understand the implementation? (Would you be comfortable explaining how this code works to someone else?)
  1. Is the intention of the code captured in relevant tests?
     - Does the description of each test accurately represent the assertions?
     - For any test explicitly called out on the issue as desirable to implement, was it implemented?
  1. Could these changes impact any adjacent functionality?
  1. Are there any errors that might not be correctly caught or propagated?
  1. Is there anything that could impact performance?
  1. Can you think of a better way to implement any of the functional code or tests? "Better" means any combination of:
     - more performant
     - better organized / easier to understand / clearer separation of concerns
     - easier to maintain (easier to change, harder to accidentally break)

- Housekeeping

  1. Does the title and description of the PR reference the correct issue and does it use the correct conventional commit type (e.g., fix, feat, test, breaking change etc)?
  1. If there are new TODOs, has a related issue been created?
  1. Should any documentation be updated?
