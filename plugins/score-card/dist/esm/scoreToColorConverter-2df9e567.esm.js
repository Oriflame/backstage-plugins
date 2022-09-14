import { createTheme } from '@material-ui/core/styles';

var ScoreSuccessEnum;
(function(ScoreSuccessEnum2) {
  ScoreSuccessEnum2["Success"] = "success";
  ScoreSuccessEnum2["Failure"] = "failure";
  ScoreSuccessEnum2["Partial"] = "partial";
})(ScoreSuccessEnum || (ScoreSuccessEnum = {}));

const scoreToColorConverter = (scoreSuccess) => {
  const theme = createTheme();
  if (typeof scoreSuccess === void 0) {
    return theme.palette.grey[500];
  }
  switch (scoreSuccess) {
    case ScoreSuccessEnum.Success:
      return theme.palette.success.light;
    case ScoreSuccessEnum.Failure:
      return theme.palette.error.light;
    case ScoreSuccessEnum.Partial:
      return theme.palette.warning.light;
    default:
      return theme.palette.grey[500];
  }
};

export { scoreToColorConverter as s };
//# sourceMappingURL=scoreToColorConverter-2df9e567.esm.js.map
