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

  const user = await User.create({
    name,
    email: emailLowerCase,
    password: hashedPassword,
  })

  console.log('user is: ', user)

  const {_id: id, photoURL, role, active} = user
  const token = jwt.sign({id, name, photoURL, role}, process.env.JWT_SECRET, {
    expiresIn: '1h',
  })
  const decodedTokenn = jwt.verify(token, process.env.JWT_SECRET)
  console.log('decoded tokennnnn in controller is: ', decodedTokenn)
  res.status(201).json({
    success: true,
    result: {id, name, email: user.email, photoURL, token, role, active},
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

  const {_id: id, name, photoURL, role, active} = existedUser
  if (!active)
    return res.status(400).json({
      success: false,
      message: 'this account has been suspended. try to contact the admin',
    })
  const token = jwt.sign({id, name, photoURL, role}, process.env.JWT_SECRET, {
    expiresIn: '1h',
  })
  res.status(200).json({
    success: true,
    result: {id, name, email: emailLowerCase, photoURL, token, role, active},
  })
})

export const updateProfile = tryCatch(async (req, res) => {
  const fields = req.body?.photoURL
    ? {name: req.body.name, photoURL: req.body.photoURL}
    : {name: req.body.name}
  const updatedUser = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
  })

  console.log('updatedUser is: ', updatedUser)
  const {_id: id, name, photoURL, role} = updatedUser

  await Room.updateMany({uid: id}, {uName: name, uPhoto: photoURL})

  const token = jwt.sign({id, name, photoURL, role}, process.env.JWT_SECRET, {
    expiresIn: '1h',
  })

  return res.status(200).json({success: true, result: {name, photoURL, token}})
})

export const getUsers = tryCatch(async (req, res) => {
  const users = await User.find().sort({_id: -1})
  res.status(200).json({
    success: true,
    result: users,
  })
})

export const updateStatus = tryCatch(async (req, res) => {
  const {role, active} = req.body
  await User.findByIdAndUpdate(req.params.userId, {role, active})
  res.status(200).json({success: true, result: {_id: req.params.user}})
})
