# backstage-plugins

Oriflame Backstage plugins.

## Getting started

You may find our plugins in the `./plugins` folder. You may start each plugin in isolated mode (navigate to the plugin folder and run `yarn dev` or `yarn start:dev`, see respective README). You may start also the simple backstage host with the plugins integrated via `yarn dev` (in root folder). You may run `yarn test` to run jest tests. For more information see [CONTRIBUTING.md](./CONTRIBUTING.md).

## List of plugins

Name | Version | Description
---------|----------|----------
 [score-card](https://github.com/Oriflame/backstage-plugins/blob/main/plugins/score-card/README.md) | [![npm version](https://badge.fury.io/js/@oriflame%2Fbackstage-plugin-score-card.svg)](https://badge.fury.io/js/@oriflame%2Fbackstage-plugin-score-card) | Main idea behind it comes from a need to somehow visualize maturity of our services and to establish a process how to improve it (discuss with the teams what to focus on next).

## Workflows

We use GitHub actions to check build, unit & end to end test and other validations during pull requests. We use them also to prepare releases and publish npm packages.

In overview:

- create branch, commit changes, run `yarn changeset`, commit and create PR -> [CI workflow](#ci-workflow) will run
- once merged to `main` (on push) [Prepare release PR workflow](#prepare-release-pr-workflow) -> `Release new version(s)` pull request is created automatically. It shall increase versions of packages and update changelogs in respective plugins and cleanup the `.changeset` folder.
- once this PR is merged to `main` [Release and publish Workflow](#release-and-publish-workflow) will create a new release on GitHub and also publishes changed plugins.

### CI workflow

[![CI pipeline](https://github.com/Oriflame/backstage-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/Oriflame/backstage-plugins/actions/workflows/ci.yml)

Source: `.github/workflows/ci.yml`

Shall be executed during `pull requests` to validate changes and also during push to `main` branch to keep validating the main trunk.

## Prepare release PR workflow

[![Prepare release PR workflow](https://github.com/Oriflame/backstage-plugins/actions/workflows/release-prepare.yml/badge.svg)](https://github.com/Oriflame/backstage-plugins/actions/workflows/release-prepare.yml)

Source: `.github/workflows/release-prepare.yml`

Shall be executed on push to `main`. It runs `yarn release` = increase versions of packages and update changelogs in respective plugins and cleanup the `.changeset` folder. It comit the changes in a new branch and prepare a new PR `Release new version(s)`.

### Release and publish Workflow

[![Release and publish Workflow](https://github.com/Oriflame/backstage-plugins/actions/workflows/release-publish.yml/badge.svg)](https://github.com/Oriflame/backstage-plugins/actions/workflows/release-publish.yml)

Source: `.github/workflows/ci.yml`

Shall be executed on push to `main`. In case the package versions are changed (which are by the previous PR) it creates a new release on GitHub and also publishes changed plugins to npm repository.

### Renovate: Validate configuration

[![Renovate: Validate configuration](https://github.com/Oriflame/backstage-plugins/actions/workflows/renovate-validation.yml/badge.svg)](https://github.com/Oriflame/backstage-plugins/actions/workflows/renovate-validation.yml)

Source: `.github/workflows/renovate-changesets.yml`

Shall be executed during `pull requests` when `renovate.json` changes to validate the changes. 

### Renovate: Generate changeset

[![Renovate: Generate changeset](https://github.com/Oriflame/backstage-plugins/actions/workflows/renovate-changesets.yml/badge.svg)](https://github.com/Oriflame/backstage-plugins/actions/workflows/renovate-changesets.yml)

Source: `.github/workflows/renovate-changesets.yml`

Shall be executed during `pull requests`. In case the package versions are changed (and the PR was created by renovate bot) it pushes automatically generated `.changesets` entries.

## Thank you note

When creating this repository (pipelines, e2e tests, monorepo setup...) we were inspired a lot by a following repository [roadie-backstage-plugins](https://github.com/RoadieHQ/roadie-backstage-plugins).
