import User from "@/src/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbconfig/dbconfig";
import { getDataFromToken } from "@/src/helpers/getdatafromtoken";
import Conversation from "@/src/models/conversationModel";

connect()

export async function POST(request: NextRequest) {
    try {
        const reqbody = await request.json()
        const {receiverUsername} = reqbody
        const senderId = await getDataFromToken(request)

        console.log("Receiver Username:", receiverUsername);
        console.log("Sender ID:", senderId);

        const receiver = await User.findOne({username: receiverUsername})
        if (!receiver) {
            return NextResponse.json({
                message: "User not found",
                success: false
            })
        }
        
        let conversation = await Conversation.findOne({
            members: { $all: [senderId.toString(), receiver._id.toString()]}
        })

        console.log("Existing Conversation Found:", conversation);

        if(!conversation) {
            conversation = new Conversation({
                members: [senderId.toString(), receiver._id.toString()],
                lastMessage: null
            })
            await conversation.save()
        }

        return NextResponse.json({
            conversationId: conversation._id,
            success: true
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
        
    }
}