---
'@oriflame/backstage-plugin-score-card': minor
---

Upgraded to Backstage core 1.22.1, support for React v18, Node 20, Cypress e2e test migrated to [Playwright](https://playwright.dev/) and more.

BREAKING CHANGES:

- `EntityScoreExtended` new required property `id:string` added to fullfill the Material UI Table row ID needs. Fix your clients by providing e.g. `stringifyEntityRef(score.entityRef)` as a value for the id.
