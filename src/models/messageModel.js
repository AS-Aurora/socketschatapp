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
    receiver: {
        type: String,
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
    }, 
    conversationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "conversations",
        required: true  
    }
})

const Messages = mongoose.models.messages || mongoose.model('messages', messageSchema)

export default Messages