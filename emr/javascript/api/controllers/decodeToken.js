const jwt = require('jsonwebtoken')
const JWT_KEY = '6eoc94l@t*bi2w3vm(-d7#dqr($rkuzgg$f6#@1b)smkzg*j7i'

function decodeToken(req) {
    let token = null
    let token_object = null
    let message = null
    try {
        token = req.header('Authorization').replace('Bearer ', '')
    }
    catch (e) {
        message = 'Authentication credentials were not provided.'
        
        return {
            token_object: token_object,
            message: message
        }
    }

    try {
        token_object = jwt.verify(token, JWT_KEY)
    }
    catch (e) {
        message = 'Invalid authentication. Could not decode token.'

        return {
            token_object: token_object,
            message: message
        }
    }

    let now = new Date()
    let expired_at = new Date(token_object.expired_at)

    if (Date.parse(now.toString()) > Date.parse(expired_at.toString())) {
        message = 'The token has expired.'

        return {
            token_object: token_object,
            message: message
        }
    }

    return {
        token_object: token_object,
        message: message
    }
}

exports.decodeToken = decodeToken