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

// Catalog items used as mock
const items = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'API',
    metadata: {
      name: 'Api 1',
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
    items: filterKinds.length? items.filter(item => filterKinds.find(k => k === item.kind)) : items,
  } as GetEntitiesResponse);
};

const getAllEntitiesMock = (
  request?: GetEntitiesRequest,
): Promise<GetEntitiesResponse> => {
  if (request?.filter && (request?.filter as Record<string, string[]>)["metadata.name"]) {
    throw new Error("filter is not allowed")
  }
  const filterKinds =
    Array.isArray(request?.filter) && Array.isArray(request?.filter[0].kind)
      ? request?.filter[0].kind ?? []
      : [];
  return Promise.resolve({
    items: filterKinds.length? items.filter(item => filterKinds.find(k => k === item.kind)) : items,
  } as GetEntitiesResponse);
};

describe('ScoringDataJsonClient-getAllScores', () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation(
      jest.fn(() => Promise.resolve({
          status: 200,
          json: () => new Promise((resolve) => {
            const sampleData = [
              {
                "entityRef": {
                  "kind": "api",
                  "name": "Api 1"
                },
                "scorePercent": 75,
                "scoringReviewDate": "2022-01-01T08:00:00Z",
                "scoringReviewer": "Reviewer 1",
                "areaScores": []
              },
              {
                "entityRef": {
                  "kind": "system",
                  "name": "System 1"
                },
                "scorePercent": 80,
                "scoringReviewDate": "2022-01-01T08:00:00Z",
                "scoringReviewer": "Reviewer 2",
                "areaScores": []
              },
            ]
            resolve(sampleData);
          }),
        }),
      ) as jest.Mock
    )
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
        "areaScores": [],
        "entityRef": {"kind": "api", "name": "Api 1"},
        "owner": {"kind": "group", "name": "team1", "namespace": "default"},
        "reviewDate": new Date('2022-01-01T08:00:00.000Z'),
        "reviewer": {"kind": "User", "name": "Reviewer 1", "namespace": "default"},
        "scorePercent": 75,
        "scoringReviewDate": "2022-01-01T08:00:00Z",
        "scoringReviewer": "Reviewer 1"
      },
      {
        "areaScores": [],
        "entityRef": {"kind": "system", "name": "System 1"},
        "owner": {"kind": "group", "name": "team2", "namespace": "default"},
        "reviewDate": new Date('2022-01-01T08:00:00.000Z'),
        "reviewer": {"kind": "User", "name": "Reviewer 2", "namespace": "default"},
        "scorePercent": 80,
        "scoringReviewDate": "2022-01-01T08:00:00Z",
        "scoringReviewer": "Reviewer 2"
      }
    ];

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      fetchApi: mockFetch,
      catalogApi: catalogApi
    });

    const entities = await api.getAllScores();
    expect(entities).toEqual(expected);
  });

  it('should get all scores and fetch all entities', async () => {

    const catalogApi: jest.Mocked<CatalogApi> = {
      getEntities: jest.fn(),
    } as any;

    catalogApi.getEntities.mockImplementation(getAllEntitiesMock);

    const mockConfig = new MockConfigApi({
      app: { baseUrl: 'https://example.com' },
      scorecards: { fetchAllEntities: true}
    });
    const mockFetch = new MockFetchApi();

    const expected = [
      {
        "areaScores": [],
        "entityRef": {"kind": "api", "name": "Api 1"},
        "owner": {"kind": "group", "name": "team1", "namespace": "default"},
        "reviewDate": new Date('2022-01-01T08:00:00.000Z'),
        "reviewer": {"kind": "User", "name": "Reviewer 1", "namespace": "default"},
        "scorePercent": 75,
        "scoringReviewDate": "2022-01-01T08:00:00Z",
        "scoringReviewer": "Reviewer 1"
      },
      {
        "areaScores": [],
        "entityRef": {"kind": "system", "name": "System 1"},
        "owner": {"kind": "group", "name": "team2", "namespace": "default"},
        "reviewDate": new Date('2022-01-01T08:00:00.000Z'),
        "reviewer": {"kind": "User", "name": "Reviewer 2", "namespace": "default"},
        "scorePercent": 80,
        "scoringReviewDate": "2022-01-01T08:00:00Z",
        "scoringReviewer": "Reviewer 2"
      }
    ];

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      fetchApi: mockFetch,
      catalogApi: catalogApi
    });

    const entities = await api.getAllScores();
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
        "areaScores": [],
        "entityRef": {"kind": "api", "name": "Api 1"},
        "owner": {"kind": "group", "name": "team1", "namespace": "default"},
        "reviewDate": new Date('2022-01-01T08:00:00.000Z'),
        "reviewer": {"kind": "User", "name": "Reviewer 1", "namespace": "default"},
        "scorePercent": 75,
        "scoringReviewDate": "2022-01-01T08:00:00Z",
        "scoringReviewer": "Reviewer 1"
      }
    ];

    const api = new ScoringDataJsonClient({
      configApi: mockConfig,
      fetchApi: mockFetch,
      catalogApi: catalogApi
    });

    const entities = await api.getAllScores(['api']);
    expect(entities).toEqual(expected);
  });
});
