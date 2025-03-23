import { connect } from "@/src/dbconfig/dbconfig";
import { getDataFromToken } from "@/src/helpers/getdatafromtoken";
import User from "@/src/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Conversation from "@/src/models/conversationModel";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const conversations = await Conversation.find({ members: userId })
      .sort({ lastMessageTime: -1 }) // Sort by latest message
      .select("members lastMessageTime") // Include lastMessageTime
      .lean();

    if (!conversations.length) {
      return NextResponse.json({ error: "No conversations found" }, { status: 200 });
    }

    const contactMap = new Map(); // To avoid duplicates

    conversations.forEach((conv) => {
      conv.members.forEach((memberId: mongoose.Types.ObjectId) => {
        if (memberId.toString() !== userId.toString()) {
          contactMap.set(memberId.toString(), {
            lastMessageTime: conv.lastMessageTime,
          });
        }
      });
    });

    const contactIds = [...contactMap.keys()];

    const contacts = await User.find({ _id: { $in: contactIds } })
      .select("_id username profilePicture")
      .lean() as unknown as Array<{ _id: mongoose.Types.ObjectId; username: string; profilePicture: string }>;

    // Merge contacts with lastMessageTime
    const contactsWithLastMessageTime = contacts.map((contact) => ({
      ...contact,
      lastMessageTime: contactMap.get(contact?._id.toString())?.lastMessageTime || null,
    }));

    return NextResponse.json(contactsWithLastMessageTime, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/dm/contacts:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
