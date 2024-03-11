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
  parseEntityRef,
  RELATION_OWNED_BY,
  DEFAULT_NAMESPACE,
  stringifyEntityRef,
} from '@backstage/catalog-model';

import { Octokit } from '@octokit/rest';

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

  private getAnnotationValue(entity: Entity, annotation: string) {
    if (!entity.metadata.annotations) {
      return undefined;
    }

    if (annotation && !entity.metadata.annotations[annotation]) {
      return undefined;
    }
    return entity.metadata.annotations[annotation];
  }

  private async getResult<T>(
    jsonDataUrl: string,
    projectSlug: string,
    auth?: any,
  ): Promise<T> {
    const token = await auth.getAccessToken(['repo']);

    const octokit = new Octokit({ auth: token });
    const owner = projectSlug?.split('/')[0] || '';
    const repo = projectSlug?.split('/')[1] || '';

    const result: T = await octokit
      .request(`GET /repos/{owner}/{repo}/contents/${jsonDataUrl}`, {
        baseUrl: 'https://api.github.com',
        owner,
        repo,
        headers: {
          Accept: 'application/vnd.github.v3.raw',
        },
      })
      .then(res => {
        switch (res.status) {
          case 404:
            return null;
          case 200:
            return JSON.parse(res.data);
          default:
            throw new Error(`error from server (code ${res.status})`);
        }
      });

    return result;
  }

  public async getScore(
    entity?: Entity,
    auth?: any,
  ): Promise<EntityScoreExtended | undefined> {
    if (!entity) {
      return undefined;
    }

    const jsonFromAnnotation = this.getAnnotationValue(
      entity,
      'scorecard/jsonDataUrl',
    );
    const projectSlug = this.getAnnotationValue(
      entity,
      'github.com/project-slug',
    );

    let result: EntityScore | undefined;
    if (jsonFromAnnotation !== undefined && projectSlug !== undefined) {
      result = await this.getResult<EntityScore>(
        jsonFromAnnotation,
        projectSlug,
        auth,
      );
    } else {
      const jsonDataUrl = this.getJsonDataUrl();
      const urlWithData = `${jsonDataUrl}${
        entity.metadata.namespace ?? DEFAULT_NAMESPACE
      }/${entity.kind}/${entity.metadata.name}.json`.toLowerCase();

      this.logConsole(
        `ScoringDataJsonClient: fetching score from: ${urlWithData}`,
      );
      result = await fetch(urlWithData).then(async res => {
        switch (res.status) {
          case 404:
            return undefined;
          case 200:
            return await res.json().then(json => {
              this.logConsole(`result: ${JSON.stringify(json)}`);
              return json as EntityScore;
            });
          default:
            throw new Error(`error from server (code ${res.status})`);
        }
      });
    }
    if (!result) {
      return undefined;
    }
    return this.extendEntityScore(result, undefined);
  }

  public async getAllScores(
    entityKindFilter?: string[],
    entity?: Entity,
    auth?: any,
  ): Promise<EntityScoreExtended[] | undefined> {
    let jsonFromAnnotation = undefined;
    let projectSlug = undefined;
    let result: EntityScore[] | undefined;

    if (entity !== undefined) {
      jsonFromAnnotation = this.getAnnotationValue(
        entity,
        'scorecard/jsonDataUrl',
      );
      projectSlug = this.getAnnotationValue(entity, 'github.com/project-slug');
    }
    if (jsonFromAnnotation !== undefined && projectSlug !== undefined) {
      result = await this.getResult<EntityScore[]>(
        jsonFromAnnotation,
        projectSlug,
        auth,
      );
    } else {
      const jsonDataUrl = this.getJsonDataUrl();
      const urlWithData = `${jsonDataUrl}all.json`;
      result = await fetch(urlWithData).then(async res => {
        switch (res.status) {
          case 404:
            return undefined;
          case 200:
            return await res.json().then(json => {
              this.logConsole(`result: ${JSON.stringify(json)}`);
              return json as EntityScore[];
            });
          default:
            throw new Error(`error from server (code ${res.status})`);
        }
      });
    }
    if (!result) return undefined;

    // Filter entities by kind
    if (entityKindFilter?.length) {
      result = result.filter((ent: { entityRef: { kind: string } }) =>
        entityKindFilter
          .map(f => f.toLocaleLowerCase())
          .includes(ent.entityRef?.kind.toLowerCase()),
      );
    }

    const entity_names: Set<string> = result.reduce((acc, a) => {
      if (a.entityRef?.name) {
        acc.add(a.entityRef.name);
      }
      return acc;
    }, new Set<string>());

    const fetchAllEntities =
      this.configApi.getOptionalBoolean('scorecards.fetchAllEntities') ?? false;
    const response = await this.catalogApi.getEntities({
      filter: fetchAllEntities
        ? undefined
        : {
            'metadata.name': Array.from(entity_names),
          },
      fields: ['kind', 'metadata.name', 'spec.owner', 'relations'],
    });
    const entities: Entity[] = fetchAllEntities
      ? response.items.filter(i => entity_names.has(i.metadata.name))
      : response.items;

    return result.map<EntityScoreExtended>((score: EntityScore) => {
      return this.extendEntityScore(score, entities);
    });
  }

  // ---- HELPER METHODS ---- //

  private logConsole(_: string) {
    // eslint-disable-next-line no-console
    // DEBUG: console.log(msg);
  }

  private getJsonDataUrl() {
    return (
      this.configApi.getOptionalString('scorecards.jsonDataUrl') ??
      'https://unknown-url-please-configure'
    );
  }

  private extendEntityScore(
    score: EntityScore,
    entities: Entity[] | undefined,
  ): EntityScoreExtended {
    if (score === null) {
      throw new Error(`can not extend null entity score.`);
    }
    if (typeof score === 'undefined') {
      throw new Error(`can not extend undefined entity score.`);
    }

    const catalogEntity = entities
      ? entities.find(entity => entity.metadata.name === score.entityRef?.name)
      : undefined;

    const owner = catalogEntity?.relations?.find(
      r => r.type === RELATION_OWNED_BY,
    )?.targetRef;

    let reviewer = undefined;
    if (
      score.scoringReviewer &&
      !(score.scoringReviewer as CompoundEntityRef)?.name
    ) {
      reviewer = {
        name: score.scoringReviewer as string,
        kind: 'User',
        namespace: 'default',
      };
    } else if ((score.scoringReviewer as CompoundEntityRef)?.name) {
      const scoringReviewer = score.scoringReviewer as CompoundEntityRef;
      reviewer = {
        name: scoringReviewer.name,
        kind: scoringReviewer?.kind ?? 'User',
        namespace: scoringReviewer?.namespace ?? DEFAULT_NAMESPACE,
      };
    }

    const reviewDate = score.scoringReviewDate
      ? new Date(score.scoringReviewDate)
      : undefined;
    return {
      id: stringifyEntityRef(score.entityRef),
      owner: owner ? parseEntityRef(owner) : undefined,
      reviewer: reviewer,
      reviewDate: reviewDate,
      ...score,
    };
  }
}
