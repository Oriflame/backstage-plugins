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
import { Progress } from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import {
  errorApiRef,
  useApi,
  githubAuthApiRef,
} from '@backstage/core-plugin-api';
import { getWarningPanel } from '../../helpers/getWarningPanel';
import { scoringDataApiRef } from '../../api';
import { ScoreTable } from '../ScoreCardTable/ScoreCardTable';
import { useEntity } from '@backstage/plugin-catalog-react';

const useScoringAllDataLoader = (entityKindFilter?: string[]) => {
  const errorApi = useApi(errorApiRef);
  const scorigDataApi = useApi(scoringDataApiRef);
  const { entity } = useEntity();
  const auth = useApi(githubAuthApiRef);
  const { error, value, loading } = useAsync(
    async () => scorigDataApi.getAllScores(entityKindFilter, entity, auth),
    [scorigDataApi],
  );

  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);

  return { loading, value, error };
};

type ScoreCardTableProps = {
  title?: string;
  entityKindFilter?: string[];
};
export const EntityScoreBoardTable = ({
  title,
  entityKindFilter,
}: ScoreCardTableProps) => {
  const {
    loading,
    error,
    value: data,
  } = useScoringAllDataLoader(entityKindFilter);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return getWarningPanel(error);
  }

  return <ScoreTable title={title} scores={data || []} />;
};
