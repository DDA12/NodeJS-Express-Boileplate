import rs from 'jsrsasign' // https://github.com/kjur/jsrsasign
import fs from 'node:fs/promises'

const issuer = 'DEV_CA' // Certificate Authority name
const durationValidity = 10 // In years
const supportedNames = [ // Array with valid names for the Server certificate
  {ip: '127.0.0.1'},
  {ip: '192.168.0.1'},
  {dns: 'localhost'},
  {dns: 'dev'},
  {dns: 'test'},
// eslint-disable-next-line max-len
] // https://github.com/kjur/jsrsasign/wiki/Tutorial-for-extensions-when-generating-certificate#subject-alt-name-and-issuer-alt-name

const baseDate = new Date()
const dateFrom = baseDate.toISOString().replaceAll(/([:T-])|(\.[0-9]{3})/g, '')
const dateTo = new Date(baseDate.getFullYear() + Math.floor(durationValidity), baseDate.getMonth(),
    baseDate.getDate()).toISOString().replaceAll(/([:T-])|(\.[0-9]{3})/g, '')

const caOptions = {
  version: 3,
  serial: {int: 1},
  issuer: {str: '/CN=' + issuer},
  notbefore: dateFrom,
  notafter: dateTo,
  subject: {str: '/CN=' + issuer},
  sbjpubkey: null,
  ext: [
    {extname: 'basicConstraints', cA: true},
    {extname: 'keyUsage', critical: true, names: ['digitalSignature', 'keyCertSign']},
  ],
  sigalg: 'SHA256withECDSA',
  cakey: null,
}

const localhostOptions = {
  version: 3,
  serial: {int: 2},
  issuer: {str: '/CN=' + issuer},
  notbefore: dateFrom,
  notafter: dateTo,
  subject: {str: '/CN=localhost'},
  sbjpubkey: null,
  ext: [
    {extname: 'basicConstraints', cA: false},
    {extname: 'keyUsage', critical: true, names: ['digitalSignature']},
    {extname: 'subjectAltName', array: supportedNames},
  ],
  sigalg: 'SHA256withECDSA',
  cakey: null,
}


class CertificatesConfig {
  serverKeyCertificate = {}
  caKeyCertificate = {}

  constructor(loggerUtil) {
    this.logger = loggerUtil
  }

  async initialize() {
    this.serverKeyCertificate = await this.#getServerKeyCertificate()
    this.caKeyCertificate = await this.#getCaCertificate()
    this.logger.info('Certificates Config initialized')
  }

  async #getCaCertificate() {
    return await fs.readFile(new URL('./certificates/ca.cert.pem', import.meta.url) )
        .then(async (certPem) => {
          return certPem
        })
        .catch((err) => {
          return false
        })
  }

  async #getServerKeyCertificate() {
    const keyCert = await this.#loadServerKeyCert()
    if (keyCert) return keyCert
    await this.#generateKeysCerts()
    return await this.#loadServerKeyCert()
  }

  async #loadServerKeyCert() {
    return await fs.readFile(new URL('./certificates/localhost.prv.pem', import.meta.url))
        .then(async (prvPem) => {
          return await fs.readFile(new URL('./certificates/localhost.cert.pem', import.meta.url))
              .then((certPem) => {
                return {prvPem, certPem}
              })
        })
        .catch((err) => {
          return false
        })
  }

  #generateKeyPair() {
    const keys = rs.KEYUTIL.generateKeypair('EC', 'secp256r1')
    const prvPem = rs.KEYUTIL.getPEM(keys.prvKeyObj, 'PKCS8PRV')
    const pubPem = rs.KEYUTIL.getPEM(keys.pubKeyObj, 'PKCS8PUB')
    return {prvPem, pubPem}
  }

  async #generateKeysCerts() {
    if (process.env.NODE_ENV === environment.production) {
      this.logger.error('Can\'t generate certificates for production. You must provide the Server Key and Certificate')
      throw new Error('Production Server Certificate and Key missing')
    }

    this.logger.info('Generating new Keys and new Certificates.....')

    const ca = this.#generateKeyPair()
    caOptions.sbjpubkey = ca.pubPem
    this.caKeyCertificate.prvPem = caOptions.cakey = ca.prvPem
    ca.cert = new rs.KJUR.asn1.x509.Certificate(caOptions)
    this.caKeyCertificate.certPem = ca.certPem = ca.cert.getPEM()

    const localhost = this.#generateKeyPair()
    localhostOptions.sbjpubkey = localhost.pubPem
    this.serverKeyCertificate.prvPem = localhostOptions.cakey = ca.prvPem
    localhost.cert = new rs.KJUR.asn1.x509.Certificate(localhostOptions)
    this.serverKeyCertificate.certPem =localhost.certPem = localhost.cert.getPEM()

    await fs.writeFile(new URL('./certificates/ca.cert.pem', import.meta.url), ca.certPem)
    await fs.writeFile(new URL('./certificates/ca.prv.pem', import.meta.url), ca.prvPem)
    await fs.writeFile(new URL('./certificates/localhost.prv.pem', import.meta.url), localhost.prvPem)
    await fs.writeFile(new URL('./certificates/localhost.cert.pem', import.meta.url), localhost.certPem)
  }
}

export default (loggerUtil) => new CertificatesConfig(loggerUtil)