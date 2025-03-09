import { connect } from "@/src/dbconfig/dbconfig";
import User from "@/src/models/userModel";
import {NextRequest, NextResponse} from "next/server";


connect()

export async function GET(request: NextRequest, {params}: {params: {id: string}}) {
    try {
        const reqbody = await request.json()
        const {username} = reqbody
        const user = await User.findById(params.id).select('-password -otp')

        if(!user) {
            return NextResponse.json({message: 'User not found'}, {status: 404})
        }

        return NextResponse.json(user, {status: 200})
        
    } catch (error: any) {
        return NextResponse.json({message: error.message}, {status: 500})
    }
}

