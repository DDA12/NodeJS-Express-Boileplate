export default class userService {
  constructor(userModel, jwtUtil) {
    this.jwtUtil = jwtUtil
    this.User = userModel
  }

  async login(username, password) {
    return this.User.findOne({username})
        .then(async (doc) => {
          if (!doc) {
            const e= new Error('User not found')
            e.name = 'Unauthorized'
            throw e
          }
          if (await doc.verifyPasswordHash(password) === false) {
            const e= new Error('Invalid Password')
            e.name = 'Unauthorized'
            throw e
          }
          return await this.jwtUtil.createJWS({username: doc.username})
        })
        .catch((err) => {
          throw err
        })
  }

  async createUser(username, firstName, lastName, password) {
    const user = new this.User({username, firstName, lastName, password})
    await user.setPasswordHash(password)
    const validation = user.validateSync()
    if (validation) {
      const e= new Error(validation)
      e.name = 'Bad Request'
      throw e
    }
    return user.save()
        .then((doc) => {
          return true
        })
        .catch((err) => {
          throw err
        })
  }

  auth(token) {
    return this.jwtUtil.verifyJWS(token)
  }
}
