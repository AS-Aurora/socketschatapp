import { connect } from "@/src/dbconfig/dbconfig";
import { getDataFromToken } from "@/src/helpers/getdatafromtoken";
import Messages from "@/src/models/messageModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
      await connect();

      const reqbody = await request.json();
      const { conversationId, page = 1, limit = 20 } = reqbody

      const userId = await getDataFromToken(request)
      if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        return NextResponse.json(
          { error: "Invalid conversation ID" },
          { status: 400 }
        );
      }
  
      let query = { conversationID: new mongoose.Types.ObjectId(conversationId) }
  
      // if (lastMessageTime) {
      //   query = { ...query, lastMessageTime: { $lt: new Date(lastMessageTime) } };
      // }
  
      const messages = await Messages.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .select("sender receiver message status timestamp")
        .lean()
  
      return NextResponse.json({ messages }, { status: 200 })
    } catch (error: any) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      )
    }
  }
  