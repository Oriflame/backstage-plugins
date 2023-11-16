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

import { MockConfigApi, MockFetchApi } from '@backstage/test-utils';
import { CatalogApi } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { ScoringDataJsonClient } from './ScoringDataJsonClient';

import {
  GetEntitiesRequest,
  GetEntitiesResponse,
} from '@backstage/catalog-client';

const mockOctokit = {
  request: jest.fn(),
};

jest.mock('@octokit/rest', () => ({
  Octokit: class {
    constructor() {
      return mockOctokit;
    }
  },
}));

const mockAuth = {
  getAccessToken: jest.fn(),
};

// Catalog items used as mock
const items = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'API',
    metadata: {
      name: 'Api 1',
      annotations: {
        'github.com/project-slug':
          'philips-greenroom-test/rocc-audit-gateway-service',
        'scorecard/jsonDataUrl': 'score.json',
      },
    },
    spec: {
      type: 'openapi',
    },
    relations: [
      {
        type: 'ownedBy',
        targetRef: 'group:default/team1',
      },
    ],
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'System',
    metadata: {
      name: 'System 1',
    },
    spec: {
      type: 'openapi',
    },
    relations: [
      {
        type: 'ownedBy',
        targetRef: 'group:default/team2',
      },
    ],
  },
] as Entity[];

const getEntitiesMock = (
  request?: GetEntitiesRequest,
): Promise<GetEntitiesResponse> => {
  const filterKinds =
    Array.isArray(request?.filter) && Array.isArray(request?.filter[0].kind)
      ? request?.filter[0].kind ?? []
      : [];
  return Promise.resolve({
    items: filterKinds.length
      ? items.filter(item => filterKinds.find(k => k === item.kind))
      : items,
  } as GetEntitiesResponse);
};

const mockedScoreEnt1 = {
  entityRef: {
    kind: 'api',
    name: 'Api 1',
  },
  scorePercent: 75,
  scoringReviewDate: '2022-01-01T08:00:00Z',
  scoringReviewer: { kind: 'User', name: 'Reviewer 1', namespace: 'default' },
  areaScores: [],
};
describe('ScoringDataJsonClient-getAllScores', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(
      jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () =>
            new Promise(resolve => {
              const sampleData = [
                {
                  entityRef: {
                    kind: 'api',
                    name: 'Api 1',
                  },
                  scorePercent: 75,
                  scoringReviewDate: '2022-01-01T08:00:00Z',
                  scoringReviewer: 'Reviewer 1',
                  areaScores: [],
                },
                {
                  entityRef: {
                    kind: 'system',
                    name: 'System 1',
                  },
                  scorePercent: 80,
                  scoringReviewDate: '2022-01-01T08:00:00Z',
                  scoringReviewer: 'Reviewer 2',
                  areaScores: [],
                },
              ];
              resolve(sampleData);
            }),
        }),
      ) as jest.Mock,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should get all scores', async () => {
    const catalogApi: jest.Mocked<CatalogApi> = {
      getEntities: jest.fn(),
    } as any;

    catalogApi.getEntities.mockImplementation(getEntitiesMock);

    const mockConfig = new MockConfigApi({
      app: { baseUrl: 'https://example.com' },
    });
    const mockFetch = new MockFetchApi();

    const expected = [
      {
        areaScores: [],
        entityRef: { kind: 'api', name: 'Api 1' },
        owner: { kind: 'group', name: 'team1', namespace: 'default' },
        reviewDate: new Date('2022-01-01T08:00:00.000Z'),
        reviewer: { kind: 'User', name: 'Reviewer 1', namespace: 'default' },
        scorePercent: 75,
        scoringReviewDate: '2022-01-01T08:00:00Z',
        scoringReviewer: 'Reviewer 1',
      },
      {
        areaScores: [],
        entityRef: { kind: 'system', name: 'System 1' },
        owner: { kind: 'group', name: 'team2', namespace: 'default' },
        reviewDate: new Date('2022-01-01T08:00:00.000Z'),
        reviewer: { kind: 'User', name: 'Reviewer 2', namespace: 'default' },
        scorePercent: 80,
        scoringReviewDate: '2022-01-01T08:00:00Z',
        scoringReviewer: 'Reviewer 2',
      },
    ];

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      fetchApi: mockFetch,
      catalogApi: catalogApi,
    });

    const entities = await api.getAllScores(items[1]);
    expect(entities).toEqual(expected);
  });

  it('should filter entities by kind', async () => {
    const catalogApi: jest.Mocked<CatalogApi> = {
      getEntities: jest.fn(),
    } as any;

    catalogApi.getEntities.mockImplementation(getEntitiesMock);

    const mockConfig = new MockConfigApi({
      app: { baseUrl: 'https://example.com' },
    });
    const mockFetch = new MockFetchApi();

    const expected = [
      {
        areaScores: [],
        entityRef: { kind: 'api', name: 'Api 1' },
        owner: { kind: 'group', name: 'team1', namespace: 'default' },
        reviewDate: new Date('2022-01-01T08:00:00.000Z'),
        reviewer: { kind: 'User', name: 'Reviewer 1', namespace: 'default' },
        scorePercent: 75,
        scoringReviewDate: '2022-01-01T08:00:00Z',
        scoringReviewer: 'Reviewer 1',
      },
    ];

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      fetchApi: mockFetch,
      catalogApi: catalogApi,
    });

    const entities = await api.getAllScores(items[1], ['api']);
    expect(entities).toEqual(expected);
  });
});

