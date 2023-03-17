import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
  name: {type: String, min: 3, max: 50, required},
  email: {type: String, min: 5, max: 50, required},
  password: {type: String, required},
  photoURL: {type: String, default: ''},
})

const User = mongoose.Model('users', userSchema)

export default User
