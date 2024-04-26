/*
 * Copyright 2022 Oriflame (Based on https://github.com/RoadieHQ/roadie-backstage-plugins source copyrighted by Larder Software Limited)
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
import { test, expect } from '@playwright/test';
import { failOnBrowserErrors } from '@backstage/e2e-test-utils/playwright';

failOnBrowserErrors();

test('Entity Score board: displays the score board based on sample data', async ({
  page,
}) => {
  page.on('load', p => {
    p.evaluate(() =>
      window.localStorage.setItem(
        '@backstage/core:SignInPage:provider',
        'guest',
      ),
    );
  });

  await page.goto(
    '/catalog/default/component/sample-service-entity-source/score',
  );

  await expect(page.getByText('Scoring')).toBeVisible();
  await expect(page.getByText('Total score: Yellow')).toBeVisible();

  await expect(
    page.getByRole('cell', { name: 'Area: Code Green' }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Area: Documentation Red' }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Area: Operations Yellow' }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Area: Quality Red' }),
  ).toBeVisible();

  await page
    .getByRole('cell', { name: 'Area: Code Green' })
    .getByRole('button')
    .click();
  await expect(page.getByText('hints: Gitflow: 100%')).toBeVisible();

  const gitflowLinkHref = await page
    .getByRole('link', { name: 'GitFlow' })
    .getAttribute('href');

  expect(gitflowLinkHref).toEqual('https://link-to-wiki/2157');
});
