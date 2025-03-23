import { connect } from "@/src/dbconfig/dbconfig"
import { getDataFromToken } from "@/src/helpers/getdatafromtoken"
import Conversation from "@/src/models/conversationModel"
import Messages from "@/src/models/messageModel"
import User from "@/src/models/userModel"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  await connect()

  try {
    const reqbody = await request.json()
    const { receiverUsername } = reqbody

    if (!receiverUsername) {
      return NextResponse.json(
        { error: "receiverUsername is required" },
        { status: 400 }
      )
    }
    const senderId = await getDataFromToken(request)

    if (!senderId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const receiver = await User.findOne({ username: receiverUsername })
    if (!receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const conversation = await Conversation.findOne({
      members: { $all: [senderId, receiver._id] },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { conversationId: conversation._id },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
