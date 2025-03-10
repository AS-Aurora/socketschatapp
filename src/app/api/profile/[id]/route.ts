import { connect } from "@/src/dbconfig/dbconfig";
import User from "@/src/models/userModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


connect()


export async function GET(request: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }
    try {
        const user = await User.findById(id).select("-password -otp");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        return NextResponse.json(user, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function PUT(request: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params
    try {
        const reqBody = await request.json();
        const { username } = reqBody;

        if (!username) {
            return NextResponse.json({ message: "Username required" }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { username },
            { new: true, runValidators: true }
        ).select("-password -otp");

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
