import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        ref: "User"
    },
    room: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }, 
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent"
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
})

const Messages = mongoose.models.messages || mongoose.model('messages', messageSchema)

export default Messages