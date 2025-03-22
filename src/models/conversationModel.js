import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "messages",
    default: null,
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

conversationSchema.index({ members: 1 }, { unique: true });

const Conversation =
  mongoose.models.conversations ||
  mongoose.model("conversations", conversationSchema);
export default Conversation;
