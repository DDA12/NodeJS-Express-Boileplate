import rs from 'jsrsasign';

const keys = rs.KEYUTIL.generateKeypair('EC', 'secp256r1')
const prvPem = rs.KEYUTIL.getPEM(keys.prvKeyObj, 'PKCS8PRV')
const pubPem = rs.KEYUTIL.getPEM(keys.pubKeyObj, 'PKCS8PUB')

const jwtConfig = {
  privateKey: prvPem,
  publicKey: pubPem,
  algorithm: 'ES256',
  expiresIn: '2h',
}

export default () => jwtConfig
