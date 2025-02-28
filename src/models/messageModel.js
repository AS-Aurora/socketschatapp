import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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

const Message = mongoose.model.messages || mongoose.model('messages', messageSchema)

export default Message