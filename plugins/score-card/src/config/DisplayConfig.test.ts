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

import { MockConfigApi } from '@backstage/test-utils';
import { DisplayConfig } from './DisplayConfig';
import { DisplayPolicy } from './types';

describe('display config', () => {
  it.each([
    [
      { reviewer: 'always', reviewDate: 'always' },
      { 
        reviewer: DisplayPolicy.Always,
        reviewDate: DisplayPolicy.Always,
        owner: DisplayPolicy.Always,
        kind: DisplayPolicy.Always,
      },
    ],
    [
      { reviewer: 'never', reviewDate: 'never' },
      { 
        reviewer: DisplayPolicy.Never, 
        reviewDate: DisplayPolicy.Never,
        owner: DisplayPolicy.Always,
        kind: DisplayPolicy.Always,
      },
    ],
    [
      { reviewer: 'if-data-present', reviewDate: 'if-data-present' },
      {
        reviewer: DisplayPolicy.IfDataPresent,
        reviewDate: DisplayPolicy.IfDataPresent,
        owner: DisplayPolicy.Always,
        kind: DisplayPolicy.Always,
      },
    ],
    [
      { reviewDate: 'if-data-present' },
      {
        reviewer: DisplayPolicy.Always,
        reviewDate: DisplayPolicy.IfDataPresent,
        owner: DisplayPolicy.Always,
        kind: DisplayPolicy.Always,
      },
    ],
    [
      { reviewer: 'never' },
      { 
        reviewer: DisplayPolicy.Never,
        reviewDate: DisplayPolicy.Always,
        owner: DisplayPolicy.Always,
        kind: DisplayPolicy.Always,
      },
    ],
    [
      { owner: 'never' },
      { 
        reviewer: DisplayPolicy.Always,
        reviewDate: DisplayPolicy.Always,
        owner: DisplayPolicy.Never,
        kind: DisplayPolicy.Always,
      },
    ],
    [
      { owner: 'if-data-present' },
      { 
        reviewer: DisplayPolicy.Always,
        reviewDate: DisplayPolicy.Always,
        owner: DisplayPolicy.IfDataPresent,
        kind: DisplayPolicy.Always,
      },
    ],
    [
      { kind: 'never' },
      { 
        reviewer: DisplayPolicy.Always,
        reviewDate: DisplayPolicy.Always,
        owner: DisplayPolicy.Always,
        kind: DisplayPolicy.Never,
      },
    ],
    [
      {}, 
      { 
        reviewer: DisplayPolicy.Always,
        reviewDate: DisplayPolicy.Always,
        owner: DisplayPolicy.Always,
        kind: DisplayPolicy.Always,
      }
    ],
  ])('gets expected display policies from config', (policies, expected) => {
    const mockConfig = new MockConfigApi({ scorecards: { display: policies } });

    const config = new DisplayConfig({ configApi: mockConfig });

    const displayPolicies = config.getDisplayPolicies();
    expect(displayPolicies).toEqual(expected);
  });
});
