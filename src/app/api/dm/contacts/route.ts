import { connect } from "@/src/dbconfig/dbconfig";
import { getDataFromToken } from "@/src/helpers/getdatafromtoken";
import User from "@/src/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

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

        const user = await User.findById(userId)
            .populate("contacts", "_id username profilePicture")
            .exec()

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.contacts, { status: 200 });

    } catch (error: any) {
        console.error("Error in /api/dm/contacts:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
