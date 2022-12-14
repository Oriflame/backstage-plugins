---
'@oriflame/backstage-plugin-score-card': minor
---

Allow any entity to be scored.

BREAKING CHANGES:

- `SystemScore` is renamed to `EntityScore` (and in a similar fashion all other `System*` components)
- `systemEntityName` in `EntityScore` is replaced by `entityRef`
- URL path to json files is changed from `{jsonDataUrl}/{systemEntityName}.json` to `{jsonDataUrl}/{entity-namespace}/{entity-kind}/{entity-name}.json`
