import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import tryCatch from './utils/tryCatch.js'

export const register = tryCatch(async (req, res) => {
  const {name, email, password} = req.body
  console.log('body request is :', req.body)
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be atleast 6 characters',
    })
  }
  const emailLowerCase = email.toLowerCase()
  const existedUser = await User.findOne({email: emailLowerCase})
  if (existedUser) {
    return res
      .status(400)
      .json({success: false, message: 'User already exist!'})
  }
  const hashedPassword = await bcrypt.hash(password, 12)

  const user = User.create({
    name,
    email: emailLowerCase,
    password: hashedPassword,
  })

  const {_id: id, photoURL} = user
  const token = jwt.sign({id, name, photoURL}, process.env.JWT_SECRET, {
    expiresIn: '1h',
  })
  res.status(201).json({
    success: true,
    result: {id, name, email: user.email, photoURL, token},
  })
})
