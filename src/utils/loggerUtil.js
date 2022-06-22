import pino from 'pino'

export default class logger extends pino {
  constructor() {
    const options = {
      transport: process.env.NODE_ENV === environment.production ? null :
          {target: 'pino-pretty',
            options: {
              colorize: true,
            },
          },
    }
    super(options)
    this.options = options
  }
}