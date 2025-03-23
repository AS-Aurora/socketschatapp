import { connect } from "@/src/dbconfig/dbconfig"
import User from "@/src/models/userModel"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connect()
  
  try {
    const userId = params.id
    const user = await User.findById(userId).select("username profilePicture")
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json(user, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}