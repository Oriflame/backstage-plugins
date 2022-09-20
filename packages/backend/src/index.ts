/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

// eslint-disable-next-line notice/notice
const { version } = require('../package.json');

import Router from 'express-promise-router';
import {
  CacheManager,
  createServiceBuilder,
  getRootLogger,
  loadBackendConfig,
  notFoundHandler,
  DatabaseManager,
  SingleHostDiscovery,
  UrlReaders,
  useHotMemoize,
  ServerTokenManager,
} from '@backstage/backend-common';
import { Config } from '@backstage/config';
import healthcheck from './plugins/healthcheck';
import { TaskScheduler } from '@backstage/backend-tasks';
import app from './plugins/app';
import auth from './plugins/auth';
import catalog from './plugins/catalog';
import scaffolder from './plugins/scaffolder';
import proxy from './plugins/proxy';
import { PluginEnvironment } from './types';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';
import {serializeError} from 'serialize-error';

const safeFatalError = async (message: string, error?: Error) => {
  try {
    // if available, use the root logger (shall send the message to AppInsights too)
    const logger = getRootLogger();
    logger.error(message);
    logger.error(`Full error: ${serializeError(error)}`)
  } catch (_e) {
    console.error(message);
  }
  if (process.env.NODE_ENV === 'development') {
    console.error(
      `DEVELOPMENT server (watcher) ${process.ppid} will be killed now...`,
    );
    process.kill(process.ppid);
  }
  console.info(`Process ${process.pid} will exit now...`);
  process.exit(1);
};

function makeCreateEnv(config: Config) {
  const root = getRootLogger();
  const reader = UrlReaders.default({ logger: root, config });
  const discovery = SingleHostDiscovery.fromConfig(config);
  const tokenManager = ServerTokenManager.fromConfig(config, { logger: root });
  const permissions = ServerPermissionClient.fromConfig(config, {
    discovery,
    tokenManager,
  });
  const databaseManager = DatabaseManager.fromConfig(config);
  const cacheManager = CacheManager.fromConfig(config);
  const taskScheduler = TaskScheduler.fromConfig(config);

  root.info(`Created UrlReader ${reader}`);

  return (plugin: string): PluginEnvironment => {
    const logger = root.child({ type: 'plugin', plugin });
    const database = databaseManager.forPlugin(plugin);
    const cache = cacheManager.forPlugin(plugin);
    const scheduler = taskScheduler.forPlugin(plugin);
    return {
      logger,
      cache,
      database,
      config,
      reader,
      discovery,
      tokenManager,
      permissions,
      scheduler,
    };
  };
}

async function main() {
  const logger = getRootLogger();

  logger.info(`App starting: version [${version}]`);

  const config = await loadBackendConfig({
    argv: process.argv,
    logger,
  });
  const createEnv = makeCreateEnv(config);

  const healthcheckEnv = useHotMemoize(module, () => createEnv('healthcheck'));
  const catalogEnv = useHotMemoize(module, () => createEnv('catalog'));
  const scaffolderEnv = useHotMemoize(module, () => createEnv('scaffolder'));
  const authEnv = useHotMemoize(module, () => createEnv('auth'));
  const proxyEnv = useHotMemoize(module, () => createEnv('proxy'));
  const appEnv = useHotMemoize(module, () => createEnv('app'));

  const apiRouter = Router();
  apiRouter.use('/catalog', await catalog(catalogEnv));
  apiRouter.use('/scaffolder', await scaffolder(scaffolderEnv));
  apiRouter.use('/auth', await auth(authEnv));
  apiRouter.use('/proxy', await proxy(proxyEnv));
  apiRouter.use(notFoundHandler());

  try {
    logger.info('Creating service...');
    const service = createServiceBuilder(module)
      .loadConfig(config)
      .addRouter('', await healthcheck(healthcheckEnv))
      .addRouter('/api', apiRouter)
      .addRouter('', await app(appEnv));

    logger.info('Starting service...');
    await service.start().catch(async err => {
      await safeFatalError(`service.start() failed: ${err}`);
    });
  } catch (error) {
    if (typeof error === 'string') {
      await safeFatalError(`main() failed: ${error}`);
    } else if (error instanceof Error) {
      await safeFatalError(`main() failed: ${error.message}`, error as Error);
    }
  }
}

module.hot?.accept();
main().catch(async error => {
  await safeFatalError(`Backend failed to start up: ${error}`);
});
