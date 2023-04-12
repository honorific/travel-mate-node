import {OAuth2Client} from 'google-auth-library'
import jwt from 'jsonwebtoken'
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const googleToken = token.length > 1000
    if (googleToken) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      console.log('paylod in backend is: ', payload)
      req.user = {
        id: payload.sub,
        name: payload.name,
        photoURL: payload.picture,
      }
    } else {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      const {id, name, photoURL} = decodedToken
      console.log('token is: ', token)
      console.log('decodedToken is: ', decodedToken)
      req.user = {id, name, photoURL}
      ///req.user = decodedToken
    }
    next()
  } catch (error) {
    console.log('erros in backend is: ', error)
    res.status(401).json({
      success: false,
      message: 'something is wrong with your authorization',
    })
  }
}

export default auth
