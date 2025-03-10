import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: true,
        unique: true
    }, 
    username: {
        type: String,
        sparce: true,
        unique: true
    },
    otp: {
        type: String,
        required: false
    }, 
    otpExpires: {
        type: Date,
        required: false
    }, 
    lastActive: {
        type: Date,
        default: Date.now
    }, 
    isOnline: {
        type: Boolean,
        default: false
    }, 
    contacts: [{
        type: [String],
        ref: 'users'
    }], 
    profilePicture: {
        type: String,
        default: ''
    }
})

const User = mongoose.models.users || mongoose.model('users', userSchema)

export default User