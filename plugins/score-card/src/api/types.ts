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
import { CompoundEntityRef } from '@backstage/catalog-model';

export enum ScoreSuccessEnum {
  Success = 'success',
  AlmostSuccess = 'almost-success',
  Partial = 'partial',
  AlmostFailure = 'almost-failure',
  Failure = 'failure',
}

export interface EntityScore {
  entityRef: CompoundEntityRef;
  generatedDateTimeUtc: Date | string;
  scorePercent: number;
  scoreLabel?: string;
  scoreSuccess: ScoreSuccessEnum;
  scoringReviewer: string | CompoundEntityRef | undefined | null;
  scoringReviewDate: Date | string | undefined | null;
  areaScores: EntityScoreArea[];
}

export interface EntityScoreArea {
  id: number;
  title: string;
  scorePercent: number;
  scoreLabel?: string;
  scoreSuccess: ScoreSuccessEnum;
  scoreEntries: EntityScoreEntry[];
}

export interface EntityScoreEntry {
  id: number;
  title: string;
  isOptional: boolean;
  scorePercent: number;
  scoreLabel?: string;
  scoreSuccess: ScoreSuccessEnum;
  scoreHints: string | string[];
  details: string;
}

export interface EntityScoreExtended extends EntityScore {
  id: string;
  owner: CompoundEntityRef | undefined;
  reviewer: CompoundEntityRef | undefined;
  reviewDate: Date | undefined;
}
