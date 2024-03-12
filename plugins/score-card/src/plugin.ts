/*
 * Copyright 2022 Oriflame
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  createPlugin,
  createRoutableExtension,
  createComponentExtension,
  createApiFactory,
  fetchApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import { scmAuthApiRef } from '@backstage/integration-react';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ScoringDataJsonClient, scoringDataApiRef } from './api';
import { rootRouteRef } from './routes';

export { ScoreCardTable } from './components/ScoreCardTable';

export const scoreCardPlugin = createPlugin({
  id: 'score-card',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: scoringDataApiRef,
      deps: {
        configApi: configApiRef,
        catalogApi: catalogApiRef,
        fetchApi: fetchApiRef,
        scmAuthApi: scmAuthApiRef,
      },
      factory: ({ configApi, catalogApi, fetchApi, scmAuthApi }) => {
        return new ScoringDataJsonClient({
          configApi,
          catalogApi,
          fetchApi,
          scmAuthApi,
        });
      },
    }),
  ],
});

export const ScoreBoardPage = scoreCardPlugin.provide(
  createRoutableExtension({
    name: 'score-board-page',
    component: () =>
      import('./components/ScoreBoardPage').then(m => m.ScoreBoardPage),
    mountPoint: rootRouteRef,
  }),
);

export const EntityScoreCardContent = scoreCardPlugin.provide(
  createComponentExtension({
    name: 'score-board-card',
    component: {
      lazy: () => import('./components/ScoreCard').then(m => m.ScoreCard),
    },
  }),
);

export const EntityScoreBoardTable = scoreCardPlugin.provide(
  createComponentExtension({
    name: 'score-board-entity-table',
    component: {
      lazy: () =>
        import('./components/EntityScoreBoardTable').then(
          m => m.EntityScoreBoardTable,
        ),
    },
  }),
);
