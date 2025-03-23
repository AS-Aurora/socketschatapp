import { connect } from "@/src/dbconfig/dbconfig";
import { getDataFromToken } from "@/src/helpers/getdatafromtoken";
import Messages from "@/src/models/messageModel";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  await connect();
  try {
    const reqBody = await request.json();
    const { messageId, status } = reqBody;

    if (!messageId || !status) {
      return NextResponse.json(
        { message: "Please fill in all fields" },
        { status: 400 }
      );
    }

    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized user" },
        { status: 401 }
      );
    }

    const message = await Messages.findOne({ _id: messageId });
    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    if (
      message.sender.toString() !== userId &&
      message.receiver.toString() !== userId
    ) {
      return NextResponse.json(
        { message: "You are not authorized to update this message" },
        { status: 403 }
      );
    }

    message.status = status;
    message.lastActive = new Date();
    await message.save();

    return NextResponse.json({
      message: "Message status updated",
      messageData: message,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
