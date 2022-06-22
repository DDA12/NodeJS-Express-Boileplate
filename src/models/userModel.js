import validator from 'validator'
import crypto from 'node:crypto'
import {promisify} from 'node:util'
const scrypt = promisify(crypto.scrypt)
// Uses scrypt algorithm to derive a key (hash): https://en.wikipedia.org/wiki/Scrypt

export default (db) => {
  const UserSchema = new db.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      validate: (value) => {
        return validator.isAscii(value)
      },
    },
    firstName: {
      type: String,
      required: false,
      validate: (value) => {
        return validator.isAscii(value)
      },
    },
    lastName: {
      type: String,
      required: false,
      validate: (value) => {
        return validator.isAscii(value)
      },
    },
    passwordHash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    // Model DB attributes
    createdAt: Date,
    updatedAt: Date,
  })

  UserSchema.methods.setPasswordHash = async function(password) {
    this.salt = crypto.randomBytes(16).toString('hex')
    this.passwordHash = (await scrypt(password, this.salt, 64)).toString(`hex`)
  }

  UserSchema.methods.verifyPasswordHash = async function(password) {
    const derivedKey = await scrypt(password, this.salt, 64)
    // Prevents Timing attacks: https://en.wikipedia.org/wiki/Timing_attack
    return crypto.timingSafeEqual(derivedKey, Buffer.from(this.passwordHash, 'hex'))
  }

  /** * Pre-Save Hook ****/
  UserSchema.pre('save', function(next) {
    const now = Date.now()
    this.updatedAt = now
    if (!this.createdAt) {
      this.createdAt = now
    }
    next()
  })

  return db.model('User', UserSchema)
}

