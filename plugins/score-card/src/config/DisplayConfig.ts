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

import { ConfigApi, configApiRef, useApi } from '@backstage/core-plugin-api';
import { DisplayPolicies, DisplayPolicy } from './types';

export class DisplayConfig {
  configApi: ConfigApi;

  constructor({ configApi }: { configApi: ConfigApi }) {
    this.configApi = configApi;
  }

  public getDisplayPolicies(): DisplayPolicies {
    const displayConfig =
      this.configApi.getOptionalConfig('scorecards.display');
    return {
      reviewer:
        (displayConfig?.getOptionalString('reviewer') as DisplayPolicy) ??
        DisplayPolicy.Always,
      owner:
        (displayConfig?.getOptionalString('owner') as DisplayPolicy) ??
        DisplayPolicy.Always,
      kind:
        (displayConfig?.getOptionalString('kind') as DisplayPolicy) ??
        DisplayPolicy.Always,
      reviewDate:
        (displayConfig?.getOptionalString('reviewDate') as DisplayPolicy) ??
        DisplayPolicy.Always,
    };
  }
}

export const useDisplayConfig = () => {
  const configApi = useApi(configApiRef);
  return new DisplayConfig({ configApi });
};
