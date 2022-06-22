import {createController} from 'awilix-router-core'

class UserApi {
  constructor(userService) {
    this.userService = userService
  }

  login(req, res) {
    this.userService.login(req.body.username, req.body.password)
        .then((token) => {
          res.send({jwt: token})
        })
        .catch((err) => {
          const status = err.name === 'Unauthorized'? 401 : 500
          res.status(status).send({error: err.message})
        })
  }

  signup(req, res) {
    this.userService.createUser(req.body.username, req.body.firstName, req.body.lastName, req.body.password)
        .then((signedUp) => {
          res.send({signup: signedUp})
        })
        .catch((err) => {
          const status = err.name === 'Bad Request'? 400 : 500
          res.status(status).send({error: err.message})
        })
  }

  auth(req, res) {
    res.send( {auth: this.userService.auth(req.token)})
  }
}

/**
 * Decorate the class with the Awilix controller decorators (express router features)
 **/
export default createController(UserApi)
    .prefix('/user')
    .post('/login', 'login')
    .post('/signup', 'signup')
    .post('/auth', 'auth')
