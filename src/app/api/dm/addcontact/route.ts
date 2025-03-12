import { connect } from "@/src/dbconfig/dbconfig";
import { getDataFromToken } from "@/src/helpers/getdatafromtoken";
import User from "@/src/models/userModel";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    await connect()
    const reqbody = await request.json();
    const { username, email } = reqbody;
    const userId = await getDataFromToken(request);

    if (!username || !email) {
      return NextResponse.json(
        { message: "Username and email are required" },
        { status: 400 }
      );
    }

    const sender = await User.findById(userId);
    console.log(sender);
    if (!sender) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    console.log(username, email)

    const receiver = await User.findOne({ username, email });
    console.log(receiver)
    if (!receiver) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (receiver._id.equals(sender._id)) {
      return NextResponse.json(
        { message: "You cannot add yourself" },
        { status: 400 }
      )
    }

    if (sender.contacts.includes(receiver._id)) {
      return NextResponse.json(
        { message: "User already added" },
        { status: 400 }
      );
    }

    sender.contacts.push(receiver._id);
    await sender.save();

    return NextResponse.json(
      { message: "User added Successfully", success: true },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
