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
import { ScmAuthApi } from '@backstage/integration-react';
import {
  ScmIntegrationRegistry,
  GithubIntegration,
  getGithubFileFetchUrl,
} from '@backstage/integration';
/**
 * Default JSON data client. Expects JSON files in a format see /sample-data
 */
export class ScoringDataJsonClient implements ScoringDataApi {
  configApi: ConfigApi;
  catalogApi: CatalogApi;
  fetchApi: FetchApi;
  scmAuthApi: ScmAuthApi;
  scmIntegrationsApi: ScmIntegrationRegistry;

  constructor({
    configApi,
    catalogApi,
    fetchApi,
    scmAuthApi,
    scmIntegrationsApi,
  }: {
    configApi: ConfigApi;
    catalogApi: CatalogApi;
    fetchApi: FetchApi;
    scmAuthApi: ScmAuthApi;
    scmIntegrationsApi: ScmIntegrationRegistry;
  }) {
    this.configApi = configApi;
    this.catalogApi = catalogApi;
    this.fetchApi = fetchApi;
    this.scmAuthApi = scmAuthApi;
    this.scmIntegrationsApi = scmIntegrationsApi;
  }

  public async getScore(
    entity?: Entity,
  ): Promise<EntityScoreExtended | undefined> {
    if (!entity) {
      return undefined;
    }
    const jsonFromAnnotation = this.getAnnotationValue(
      entity,
      'scorecard/jsonDataUrl',
    );

    let urlWithData: string;

    if (jsonFromAnnotation) {
      urlWithData = jsonFromAnnotation;
    } else {
      const jsonDataUrl = this.getJsonDataUrl();
      urlWithData = `${jsonDataUrl}${
        entity.metadata.namespace ?? DEFAULT_NAMESPACE
      }/${entity.kind}/${entity.metadata.name}.json`.toLowerCase();
    }

    this.logConsole(
      `ScoringDataJsonClient: fetching score from: ${urlWithData}`,
    );
    const result: EntityScore | undefined = await this.getResult<EntityScore>(
      urlWithData,
    );
    if (!result) {
      return undefined;
    }
    return this.extendEntityScore(result, [entity]);
  }

  public async getAllScores(
    entityKindFilter?: string[],
  ): Promise<EntityScoreExtended[] | undefined> {
    const jsonDataUrl = this.getJsonDataUrl();
    const urlWithData = `${jsonDataUrl}all.json`;
    this.logConsole(
      `ScoringDataJsonClient: fetching all scored from ${urlWithData}`,
    );
    let result: EntityScore[] | undefined = await this.getResult<EntityScore[]>(
      urlWithData,
    );

    if (!result) return undefined;

    // Filter entities by kind
    if (entityKindFilter && entityKindFilter.length) {
      result = result.filter(entity =>
        entityKindFilter
          .map(f => f.toLocaleLowerCase())
          .includes(entity.entityRef?.kind.toLowerCase() as string),
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

  private async getResult<T>(jsonDataUrl: string): Promise<T | undefined> {
    // Find out if we have an configured integration for the given URL
    const integration = this.scmIntegrationsApi.byUrl(jsonDataUrl);

    // Find any configured authentication for the URL
    let auth;
    try {
      auth = await this.scmAuthApi.getCredentials({ url: jsonDataUrl });
    } catch (error) {
      this.logConsole(
        `No authentication config found for ${jsonDataUrl}, proceeding without authentication`,
      );
    }

    // perform any custom config for the integration type
    let requestUrl;
    let headers = {};
    switch (integration?.type) {
      case 'github':
        requestUrl = getGithubFileFetchUrl(
          jsonDataUrl,
          (integration as GithubIntegration).config,
          { ...auth, type: 'token' },
        );
        headers = {
          ...(auth && auth.headers),
          Accept: 'application/vnd.github.v3.raw',
        };
        break;
      default:
        requestUrl = jsonDataUrl;
        break;
    }

    try {
      const result = await this.fetchApi.fetch(requestUrl, {
        headers,
      });

      if (result.status === 404) {
        return undefined;
      } else if (result.status !== 200) {
        return undefined;
      }
      const json = (await result.json()) as T;
      this.logConsole(`result: ${JSON.stringify(json)}`);
      return json;
    } catch (error) {
      throw new Error(`error from server (code ${error.status})`);
    }
  }

  private getJsonDataUrl() {
    return (
      this.configApi.getOptionalString('scorecards.jsonDataUrl') ??
      'https://unknown-url-please-configure/'
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

  private getAnnotationValue(entity: Entity, annotation: string) {
    if (!entity.metadata.annotations) {
      return undefined;
    }

    if (annotation && !entity.metadata.annotations[annotation]) {
      return undefined;
    }
    return entity.metadata.annotations[annotation];
  }
}
