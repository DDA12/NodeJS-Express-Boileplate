import path from 'path'
import express from 'express'
const app = express()
import bearerToken from 'express-bearer-token'
import {controller, scopePerRequest} from 'awilix-express';
import process from 'node:process'
const cwd = process.cwd()

export default class expressLoader {
  constructor(loggerUtil) {
    this.logger = loggerUtil
  }

  initializeExpress(container) {
    app.use(bearerToken({}))
    app.use(express.json())
    app.use(scopePerRequest(container))
    app.use(controller(container.resolve('servicesLoaded')))
    app.use('/', express.static(path.join(cwd, 'public')))
    this.logger.info('Express initialized')
    return app
  }
}
