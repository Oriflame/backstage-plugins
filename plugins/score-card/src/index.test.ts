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
import { scoreCardPlugin, ScoreCardTable, ScoreBoardPage, EntityScoreCardContent } from '.';

describe('score-card exports', () => {
  it('should export plugin', () => {
    expect(scoreCardPlugin).toBeDefined();
  });

  it('should export ScoreCardTable', () => {
    expect(ScoreCardTable).toBeDefined();
  });
  it('should export ScoreBoardPage', () => {
    expect(ScoreBoardPage).toBeDefined();
  });
  it('should export EntityScoreCardContent', () => {
    expect(EntityScoreCardContent).toBeDefined();
  });
});
