import nodemailer from "nodemailer";
import User from "../models/userModel";

export async function sendEmail({ email, userId }: any) {
  try {
    if (!email || !userId) {
      throw new Error("Missing required parameters");
    }

    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await User.findByIdAndUpdate(userId, { otp, otpExpires });

    const mailOptions = {
      from: "noreply@gmail.com",
      to: email,
      subject: "OTP for email verification",
      html: `<div style="max-width: 600px; margin: 0 auto;">
                <h1>OTP for email verification</h1>
                <p>Your OTP for verification in SocketChatApp is <strong>${otp}</strong>. It is valid for 10 minutes.</p>
             </div>`,
    };

    const mailresponse = await transport.sendMail(mailOptions);
    console.log("Mail sent successfully:", mailresponse);

    return { success: true, response: mailresponse };
  } catch (error: any) {
    console.log("Error in sendEmail:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
