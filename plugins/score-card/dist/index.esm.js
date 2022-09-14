import { createRouteRef, createPlugin, createRoutableExtension, createComponentExtension } from '@backstage/core-plugin-api';

const rootRouteRef = createRouteRef({
  title: "score-card"
});

const scoreCardPlugin = createPlugin({
  id: "score-card",
  routes: {
    root: rootRouteRef
  }
});
const ScoreCardPage = scoreCardPlugin.provide(createRoutableExtension({
  component: () => import('./esm/index-7f05ec57.esm.js').then((m) => m.ScoreCardPage),
  mountPoint: rootRouteRef
}));
const EntityScoreCardContent = scoreCardPlugin.provide(createComponentExtension({
  component: {
    lazy: () => import('./esm/index-58678c00.esm.js').then((m) => m.ScoreCard)
  }
}));

export { EntityScoreCardContent, ScoreCardPage, scoreCardPlugin };
//# sourceMappingURL=index.esm.js.map
