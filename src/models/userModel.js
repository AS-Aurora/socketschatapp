import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    phonenumber: {
        type: String, 
        required: true,
        unique: true
    }, 
    otp: {
        type: String,
        required: true
    }, 
    otpExpires: {
        type: Date,
        required: true
    }
})

const User = mongoose.model.users || mongoose.model('users', userSchema)

export default User