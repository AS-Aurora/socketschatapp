import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    timestamp: {
        type: Date,
        default: Date.now, 
        index: true
    }, 
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent"
    },
    conversationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true  
    }
})

messageSchema.index({ conversationID: 1, timestamp: -1 });

const Messages = mongoose.models.messages || mongoose.model('messages', messageSchema)

export default Messages