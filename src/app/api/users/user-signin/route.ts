import { connect } from "@/src/dbconfig/dbconfig";
import { sendEmail } from "@/src/helpers/mailer";
import User from "@/src/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    console.log("MongoDB connected");

    const reqbody = await request.json();
    const { email } = reqbody;

    const user = await User.findOne({ email });
    if (!user) {
      const newUser = new User({ email });
      const savedUser = await newUser.save();
      await sendEmail({ email, userId: savedUser._id });
      return NextResponse.json({
        message: "User created successfully, OTP sent to email",
        success: true,
      });
    }

    await sendEmail({ email, userId: user._id });
    return NextResponse.json({ message: "OTP sent to email", success: true });
  } catch (error: any) {
    console.log("Error in API route:", error.message);
    return NextResponse.json(
      { message: `Error: ${error.message}`, success: false },
      { status: 500 }
    );
  }
}
