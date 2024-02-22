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
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import React from 'react';
import { EntityScoreExtended } from '../../../api/types';
import { DisplayPolicies, DisplayPolicy } from '../../../config/types';

export function getReviewerLink(
  value: EntityScoreExtended,
  displayPolicies: DisplayPolicies,
) {
  const displayReviewer = displayPolicies.reviewer !== DisplayPolicy.Never;
  const displayReviewDate = displayPolicies.reviewDate !== DisplayPolicy.Never;

  if (!displayReviewer && !displayReviewDate) {
    return null;
  }

  return (
    <div style={{ textAlign: 'right', margin: '0.2rem' }}>
      {value.reviewer ? (
        <>
          Review done
          {displayReviewer && ' by '}
          {displayReviewer && (
            <EntityRefLink entityRef={value.reviewer}>
              {value.reviewer?.name}
            </EntityRefLink>
          )}
          {displayReviewDate &&
            ` at
              ${(value.reviewDate
                ? value.reviewDate.toLocaleDateString()
                : 'unknown')}`}
        </>
      ) : (
        <>Not yet reviewed.</>
      )}
    </div>
  );
}
