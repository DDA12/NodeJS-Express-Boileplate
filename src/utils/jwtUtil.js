import jwt from 'jsonwebtoken'

export default class jwtUtil {
  constructor(jwtConfig) {
    this.jwtConfiguration = jwtConfig
  }

  async createJWS(payload) {
    return await new Promise((resolve, reject) => {
      jwt.sign(payload, this.jwtConfiguration.privateKey,
          {algorithm: this.jwtConfiguration.algorithm, expiresIn: this.jwtConfiguration.expiresIn},
          (err, jws) => {
            if (err) reject(err)
            resolve(jws)
          })
    })
  }

  verifyJWS(token) {
    return jwt.verify(token, this.jwtConfiguration.publicKey,
        {algorithm: this.jwtConfiguration.algorithm}, function(err, decoded) {
          if (err) {
            return false
          }
          return true
        })
  }
}