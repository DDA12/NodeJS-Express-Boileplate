import dotenv from 'dotenv'
import {fileURLToPath} from 'node:url'
import {promisify} from 'node:util'
import awilix from 'awilix'
import glob from 'glob'
const globP = promisify(glob)
const {asValue, asFunction, asClass} = awilix
const moduleUrl = new URL('./', import.meta.url)
dotenv.config({path: fileURLToPath(new URL('./config/.env', moduleUrl))})

global.environment = {
  production: 'production',
  development: 'development',
}

export async function initializeContainer() {
  const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.CLASSIC,
  })
  container.register('container', asValue(container))
  await container.loadModules([
    ['./config/*Config.js',
      {
        register: asFunction,
        lifetime: awilix.Lifetime.SINGLETON,
      },
    ],
    ['./loaders/*Loader.js',
      {
        register: asClass,
        lifetime: awilix.Lifetime.SINGLETON,
      },
    ],
    ['./services/*Service.js',
      {
        register: asClass,
        lifetime: awilix.Lifetime.SCOPED,
      },
    ],
    ['./models/*Model.js',
      {
        register: asFunction,
        lifetime: awilix.Lifetime.SINGLETON,
      },
    ],
    ['./utils/*Util.js',
      {
        register: asClass,
        lifetime: awilix.Lifetime.SINGLETON,
      },
    ],
  ], {
    cwd: fileURLToPath(moduleUrl),
    esModules: true,
  })
  const certificatesConfig = container.resolve('certificatesConfig')
  await certificatesConfig.initialize()
  const databaseLoader = container.resolve('databaseLoader')
  container.register('db', asValue(await databaseLoader.connectDB()))
  /**
   * Need to load services and store them for later registration in express (ES6 modules)
   * Resolving a service decorates it.
   */
  const servicesLoaded = []
  const apiUrl = new URL('./api-routes/', import.meta.url)
  await globP('*Api.js', {cwd: fileURLToPath(apiUrl)})
      .then(async (list) => {
        for (const name of list) {
          const api = await import(new URL(name, apiUrl))
          servicesLoaded.push(api.default)
        }
      })
      .catch((err) => console.log(err))
  container.register('servicesLoaded', asValue(servicesLoaded))
  return container
}
