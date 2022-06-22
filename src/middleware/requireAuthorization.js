import express from 'express'
const router = express.Router()
import jwt from '../utils/jwtUtil.js'

router.all('*', checkAuthorization)

function checkAuthorization(req, res, next) {
  if (!jwt.verifyJWS(req.token)) return res.sendStatus(401)
  next()
}

export {
  checkAuthorization as default,
  router as authorizationRouter,
}

