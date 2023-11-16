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
import React from 'react';
import { act, render } from '@testing-library/react';
import { ScoreCardTable, ScoreTable } from './ScoreCardTable';
import { TestApiProvider } from '@backstage/test-utils';
import { ScoringDataApi, scoringDataApiRef } from '../../api';
import { Entity } from '@backstage/catalog-model';
import { EntityScoreExtended } from '../../api/types';
import { errorApiRef, githubAuthApiRef } from '@backstage/core-plugin-api';
import { lightTheme } from '@backstage/theme';
import { ThemeProvider } from '@material-ui/core';
import { MemoryRouter as Router } from 'react-router-dom';
import { EntityProvider } from '@backstage/plugin-catalog-react';

// entity Object
const entity = {
  metadata: {
    namespace: 'default',
    annotations: {
      'backstage.io/managed-by-location':
        'url:https://github.com/philips-greenroom-test/sonar-test10/tree/master/catalog-info.yaml',
      'backstage.io/managed-by-origin-location':
        'url:https://github.com/philips-greenroom-test/sonar-test10/blob/master/catalog-info.yaml',
      'backstage.io/view-url':
        'https://github.com/philips-greenroom-test/sonar-test10/tree/master/catalog-info.yaml',
      'backstage.io/edit-url':
        'https://github.com/philips-greenroom-test/sonar-test10/edit/master/catalog-info.yaml',
      'backstage.io/source-location':
        'url:https://github.com/philips-greenroom-test/sonar-test10/tree/master/',
      'backstage.io/techdocs-ref': 'dir:.',
      'github.com/project-slug': 'philips-greenroom-test/sonar-test10',
      'scorecard/jsonDataUrl': 'score.json',
    },
    name: 'sonar-test10',
    title: 'sonar-test10',
    description: 'A demo sonar-test repo',
    links: [
      {
        url: 'https://some-demo.philips-internal.com',
        title: 'Demo',
        icon: 'dashboard',
      },
    ],
    uid: '41af856a-8f58-45bb-9a27-d8f5bb1fd8e3',
    etag: '9abe92f7496bc40f8022eb5232f08d64c45ea609',
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  spec: {
    type: 'website',
    owner: 'swcoe',
    lifecycle: 'experimental',
  },
  relations: [
    {
      type: 'ownedBy',
      targetRef: 'group:default/swcoe',
      target: {
        kind: 'group',
        namespace: 'default',
        name: 'swcoe',
      },
    },
  ],
};
const mockAuth = {
  getAccessToken: jest.fn(),
};

const authObj: any = {
  sessionManager: {
    connector: {
      discoveryApi: {
        parts: ['http://localhost:3000/api/', ''],
      },
      environment: 'development',
      provider: {
        id: 'github',
        title: 'GitHub',
      },
      enableExperimentalRedirectFlow: true,
    },
    helper: {
      options: {
        defaultScopes: {},
      },
    },
    stateTracker: {
      subject: {
        isClosed: false,
        currentValue: 'SignedIn',
        observable: {},
        subscribers: {},
      },
      signedIn: true,
    },
    currentSession: {
      backstageIdentity: {
        token:
          'eyJhbGciOiJFUzI1NiIsImtpZCI6IjAzZjlhOTBmLTYyZTgtNGZjNC04MzUxLTkyYjI2Yzg4MDIyMSJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXBpL2F1dGgiLCJzdWIiOiJ1c2VyOmRlZmF1bHQvcHJhdGVlay13YXluZSIsImVudCI6WyJ1c2VyOmRlZmF1bHQvcHJhdGVlay13YXluZSJdLCJhdWQiOiJiYWNrc3RhZ2UiLCJpYXQiOjE2OTg5MjI2MzQsImV4cCI6MTY5ODkyNjIzNH0.IqKYOPwT9aJZu_OTqOmWxGirYjP3JSRRB7zIYyswmnRgcR302EzTXTeDfPzKgAup_i975pdUL97AsU3_TuhNXw',
        identity: {
          type: 'user',
          userEntityRef: 'user:default/prateek-wayne',
          ownershipEntityRefs: ['user:default/prateek-wayne'],
        },
      },
      providerInfo: {
        accessToken: 'ghu_FxFTgI9kxSxNDwZvcf8mCDq33Ue38J0ZcLWs',
        scopes: {},
        expiresAt: '2023-11-02T11:57:14.173Z',
      },
      profile: {
        email: 'lordprateekverma@gmail.com',
        picture: 'https://avatars.githubusercontent.com/u/114328592?v=4',
        displayName: 'Prateek Wayne',
      },
    },
  },
  getAccessToken: async () => {
    return '12345';
  },
};

const sharedGithubAuthApi = authObj;

describe('ScoreBoardPage-EmptyData', () => {
  class MockClient implements ScoringDataApi {
    getScore(
      _entity?: Entity | undefined,
    ): Promise<EntityScoreExtended | undefined> {
      throw new Error('Method not implemented.');
    }
    getAllScores(): Promise<EntityScoreExtended[] | undefined> {
      return new Promise<EntityScoreExtended[] | undefined>(
        (resolve, _reject) => {
          resolve([]);
        },
      );
    }
  }

  const mockClient = new MockClient();

  it('should render a progress bar', async () => {
    jest.useFakeTimers();

    const errorApi = { post: () => {} };
    const { getByTestId, findByTestId } = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider
          apis={[
            [errorApiRef, errorApi],
            [scoringDataApiRef, mockClient],
            [githubAuthApiRef, mockAuth],
          ]}
        >
          <EntityProvider entity={entity}>
            <ScoreCardTable />
          </EntityProvider>
        </TestApiProvider>
      </ThemeProvider>,
    );

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(getByTestId('progress')).toBeInTheDocument();

    await findByTestId('score-board-table');
    jest.useRealTimers();
  });
});

