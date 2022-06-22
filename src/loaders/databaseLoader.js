import mongoose from 'mongoose'

export default class databaseLoader {
  constructor(databaseConfig, loggerUtil) {
    this.databaseConfig = databaseConfig
    this.logger = loggerUtil
  }

  async connectDB() {
    await mongoose.connect(this.databaseConfig.url + this.databaseConfig.dbName)
        .then(() => this.logger.info(`Database connection successful: `+
            `${this.databaseConfig.url + this.databaseConfig.dbName}`))
        .catch((err) => {
          throw new Error(`Database connection error: `+
              `${this.databaseConfig.url + this.databaseConfig.dbName} - ${err.message}`)
        })
    return mongoose
  }
}

