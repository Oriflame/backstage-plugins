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
import React, { useEffect } from 'react';
import { Table, TableColumn, Progress, Link } from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { scoreToColorConverter } from '../../helpers/scoreToColorConverter';
import { Chip } from '@material-ui/core';
import { getWarningPanel } from '../../helpers/getWarningPanel';
import { scoringDataApiRef } from '../../api';
import { EntityScoreExtended } from '../../api/types';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { DEFAULT_NAMESPACE, Entity } from '@backstage/catalog-model';
import { useDisplayConfig } from '../../config/DisplayConfig';
import { DisplayPolicy } from '../../config/types';

const useScoringAllDataLoader = (
  entityKindFilter?: string[],
  entity?: Entity,
) => {
  const errorApi = useApi(errorApiRef);
  const scorigDataApi = useApi(scoringDataApiRef);

  const { error, value, loading } = useAsync(
    async () => scorigDataApi.getAllScores(entityKindFilter, entity),
    [scorigDataApi],
  );

  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);

  return { loading, value, error };
};

type ScoreTableProps = {
  title?: string;
  scores: EntityScoreExtended[];
};

export const ScoreTable = ({ title, scores }: ScoreTableProps) => {
  const displayPolicies = useDisplayConfig().getDisplayPolicies();

  const columns: TableColumn<EntityScoreExtended>[] = [
    {
      title: 'Name',
      field: 'entityRef.name',
      render: entityScore => {
        if (!entityScore.entityRef?.name) {
          return <>Missing entityRef.name key</>;
        }

        return (
          <Link
            to={`/catalog/${
              entityScore.entityRef.namespace ?? DEFAULT_NAMESPACE
            }/${entityScore.entityRef.kind}/${
              entityScore.entityRef.name
            }/score`}
            data-id={entityScore.entityRef.name}
          >
            {entityScore.entityRef.name}
          </Link>
        );
      },
    },
    {
      title: 'Kind',
      field: 'entityRef.kind',
      render: entityScore => {
        return <>{entityScore.entityRef.kind}</>;
      },
    },
    {
      title: 'Owner',
      field: 'owner.name',
      render: entityScore =>
        entityScore.owner ? (
          <>
            <EntityRefLink entityRef={entityScore.owner}>
              {entityScore.owner.name}
            </EntityRefLink>
          </>
        ) : null,
    },
  ];

  if (
    displayPolicies.reviewer === DisplayPolicy.Always ||
    (displayPolicies.reviewer === DisplayPolicy.IfDataPresent &&
      scores.some(s => !!s.scoringReviewer))
  ) {
    columns.push({
      title: 'Reviewer',
      field: 'scoringReviewer',
      render: entityScore =>
        entityScore.reviewer ? (
          <>
            <EntityRefLink entityRef={entityScore.reviewer}>
              {entityScore.reviewer?.name}
            </EntityRefLink>
          </>
        ) : null,
    });
  }

  if (
    displayPolicies.reviewDate === DisplayPolicy.Always ||
    (displayPolicies.reviewDate === DisplayPolicy.IfDataPresent &&
      scores.some(s => !!s.scoringReviewDate))
  ) {
    columns.push({
      title: 'Date',
      field: 'scoringReviewDate',
      render: entityScore =>
        entityScore.reviewDate ? (
          <>{entityScore.reviewDate.toLocaleDateString()}</>
        ) : null,
    });
  }

  scores
    .flatMap(s => {
      return s.areaScores ?? [];
    })
    .reduce<string[]>((areas, area) => {
      if (!area || !area.title || areas.findIndex(x => x === area.title) !== -1)
        return areas;
      areas.push(area.title);
      columns.push({
        title: area.title,
        field: 'n/a',
        customSort: (d1, d2) => {
          const d1ScoreEntry = d1?.areaScores
            ? d1.areaScores.find(a => a.title === area.title)?.scorePercent
            : undefined;
          const d2ScoreEntry = d2?.areaScores
            ? d2.areaScores.find(a => a.title === area.title)?.scorePercent
            : undefined;
          if (!d1ScoreEntry || d1ScoreEntry < (d2ScoreEntry ?? 0)) return -1;
          if (!d2ScoreEntry || d2ScoreEntry < d1ScoreEntry) return 1;
          return 0;
        },
        render: entityScoreEntry => {
          const currentScoreEntry = entityScoreEntry?.areaScores
            ? entityScoreEntry.areaScores.find(a => a.title === area.title)
            : undefined;
          const chipStyle: React.CSSProperties = {
            margin: 0,
            backgroundColor: scoreToColorConverter(
              currentScoreEntry?.scoreSuccess,
            ),
            minWidth: '4rem',
          };
          const label =
            currentScoreEntry?.scoreLabel ??
            `${currentScoreEntry?.scorePercent} %`;
          return typeof currentScoreEntry?.scorePercent !== 'undefined' ? (
            <Chip label={label} style={chipStyle} />
          ) : null;
        },
      });
      return areas;
    }, []);

  columns.push({
    title: 'Total',
    align: 'right',
    field: 'scorePercent',
    render: entityScoreEntry => {
      const chipStyle: React.CSSProperties = {
        margin: 0,
        backgroundColor: scoreToColorConverter(entityScoreEntry?.scoreSuccess),
        float: 'right',
        minWidth: '4rem',
      };
      const label =
        entityScoreEntry?.scoreLabel ?? `${entityScoreEntry?.scorePercent} %`;
      return typeof entityScoreEntry.scorePercent !== 'undefined' ? (
        <Chip label={label} style={chipStyle} />
      ) : null;
    },
  });

  // in case we have less then 10 entities let's show at least 10 rows
  const minDefaultPageSizeOption = scores.length >= 10 ? scores.length : 10;
  // so in case we have less then 100 entities we want to see them all in one page after load
  const maxDefaultPageSizeOption =
    scores.length < 100 ? minDefaultPageSizeOption : 100;
  // so now we are in a situation, when
  // count(entities) | minDefaultPageSizeOption | maxDefaultPageSizeOption | defaultPageSizeOption
  //   0 |  10 |  10 |  10
  //   5 |  10 |  10 |  10
  //  10 |  10 |  10 |  10
  //  50 |  50 |  50 |  50
  // 100 | 100 | 100 | 100
  // 150 | 150 | 100 | 100
  const defaultPageSizeOption =
    minDefaultPageSizeOption > maxDefaultPageSizeOption
      ? maxDefaultPageSizeOption
      : minDefaultPageSizeOption;

  return (
    <div data-testid="score-board-table">
      <Table<EntityScoreExtended>
        title={title ?? 'Entities scores overview'}
        options={{
          search: true,
          paging: true,
          padding: 'dense',
          pageSize: defaultPageSizeOption,
          pageSizeOptions: [defaultPageSizeOption, 20, 50, 100, 200],
        }}
        columns={columns}
        data={scores}
      />
    </div>
  );
};

type ScoreCardTableProps = {
  title?: string;
  entityKindFilter?: string[];
  entity?: Entity;
};
export const ScoreCardTable = ({
  title,
  entityKindFilter,
  entity,
}: ScoreCardTableProps) => {
  const {
    loading,
    error,
    value: data,
  } = useScoringAllDataLoader(entityKindFilter, entity);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return getWarningPanel(error);
  }

  return <ScoreTable title={title} scores={data || []} />;
};
