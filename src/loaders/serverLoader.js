export default class ServerLoader {
  constructor(serverConfig, expressLoader, loggerUtil) {
    this.serverConfig = serverConfig
    this.expressLoader = expressLoader
    this.logger = loggerUtil
  }

  async startServer(container) {
    const app = this.expressLoader.initializeExpress(container)
    const server = this.serverConfig.serverBase
        .createServer(this.serverConfig.options, app)
        .listen(this.serverConfig.port, this.serverConfig.host, (err) => {
          if (err) throw err
          this.logger.info(this.serverConfig.message +`[${this.serverConfig.host}:${this.serverConfig.port}]`)
        })
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        this.logger.warn(`Address ${this.serverConfig.host}:${this.serverConfig.port} in use, retrying...`);
        setTimeout(() => {
          server.close();
          server.listen(this.serverConfig.port, this.serverConfig.host);
        }, 1000);
      }
    })
    return server
  }
}