# @oriflame/backstage-plugin-score-card

## 0.7.1

### Patch Changes

- 7b37b37: Added a configuration option to fetch all entities from the catalog to avoid "414 Request-URI Too Large" error (fix #184)

## 0.7.0

### Minor Changes

- bd30933: wikiLinkTemplate is now optionnal

## 0.6.3

### Patch Changes

- e8c6214: Bumped backstage core libs from 1.8.3 to 1.10.1

## 0.6.2

### Patch Changes

- bbcae3e: Propagate title, subtitle and ScoreCardTableProps to ScoreBoardPage

## 0.6.1

### Patch Changes

- d434c7d: Add property to filter scores by entity kind.

## 0.6.0

### Minor Changes

- ec3991d: Allow any entity to be scored.

  BREAKING CHANGES:

  - `SystemScore` is renamed to `EntityScore` (and in a similar fashion all other `System*` components)
  - `systemEntityName` in `EntityScore` is replaced by `entityRef`
  - URL path to json files is changed from `{jsonDataUrl}/{systemEntityName}.json` to `{jsonDataUrl}/{entity-namespace}/{entity-kind}/{entity-name}.json`

### Patch Changes

- 398f28d: bump version for backstage core components to 1.8.3

## 0.5.7

### Patch Changes

- 111a8c1: Fix ScoreCardTable export and update its documentation

## 0.5.6

### Patch Changes

- 3a2f7b5: Expose ScoreCardTable for usage outside ScoreBoardPage

## 0.5.5

### Patch Changes

- 12cb1f1: Improve extensibility by adding `scoreLabel`, to override `scorePercent` and adding a `title` prop to ScoreCardTable component

## 0.5.4

### Patch Changes

- ac868b1: bumped to 1.7.0 backstage core version

## 0.5.3

### Patch Changes

- 71b3b50: revert of React18 support

## 0.5.2

### Patch Changes

- 4da6557: Updated dependency `react` to `^16.13.1 || ^17.0.0 || ^18.0.0`.
  Updated dependency `react-dom` to `^16.13.1 || ^17.0.0 || ^18.0.0`.

## 0.5.1

### Patch Changes

- d697d52: Bumped to backstage-core 1.6.0

## 0.5.0

### Minor Changes

- a94816d: New config [wikiLinkTemplate]

## 0.4.2

### Patch Changes

- c9c49d1: Fixed repository url (package metadata)

## 0.4.1

### Patch Changes

- bumped dependencies
