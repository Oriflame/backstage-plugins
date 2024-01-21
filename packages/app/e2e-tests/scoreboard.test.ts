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

test('Score board: displays the score board based on sample data', async ({ page }) => {
  // cy.loginAsGuest();
  page.on('load', page => {
    page.evaluate(() => window.localStorage.setItem('@backstage/core:SignInPage:provider', 'guest'))
  });
  // cy.visit('/score-board', {
  await page.goto('/score-board');


  //   onBeforeLoad(win) {
  //     cy.stub(win.console, `log`).callsFake(msg => {
  //       // log to Terminal
  //       cy.task("log", msg);
  //     });
  //   }
  // });

  // cy.contains('Custom page title').should('be.visible');
  await expect(page.getByRole('heading', { name: 'Custom page title' })).toBeVisible();
  // cy.contains('Custom sub title').should('be.visible');
  await expect(page.getByText('Custom sub title')).toBeVisible();
  // cy.contains('Custom table title').should('be.visible');
  await expect(page.getByRole('heading', { name: 'Custom table title' })).toBeVisible();
  // cy.get('span:contains("1-4 of 4")').should('be.visible'); // beware, there is also a hidden <P/> element
  await expect(await page.locator('span').filter({ hasText: '1-4 of' })).toBeVisible();
  // cy.contains('audio-playback').should('be.visible');
  await expect(await page.getByRole('link', { name: 'audio-playback' })).toBeVisible();
  // cy.contains('team-c').should('be.visible');
  await expect(page.getByRole('link', { name: 'team-c' }).first()).toBeVisible();
  // cy.contains('non-valid-system').should('be.visible');
  // cy.contains('Name').should('be.visible');
  ['Name', 'Date', 'Code', 'Documentation', 'Operations', 'Quality', 'Security', 'Total'].forEach(async columnName => {
    await expect(page.getByRole('columnheader', { name: columnName })).toBeVisible();
  });

  // cy.contains('50 %').should('be.visible');
  page.getByRole('cell', { name: '50 %' })
  // cy.contains('75 %').should('be.visible');
  page.getByRole('cell', { name: '75 %' })
  // cy.checkForErrors();
  // cy.screenshot({ capture: 'viewport' });

  // cy.log('navigating to score card detail for audio-playback');
  // console.log('navigating to score card detail for audio-playback');

  // cy.get('a[data-id="audio-playback"]').should('be.visible').click();
  await page.getByRole('link', { name: 'audio-playback' }).click();
  // cy.url().should(
  //   'include',
  //   '/catalog/default/system/audio-playback/score',
  // );
  expect(page.context().pages()[0].url()).toEqual('http://localhost:3000/catalog/default/system/audio-playback/score');
  // cy.contains('Scoring').should('be.visible');
  await expect(page.getByText('Scoring')).toBeVisible();
  // cy.contains('Total score: 57 %').should('be.visible');
  await expect(page.getByText('Total score: 57 %')).toBeVisible();
  // cy.contains('Code').should('be.visible');
  // cy.contains('90 %').should('be.visible');
  await expect(page.getByRole('cell', { name: 'Area: Code 90 %' })).toBeVisible();
  // cy.contains('Documentation').should('be.visible');
  // cy.contains('75 %').should('be.visible');
  await expect(page.getByRole('cell', { name: 'Area: Documentation 75 %' })).toBeVisible();
  // cy.contains('Operations').should('be.visible');
  // cy.contains('50 %').should('be.visible');
  await expect(page.getByRole('cell', { name: 'Area: Operations 50 %' })).toBeVisible();
  // cy.contains('Quality').should('be.visible');
  // cy.contains('25 %').should('be.visible');
  await expect(page.getByRole('cell', { name: 'Area: Quality 25 %' })).toBeVisible();
  // cy.contains('Security');
  // cy.contains('10 %').should('be.visible');
  await expect(page.getByRole('cell', { name: 'Area: Security 10 %' })).toBeVisible();
  // cy.checkForErrors();
  // cy.screenshot({ capture: 'viewport' });

  // cy.log(
  //   'Clicking on button [>] that is first child of the element (td) with value=Code',
  // );
  // cy.get('[value="Code"] > button:first-child').click();
  await page.getByRole('cell', { name: 'Area: Code 90 %' }).getByRole('button').click();
  // cy.contains('hints: Gitflow: 100%').should('be.visible');
  await expect(page.getByText('hints: Gitflow: 100%')).toBeVisible();
  // cy.get('a[data-id="2157"]')
  //   .should('be.visible')
  //   .should('have.attr', 'href', 'https://link-to-wiki/2157');
  const gitflowLinkHref = await page.getByRole('link', { name: 'GitFlow' }).getAttribute('href');
  await expect(gitflowLinkHref).toEqual('https://link-to-wiki/2157');
  // cy.checkForErrors();
  // cy.screenshot({ capture: 'viewport' });

});
