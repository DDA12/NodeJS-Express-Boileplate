import {initializeContainer} from './bootstrap.js'
const container = await initializeContainer()
const logger = container.resolve('loggerUtil')
const serverLoader = container.resolve('serverLoader')
const server = await serverLoader.startServer(container)

process.on('uncaughtException', (err) => {
  logger.fatal('There was an uncaught error ' + err)
  process.exit(1)
})

process.on('SIGTERM', function() {
  server.close(() => {
    logger.warn('Process terminated (SIGTERM)')
    process.exit(0)
  })
})

process.on('SIGINT', function() {
  server.close(() => {
    logger.warn('Process terminated (Ctrl+c)')
    process.exit(0)
  })
})
