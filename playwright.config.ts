/*
 * Copyright 2023 The Backstage Authors
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

import { defineConfig, devices } from '@playwright/test';
//import { generateProjects } from '@backstage/e2e-test-utils/playwright';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,

  expect: {
    timeout: 5_000,
  },

  // Run your local dev server before starting the tests
  webServer: process.env.CI
    ? []
    : [
      // {
      //   command: 'yarn start',
      //   port: 3000,
      //   reuseExistingServer: true,
      //   timeout: 60_000,
      // },
      // {
      //   command: 'yarn start-backend',
      //   port: 7007,
      //   reuseExistingServer: true,
      //   timeout: 60_000,
      // },
      // {
      //   command: 'http-server -p 8090 --cors 2>&1',
      //   port: 8090,
      //   reuseExistingServer: true,
      //   timeout: 60_000,
      // },
    ],

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  reporter: [['html', { open: 'never', outputFolder: 'e2e-test-report' }]],

  use: {
    actionTimeout: 0,
    baseURL:
      //process.env.PLAYWRIGHT_URL ??
      'http://localhost:3000',
    screenshot: 'on',
    trace: 'on',
    video: 'on',
    headless: true,
  },

  outputDir: 'node_modules/.cache/e2e-test-results',

  projects:  //generateProjects(), // Find all packages with e2e-test folders
    [
      {
        name: 'chromium',
        testDir: "packages/app/e2e-tests",

        use: {
          ...devices['Desktop Chrome']
        },
      }
    ]
});
