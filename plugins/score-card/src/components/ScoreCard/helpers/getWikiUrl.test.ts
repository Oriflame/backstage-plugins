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
import { getWikiUrl } from './getWikiUrl';
import { ScoreSuccessEnum, EntityScoreEntry } from '../../../api/types';

describe('helper-getWikiUrl', () => {
  const entry: EntityScoreEntry = {
    id: 123,
    title: 'some-score-title',
    isOptional: false,
    scorePercent: 50,
    scoreSuccess: ScoreSuccessEnum.Partial,
    scoreHints: 'score hints',
    details: 'lorem ipsum details',
  };

  it('should replace known params', () => {
    const url: string = getWikiUrl('http://someurl/{id}/{title}', entry);
    expect(url).toEqual('http://someurl/123/some-score-title');
  });

  it('should handle null', () => {
    const url: string = getWikiUrl('http://someurl/{id}/{title}', null);
    expect(url).toEqual('http://someurl//');
  });

  it('should handle undefined', () => {
    const url: string = getWikiUrl('http://someurl/{id}/{title}', undefined);
    expect(url).toEqual('http://someurl//');
  });
});
