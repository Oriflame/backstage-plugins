---
'@oriflame/backstage-plugin-score-card': minor
---

Allow any entity to be scored.

BREAKING CHANGES:

- `systemEntityName` is replaced by `entityRef`
- URL path to json files is changed from `{jsonDataUrl}/{systemEntityName}.json` to `{jsonDataUrl}/{entity-namespace}/{entity-kind}/{entity-name}.json`
