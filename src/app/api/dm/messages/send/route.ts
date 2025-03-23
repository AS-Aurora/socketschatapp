import { connect } from "@/src/dbconfig/dbconfig";
import { getDataFromToken } from "@/src/helpers/getdatafromtoken";
import Conversation from "@/src/models/conversationModel";
import Messages from "@/src/models/messageModel";
import User from "@/src/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { io } from "@/server";

export async function POST(request: NextRequest) {
  await connect();
  try {
    const reqbody = await request.json();
    const { message, conversationID, receiverUsername } = reqbody;

    if (!message || !conversationID || !receiverUsername) {
      return NextResponse.json(
        { message: "Please fill in all fields" },
        { status: 400 }
      );
    }

    const senderId = await getDataFromToken(request);
    if (!senderId) {
      return NextResponse.json(
        { message: "You are not authorized" },
        { status: 401 }
      );
    }

    const receiver = await User.findOne({ username: receiverUsername });
    if (!receiver) {
      return NextResponse.json(
        { message: "Receiver not found" },
        { status: 404 }
      );
    }

    const conversation = await Conversation.findOne({
      _id: conversationID.trim(),
      members: { $all: [senderId, receiver._id] },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 }
      );
    }

    const timestamp = new Date();

    const newMessage = new Messages({
      sender: senderId,
      message,
      receiver: receiver._id,
      conversationID,
      timestamp,
    });

    await newMessage.save();
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageTime = timestamp;
    await conversation.save();

    io.to(receiver._id.toString()).emit("newMessage", {
      sender: senderId,
      message,
      receiver: receiver._id,
      conversationID,
      timestamp,
    });

    return NextResponse.json(
      {
        message: "Message sent",
        messageData: {
          sender: senderId,
          message,
          receiver: receiver._id,
          conversationID,
          timestamp,
        },
        success: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
