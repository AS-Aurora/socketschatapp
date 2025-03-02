import { connect } from "@/src/dbconfig/dbconfig";
import { NextRequest, NextResponse } from "next/server";
import Message from "../../../models/messageModel"

connect()

export async function getMessages() {
    try {
        
    } catch (error: any) {
        return NextResponse.json({message: error.message}, {status: 500})
    }
}