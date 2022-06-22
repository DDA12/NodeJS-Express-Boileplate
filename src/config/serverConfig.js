import spdy from 'spdy'
import http2 from 'node:http2'
import http from 'node:http'

export default function serverConfig(certificatesConfig) {
  return {
    environment: environment.dev,
    protocol: 'h2',
    host: '127.0.0.1',
    port: 3000,
    serverBase: spdy,
    options: {
      key: certificatesConfig.serverKeyCertificate.prvPem,
      cert: certificatesConfig.serverKeyCertificate.certPem,
      spdy: {
        protocols: ['h2', 'http/1.1'],
      },
    },
    message: 'HTTP2 (with http1 fallback) Server listening on ',
  }
}
