import * as _backstage_core_components from '@backstage/core-components';
import * as _backstage_catalog_model from '@backstage/catalog-model';
import * as _backstage_core_plugin_api from '@backstage/core-plugin-api';

declare const scoreCardPlugin: _backstage_core_plugin_api.BackstagePlugin<{
    root: _backstage_core_plugin_api.RouteRef<undefined>;
}, {}>;
declare const ScoreCardPage: () => JSX.Element;
declare const EntityScoreCardContent: ({ variant, }: {
    entity?: _backstage_catalog_model.Entity | undefined;
    variant?: _backstage_core_components.InfoCardVariants | undefined;
}) => JSX.Element;

export { EntityScoreCardContent, ScoreCardPage, scoreCardPlugin };
