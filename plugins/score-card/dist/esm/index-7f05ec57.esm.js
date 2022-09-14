import React from 'react';
import { Grid } from '@material-ui/core';
import { Progress, Table, Link, Page, Header, HeaderLabel, Content, ContentHeader, SupportButton } from '@backstage/core-components';
import Alert$1 from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { s as scoreToColorConverter } from './scoreToColorConverter-2df9e567.esm.js';
import '@material-ui/core/styles';

const ScoreTable = ({scores}) => {
  const columns = [
    {title: "Name", field: "systemEntityName", render: (systemScore) => /* @__PURE__ */ React.createElement(Link, {
      to: `/catalog/default/system/${systemScore.systemEntityName}/score`
    }, systemScore.systemEntityName)},
    {title: "Date", field: "generatedDateTimeUtc"},
    {title: "%", field: "scorePercent"}
  ];
  const rowStyleFunc = (rowData) => ({
    color: scoreToColorConverter(rowData == null ? void 0 : rowData.scoreSuccess)
  });
  return /* @__PURE__ */ React.createElement(Table, {
    title: "System scores overview",
    options: {search: true, paging: true, rowStyle: rowStyleFunc},
    columns,
    data: scores
  });
};
const ScoreCardTable = () => {
  var _a;
  const configApi = useApi(configApiRef);
  const jsonDataUrl = (_a = configApi.getOptionalString("scorecards.jsonDataUrl")) != null ? _a : "https://unknown-url-please-configure";
  const {value, loading, error} = useAsync(async () => {
    const urlWithData = `${jsonDataUrl}all.json`;
    const result = await fetch(urlWithData).then((res) => {
      switch (res.status) {
        case 404:
          return null;
        case 200:
          return res.json();
        default:
          throw `error from server (code ${res.status})`;
      }
    });
    return result;
  }, []);
  if (loading) {
    return /* @__PURE__ */ React.createElement(Progress, null);
  } else if (error) {
    return /* @__PURE__ */ React.createElement(Alert$1, {
      severity: "error"
    }, error.message);
  }
  return /* @__PURE__ */ React.createElement(ScoreTable, {
    scores: value || []
  });
};

const ScoreCardPage = () => /* @__PURE__ */ React.createElement(Page, {
  themeId: "tool"
}, /* @__PURE__ */ React.createElement(Header, {
  title: "Score board",
  subtitle: "Overview of system scores"
}, /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Owner",
  value: "Platform&Tooling team"
}), /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Lifecycle",
  value: "Alpha"
})), /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(ContentHeader, {
  title: ""
}, /* @__PURE__ */ React.createElement(SupportButton, null, "In this table you may see overview of system scores.")), /* @__PURE__ */ React.createElement(Grid, {
  container: true,
  spacing: 3,
  direction: "column"
}, /* @__PURE__ */ React.createElement(Grid, {
  item: true
}, /* @__PURE__ */ React.createElement(ScoreCardTable, null)))));

export { ScoreCardPage };
//# sourceMappingURL=index-7f05ec57.esm.js.map
