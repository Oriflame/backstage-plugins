# backstage-plugins

Oriflame Backstage plugins.

[![CI pipeline](https://github.com/Oriflame/backstage-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/Oriflame/backstage-plugins/actions/workflows/ci.yml)

[![CD pipeline](https://github.com/Oriflame/backstage-plugins/actions/workflows/cd.yml/badge.svg)](https://github.com/Oriflame/backstage-plugins/actions/workflows/cd.yml)

## Getting started

You may find our plugins in the `./plugins` folder. You may start each plugin in isolated mode (navigate to the plugin folder and run `yarn dev` or `yarn start:dev`, see respective README). You may start also the simple backstage host with the plugins integrated via `yarn dev` (in root folder). You may run `yarn test` to run jest tests. For more information see [CONTRIBUTING.md](./CONTRIBUTING.md).

## List of plugins

Name | Description
---------|----------
 [score-card](https://github.com/Oriflame/backstage-plugins/blob/main/plugins/score-card/README.md) | Main idea behind it comes from a need to somehow visualize maturity of our services and to establish a process how to improve it (discuss with the teams what to focus on next).

## Thank you note

When creating this repository (pipelines, e2e tests, monorepo setup...) we were inspired a lot by a following repository [roadie-backstage-plugins](https://github.com/RoadieHQ/roadie-backstage-plugins).