describe('ScoringDataJsonClient-getAllScores-annotation way', () => {
  beforeEach(() => {
    const mockedAllJson = [
      mockedScoreEnt1,
      {
        entityRef: {
          kind: 'system',
          name: 'System 1',
        },
        scorePercent: 80,
        scoringReviewDate: '2022-01-01T08:00:00Z',
        scoringReviewer: 'Reviewer 2',
        areaScores: [],
      },
    ];
    mockOctokit.request.mockResolvedValue({
      status: 200,
      data: JSON.stringify(mockedAllJson),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should get all scores', async () => {
    const catalogApi: jest.Mocked<CatalogApi> = {
      getEntities: jest.fn(),
    } as any;

    catalogApi.getEntities.mockImplementation(getEntitiesMock);

    const mockConfig = new MockConfigApi({
      app: { baseUrl: 'https://example.com' },
    });

    const expected = [
      {
        areaScores: [],
        entityRef: { kind: 'api', name: 'Api 1' },
        owner: { kind: 'group', name: 'team1', namespace: 'default' },
        reviewDate: new Date('2022-01-01T08:00:00.000Z'),
        reviewer: { kind: 'User', name: 'Reviewer 1', namespace: 'default' },
        scorePercent: 75,
        scoringReviewDate: '2022-01-01T08:00:00Z',
        scoringReviewer: {
          kind: 'User',
          name: 'Reviewer 1',
          namespace: 'default',
        },
      },
      {
        areaScores: [],
        entityRef: { kind: 'system', name: 'System 1' },
        owner: { kind: 'group', name: 'team2', namespace: 'default' },
        reviewDate: new Date('2022-01-01T08:00:00.000Z'),
        reviewer: { kind: 'User', name: 'Reviewer 2', namespace: 'default' },
        scorePercent: 80,
        scoringReviewDate: '2022-01-01T08:00:00Z',
        scoringReviewer: 'Reviewer 2',
      },
    ];

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      catalogApi: catalogApi,
    });

    const entities = await api.getAllScores(items[0], undefined, mockAuth);
    expect(entities).toEqual(expected);
  });

  it('should return 404 if not found', async () => {
    const catalogApi: jest.Mocked<CatalogApi> = {
      getEntities: jest.fn(),
    } as any;

    catalogApi.getEntities.mockImplementation(getEntitiesMock);

    const mockConfig = new MockConfigApi({
      app: { baseUrl: 'https://example.com' },
    });

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      catalogApi: catalogApi,
    });

    mockOctokit.request.mockResolvedValue({
      status: 404,
    });

    await expect(
      api.getAllScores(items[0], undefined, mockAuth),
    ).resolves.toEqual(undefined);
  });

  it('should return error on getAllScore()', async () => {
    const catalogApi: jest.Mocked<CatalogApi> = {
      getEntities: jest.fn(),
    } as any;

    catalogApi.getEntities.mockImplementation(getEntitiesMock);

    const mockConfig = new MockConfigApi({
      app: { baseUrl: 'https://example.com' },
    });

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      catalogApi: catalogApi,
    });

    mockOctokit.request.mockResolvedValue({
      status: 500,
    });

    await expect(
      api.getAllScores(items[0], undefined, mockAuth),
    ).rejects.toThrow('error from server (code 500)');
  });

  it('should filter entities by kind', async () => {
    const catalogApi: jest.Mocked<CatalogApi> = {
      getEntities: jest.fn(),
    } as any;

    catalogApi.getEntities.mockImplementation(getEntitiesMock);

    const mockConfig = new MockConfigApi({
      app: { baseUrl: 'https://example.com' },
    });

    const expected = [
      {
        areaScores: [],
        entityRef: { kind: 'api', name: 'Api 1' },
        owner: { kind: 'group', name: 'team1', namespace: 'default' },
        reviewDate: new Date('2022-01-01T08:00:00.000Z'),
        reviewer: { kind: 'User', name: 'Reviewer 1', namespace: 'default' },
        scorePercent: 75,
        scoringReviewDate: '2022-01-01T08:00:00Z',
        scoringReviewer: {
          kind: 'User',
          name: 'Reviewer 1',
          namespace: 'default',
        },
      },
    ];

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      catalogApi: catalogApi,
    });

    const entities = await api.getAllScores(items[0], ['api'], mockAuth);
    expect(entities).toEqual(expected);
  });

  it('should get component scores', async () => {
    const catalogApi: jest.Mocked<CatalogApi> = {
      getEntities: jest.fn(),
    } as any;

    catalogApi.getEntities.mockImplementation(getEntitiesMock);

    const mockConfig = new MockConfigApi({
      app: { baseUrl: 'https://example.com' },
    });
    mockOctokit.request.mockResolvedValue({
      status: 200,
      data: JSON.stringify(mockedScoreEnt1),
    });

    const expected = {
      areaScores: [],
      entityRef: { kind: 'api', name: 'Api 1' },
      reviewDate: new Date('2022-01-01T08:00:00.000Z'),
      reviewer: { kind: 'User', name: 'Reviewer 1', namespace: 'default' },
      scorePercent: 75,
      scoringReviewDate: '2022-01-01T08:00:00Z',
      scoringReviewer: {
        kind: 'User',
        name: 'Reviewer 1',
        namespace: 'default',
      },
    };
    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      catalogApi: catalogApi,
    });

    const entities = await api.getScore(items[0], mockAuth);

    expect(entities).toEqual(expected);
  });

  it('should return error on getScore', async () => {
    const catalogApi: jest.Mocked<CatalogApi> = {
      getEntities: jest.fn(),
    } as any;

    catalogApi.getEntities.mockImplementation(getEntitiesMock);

    const mockConfig = new MockConfigApi({
      app: { baseUrl: 'https://example.com' },
    });

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      catalogApi: catalogApi,
    });

    mockOctokit.request.mockResolvedValue({
      status: 500,
    });

    await expect(api.getScore(items[0], mockAuth)).rejects.toThrow(
      'error from server (code 500)',
    );
  });

  it('should return 404 for getScore if not found', async () => {
    const catalogApi: jest.Mocked<CatalogApi> = {
      getEntities: jest.fn(),
    } as any;

    catalogApi.getEntities.mockImplementation(getEntitiesMock);

    const mockConfig = new MockConfigApi({
      app: { baseUrl: 'https://example.com' },
    });

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      catalogApi: catalogApi,
    });

    mockOctokit.request.mockResolvedValue({
      status: 404,
    });

    await expect(api.getScore(items[0], mockAuth)).resolves.toEqual(undefined);
  });
});
