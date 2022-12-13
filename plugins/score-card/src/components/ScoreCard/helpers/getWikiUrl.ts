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

import { EntityScoreEntry } from '../../../api/types';

export function getWikiUrl(
  wikiLinkTemplate: string,
  entry: EntityScoreEntry | null | undefined,
): string {
  if (!entry) return wikiLinkTemplate.replace(/\{[^\}]+\}/g, '');
  return wikiLinkTemplate.replace(/\{[^\}]+\}/g, matched => {
    const keyName = matched.substring(1, matched.length - 1);
    const value = entry[keyName as keyof EntityScoreEntry];
    return !value ? '' : value.toString();
  });
}
