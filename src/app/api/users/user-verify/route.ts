import { connect } from "@/src/dbconfig/dbconfig";
import User from "@/src/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
     connect()
    console.log("Mongodb connected");
    try {
            
        const reqbody = await request.json();
        const { otp, email } = reqbody;

        if (!otp || !email) {
            return NextResponse.json({ success: false, message: "Missing OTP or email." }, { status: 400 });
        }
        
        const user = await User.findOne({
            email: email,
            otp: otp,
            otpExpires: { $gt: Date.now() }
        })

        if(!user) {
            return NextResponse.json({message: "Invalid OTP", success: false})
        }

        user.otp=""
        user.otpExpires=undefined
        await user.save()

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.TOKEN_SECRET!,
            { expiresIn: "7d" }
        );

        (await cookies()).set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/",
        });

        return NextResponse.json({
            success: true,
            message: "OTP verified successfully!"
        });
        
    } catch (error: any) {
        console.log("Error signing in", error.message);
        return NextResponse.json({message: "Error signing in"})
        
    }

    
}
