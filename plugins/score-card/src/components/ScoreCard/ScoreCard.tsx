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

import { Entity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Chip, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import useAsync from 'react-use/lib/useAsync';

import {
  EmptyState,
  InfoCard,
  InfoCardVariants,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { configApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { scoreToColorConverter } from '../../helpers/scoreToColorConverter';
import { getWarningPanel } from '../../helpers/getWarningPanel';
import {
  getScoreTableEntries,
  EntityScoreTableEntry,
} from './helpers/getScoreTableEntries';
import { areaColumn } from './columns/areaColumn';
import { detailsColumn } from './columns/detailsColumn';
import { scorePercentColumn } from './columns/scorePercentColumn';
import { titleColumn } from './columns/titleColumn';
import { getReviewerLink } from './sub-components/getReviewerLink';
import { scoringDataApiRef } from '../../api';
import { useDisplayConfig } from '../../config/DisplayConfig';

// lets prepare some styles
const useStyles = makeStyles(theme => ({
  badgeLabel: {
    color: theme.palette.common.white,
  },
  header: {
    padding: theme.spacing(2, 2, 2, 2.5),
  },
  action: {
    margin: 0,
  },
  disabled: {
    backgroundColor: theme.palette.background.default,
  },
}));

// data loader
const useScoringDataLoader = () => {
  const errorApi = useApi(errorApiRef);
  const scorigDataApi = useApi(scoringDataApiRef);
  const config = useApi(configApiRef);
  const { entity } = useEntity();

  const { error, value, loading } = useAsync(
    async () => scorigDataApi.getScore(entity),
    [scorigDataApi, entity],
  );

  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);

  const wikiLinkTemplate =
    config.getOptionalString('scorecards.wikiLinkTemplate') ?? '';

  return { loading, value, wikiLinkTemplate, error };
};

export const ScoreCard = ({
  variant = 'gridItem',
}: {
  entity?: Entity;
  variant?: InfoCardVariants;
}) => {
  // let's load the entity data from url defined in config etc
  const {
    loading,
    error,
    value: data,
    wikiLinkTemplate,
  } = useScoringDataLoader();

  const classes = useStyles();

  // let's prepare the "chip" used in the up-right card corner
  let gateLabel = 'Not computed';
  const gateStyle = {
    margin: 0,
    backgroundColor: scoreToColorConverter(data?.scoreSuccess),
  };
  if (data?.scorePercent || data?.scorePercent === 0) {
    const label = data?.scoreLabel ?? `${data.scorePercent} %`;
    gateLabel = `Total score: ${label}`;
  }
  const qualityBadge = !loading && <Chip label={gateLabel} style={gateStyle} />;

  // let's define the main table columns
  const columns: TableColumn<EntityScoreTableEntry>[] = [
    areaColumn(data),
    titleColumn(wikiLinkTemplate),
    detailsColumn,
    scorePercentColumn,
  ];

  const allEntries = getScoreTableEntries(data);

  const displayPolicies = useDisplayConfig().getDisplayPolicies();

  return (
    <InfoCard
      title="Scoring"
      variant={variant}
      headerProps={{
        action: qualityBadge,
        classes: {
          root: classes.header,
          action: classes.action,
        },
      }}
    >
      {loading && <Progress />}

      {error && getWarningPanel(error)}

      {!loading && !data && (
        <div data-testid="score-card-no-data">
          <EmptyState
            missing="info"
            title="No information to display"
            description="There is no data available for this entity"
          />
        </div>
      )}

      {!loading && data && (
        <div data-testid="score-card">
          <Grid
            item
            container
            direction="column"
            justifyContent="space-between"
            alignItems="stretch"
            style={{ height: '100%' }}
            spacing={0}
          >
            <Table<EntityScoreTableEntry>
              title="Score of each requirement"
              options={{
                search: true,
                paging: false,
                grouping: true,
                padding: 'dense',
              }}
              columns={columns}
              data={allEntries}
              components={{
                Groupbar: () => null, // we do not want to display possibility to change grouping
              }}
            />

            {getReviewerLink(data, displayPolicies)}
          </Grid>
        </div>
      )}
    </InfoCard>
  );
};
