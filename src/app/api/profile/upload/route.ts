import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/src/helpers/cloudinary";
import { getDataFromToken } from "@/src/helpers/getdatafromtoken";
import User from "../../../../models/userModel";
import { connect } from "@/src/dbconfig/dbconfig";

connect();

export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized", success: false });
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { message: "No image provided", success: false },
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = imageFile.type.split("/")[1]; // "jpeg" for "image/jpeg"
    if (!["jpeg", "png", "jpg", "gif", "webp"].includes(extension)) {
      return NextResponse.json({ message: "Unsupported image format", success: false });
    }

    const base64 = buffer.toString("base64");
    const dataURI = `data:image/jpeg;base64,${base64}`

    const upload = await cloudinary.uploader.upload(dataURI, {
      folder: "chat_app_profile_pictures",
      resource_type: "image",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: upload.secure_url },
      { new: true }
    ).select("-password");

    console.log("Form Data: ", formData);
console.log("Image File: ", imageFile);
console.log("Image Type: ", imageFile.type);
console.log("Updated User:", updatedUser);


    return NextResponse.json({
      message: "Profile picture updated",
      user: updatedUser,
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
