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
import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { ScoreCardTable } from '../ScoreCardTable';

type ScoreBoardPageProps = {
  title?: string;
  subTitle?: string;
  tableTitle?: string;
  entityKindFilter?: string[];
};

export const ScoreBoardPage = ({
  title,
  subTitle,
  tableTitle,
  entityKindFilter,
}: ScoreBoardPageProps) => (
  <Page themeId="tool">
    <Header
      title={title ?? 'Score board'}
      subtitle={subTitle ?? 'Overview of entity scores'}
    >
      <HeaderLabel label="Maintainer" value="Oriflame" />
      <HeaderLabel label="Status" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="">
        <SupportButton>
          In this table you may see overview of entity scores.
        </SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <ScoreCardTable
            title={tableTitle}
            entityKindFilter={entityKindFilter}
          />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
