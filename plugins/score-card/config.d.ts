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

export interface Config {
  /**
   * Extra configuration for score card plugin
   */
  scorecards: {
    /**
     * The public absolute root URL with json file defining the score card entries.
     * @visibility frontend
     */
    jsonDataUrl?: string;
    /**
     * The template for the link to the wiki, e.g. "https://TBD/XXX/_wiki/wikis/XXX.wiki/{id}"
     * @visibility frontend
     */
     wikiLinkTemplate?: string;
     /**
      *
      * When true, use entity ref in URL when fetching its file, ex: {jsonDataUrl}/{entityRef.namespace}/{entityRef.kind}/{entityRef.name}
      * When false, use system name in URL when fetching its file, ex: {jsonDataUrl}/{systemEntityName}
      * @visibility frontend
      */
      useEntityRef?: boolean;
  };
}
