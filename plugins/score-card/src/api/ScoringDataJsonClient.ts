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
import { ScoringDataApi } from './ScoringDataApi';
import { ConfigApi, FetchApi } from '@backstage/core-plugin-api';
import { EntityScore, EntityScoreExtended } from './types';
import { CatalogApi } from '@backstage/plugin-catalog-react';
import {
  Entity,
  CompoundEntityRef,
  getCompoundEntityRef,
  parseEntityRef,
  RELATION_OWNED_BY,
} from '@backstage/catalog-model';

/**
 * Default JSON data client. Expects JSON files in a format see /sample-data
 */
export class ScoringDataJsonClient implements ScoringDataApi {
  configApi: ConfigApi;
  catalogApi: CatalogApi;
  fetchApi: FetchApi;

  constructor({
    configApi,
    catalogApi,
    fetchApi,
  }: {
    configApi: ConfigApi;
    catalogApi: CatalogApi;
    fetchApi: FetchApi;
  }) {
    this.configApi = configApi;
    this.catalogApi = catalogApi;
    this.fetchApi = fetchApi;
  }

  public async getScore(
    entity?: Entity,
  ): Promise<EntityScoreExtended | undefined> {
    if (!entity) {
      return undefined;
    }
    const systemName = entity.metadata.name;
    const jsonDataUrl = this.getJsonDataUrl();
    let urlWithData = `${jsonDataUrl}${systemName}.json`;

    if (this.shouldUseEntityRef()) {
      urlWithData = `${jsonDataUrl}${entity.metadata.namespace}/${entity.kind}/${entity.metadata.name}.json`.toLowerCase()
    }
    const result: EntityScore = await fetch(urlWithData).then(res => {
      switch (res.status) {
        case 404:
          return null;
        case 200:
          return res.json();
        default:
          throw new Error(`error from server (code ${res.status})`);
      }
    });
    if (!result) {
      return undefined;
    }
    return this.extendEntityScore(result, undefined);
  }

  public async getAllScores(): Promise<EntityScoreExtended[] | undefined> {
    const jsonDataUrl = this.getJsonDataUrl();
    const urlWithData = `${jsonDataUrl}all.json`;
    const result: EntityScore[] | undefined = await fetch(urlWithData).then(
      res => {
        switch (res.status) {
          case 404:
            return undefined;
          case 200:
            return res.json();
          default:
            throw new Error(`error from server (code ${res.status})`);
        }
      },
    );
    if (!result) return undefined;

    let systems: Entity[] | undefined;
    // For backward compatibility
    if (!this.shouldUseEntityRef()) {
      const entities = await this.catalogApi.getEntities({
        filter: { kind: ['System'] },
        fields: ['kind', 'metadata.name', 'spec.owner', 'relations'],
      });
      systems = entities.items;
    }

    return result.map<EntityScoreExtended>(score => {
      return this.extendEntityScore(score, systems);
    });
  }

  // ---- HELPER METHODS ---- //

  private getJsonDataUrl() {
    return (
      this.configApi.getOptionalString('scorecards.jsonDataUrl') ??
      'https://unknown-url-please-configure'
    );
  }

  private shouldUseEntityRef() {
    return (
      this.configApi.getOptionalBoolean('scorecards.useEntityRef') ?? false
    );
  }

  private extendEntityScore(
    score: EntityScore,
    systems: Entity[] | undefined,
  ): EntityScoreExtended {
    if (score === null) {
      throw new Error(`can not extend null system score.`);
    }
    if (typeof score === 'undefined') {
      throw new Error(`can not extend undefined system score.`);
    }
    const catalogEntity = systems
      ? systems.find(system => system.metadata.name === score.systemEntityName)
      : undefined;
    const owner = catalogEntity?.relations?.find(
      r => r.type === RELATION_OWNED_BY,
    )?.targetRef;

    let reviewer = undefined;
    if (score.scoringReviewer && !(score.scoringReviewer as CompoundEntityRef)?.name) {
      reviewer = { name: score.scoringReviewer as string, kind: 'User', namespace: 'default' };
    } else if ((score.scoringReviewer as CompoundEntityRef)?.name) {
      const scoringReviewer = score.scoringReviewer as CompoundEntityRef
      reviewer = { name: scoringReviewer.name, kind: scoringReviewer?.kind ?? "User", namespace: scoringReviewer?.namespace ?? 'default' };
    }

    const reviewDate = score.scoringReviewDate
      ? new Date(score.scoringReviewDate)
      : undefined;
    return {
      catalogEntity: catalogEntity,
      catalogEntityName: catalogEntity
        ? getCompoundEntityRef(catalogEntity)
        : undefined,
      owner: owner ? parseEntityRef(owner) : undefined,
      reviewer: reviewer,
      reviewDate: reviewDate,
      ...score,
      // For Backward compatibility, fallback on systemEntityName
      entityRef: score.entityRef ?? { name: score.systemEntityName, kind: "system"},
    };
  }
}