describe('ScoreCard-TestWithData', () => {
  class MockClient implements ScoringDataApi {
    getScore(
      _entity?: Entity | undefined,
    ): Promise<EntityScoreExtended | undefined> {
      throw new Error('Method not implemented.');
    }
    getAllScores(): Promise<EntityScoreExtended[] | undefined> {
      return new Promise<EntityScoreExtended[] | undefined>(
        (resolve, _reject) => {
          const sampleData = require('../../../sample-data/all.json');
          resolve(sampleData);
        },
      );
    }
  }

  const mockClient = new MockClient();

  // TODO: find how to stop render the progress bar and display the ScoreCardTable
  // eslint-disable-next-line jest/no-commented-out-tests
  // it('should render title', async () => {
  //   jest.useFakeTimers();

  //   const errorApi = { post: () => {} };
  //   const { container } = render(
  //     <ThemeProvider theme={lightTheme}>
  //       <TestApiProvider
  //         apis={[
  //           [errorApiRef, errorApi],
  //           [scoringDataApiRef, mockClient],
  //         ]}
  //       >
  //         <ScoreCardTable title="Custom title"/>
  //       </TestApiProvider>
  //     </ThemeProvider>,
  //   );

  //   expect(container).toHaveTextContent('Custom title');
  // });

  it('should render scoreLabel', async () => {
    const errorApi = { post: () => {} };
    const { getByText, findByTestId } = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider
          apis={[
            [errorApiRef, errorApi],
            [scoringDataApiRef, mockClient],
            [githubAuthApiRef, mockAuth],
          ]}
        >
          <Router>
            <EntityProvider entity={entity}>
              <ScoreCardTable />
            </EntityProvider>
          </Router>
        </TestApiProvider>
      </ThemeProvider>,
    );

    await findByTestId('score-board-table');

    const podcastColumn = await getByText('podcast');
    const podcastRow = podcastColumn.closest('tr');

    expect(podcastRow).toHaveTextContent('podcastsystemAB+DFFC');
  });

  it('should render title', async () => {
    jest.useFakeTimers();

    const errorApi = { post: () => {} };
    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider
          apis={[
            [errorApiRef, errorApi],
            [scoringDataApiRef, mockClient],
            [githubAuthApiRef, sharedGithubAuthApi],
          ]}
        >
          <Router>
            <EntityProvider entity={entity}>
              <ScoreCardTable title="testTitle" />
            </EntityProvider>
          </Router>
        </TestApiProvider>
      </ThemeProvider>,
    );

    expect(container).toBeInTheDocument();
  });
});

describe('ScoreCardTable', () => {
  class MockClient implements ScoringDataApi {
    getScore(
      _entity?: Entity | undefined,
      _auth?: typeof githubAuthApiRef | undefined,
    ): Promise<EntityScoreExtended | undefined> {
      return new Promise<EntityScoreExtended | undefined>(
        (resolve, _reject) => {
          resolve(undefined);
        },
      );
    }
    getAllScores(): Promise<EntityScoreExtended[] | undefined> {
      return new Promise<EntityScoreExtended[] | undefined>(
        (resolve, _reject) => {
          const sampleData = require('dymmy');
          resolve(sampleData);
        },
      );
    }
  }

  const mockClient = new MockClient();

  it('should render title2', async () => {
    jest.useFakeTimers();

    const errorApi = { post: () => {} };
    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider
          apis={[
            [errorApiRef, errorApi],
            [scoringDataApiRef, mockClient],
            [githubAuthApiRef, sharedGithubAuthApi],
          ]}
        >
          <Router>
            <EntityProvider entity={entity}>
              <ScoreTable scores={[]} />
            </EntityProvider>
          </Router>
        </TestApiProvider>
      </ThemeProvider>,
    );

    expect(container).toHaveTextContent(/Score/i);
    expect(container).toHaveTextContent(/Reviewer/i);
    expect(container).toHaveTextContent(/Date/i);
    expect(container).toBeInTheDocument();
  });
});
