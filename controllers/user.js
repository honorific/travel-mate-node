import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import tryCatch from './utils/tryCatch.js'
import Room from '../models/Room.js'

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

export const login = tryCatch(async (req, res) => {
  const {email, password} = req.body
  console.log('body request is :', req.body)
  const emailLowerCase = email.toLowerCase()
  const existedUser = await User.findOne({email: emailLowerCase})
  if (!existedUser) {
    return res.status(404).json({success: false, message: 'User doesnt exist'})
  }
  const correctPassword = await bcrypt.compare(password, existedUser.password)
  if (!correctPassword) {
    return res
      .status(400)
      .json({success: false, message: 'invalid credentials'})
  }

  const {_id: id, name, photoURL} = existedUser
  const token = jwt.sign({id, name, photoURL}, process.env.JWT_SECRET, {
    expiresIn: '1h',
  })
  res.status(200).json({
    success: true,
    result: {id, name, email: emailLowerCase, photoURL, token},
  })
})

export const updateProfile = tryCatch(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
  })
  const {_id: id, name, photoURL} = updatedUser

  await Room.updateMany({uid: id}, {uName: name, uPhoto: photoURL})

  const token = jwt.sign({id, name, photoURL}, process.env.JWT_SECRET, {
    expiresIn: '1h',
  })

  return res.status(200).json({success: true, result: {name, photoURL, token}})
})
