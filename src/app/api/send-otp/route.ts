import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, language } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const isHi = language === "hi";

    // SMTP Configuration from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser || "no-reply@janmitra.gov.in";

    if (!smtpHost || !smtpUser || !smtpPass) {
      // Fallback for development: log to console if SMTP is not configured
      console.log("\n=========================================");
      console.log(`[SMTP NOT CONFIGURED] Fallback Log:`);
      console.log(`To: ${email}`);
      console.log(`Subject: JanMitra Security Passcode Verification / जनमित्र सुरक्षा पासकोड सत्यापन`);
      console.log(`OTP Code: ${otp}`);
      console.log("=========================================\n");

      return NextResponse.json({
        success: true,
        fallback: true,
        message: "SMTP is not configured in environment variables. OTP has been logged to the server console.",
      });
    }

    // Create transport
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const subject = isHi 
      ? "जनमित्र सुरक्षा पासकोड सत्यापन" 
      : "JanMitra Security Passcode Verification";

    const textHi = `नमस्ते,

आपके जनमित्र नागरिक खाते का पासवर्ड रीसेट करने के लिए आपका सुरक्षा सत्यापन कोड (ओटीपी) नीचे दिया गया है:

सत्यापन कोड (ओटीपी): ${otp}

यह कोड 10 मिनट के लिए मान्य है। यदि आपने यह अनुरोध नहीं किया था, तो कृपया इस ईमेल को अनदेखा करें।

धन्यवाद,
जनमित्र टीम
स्मार्ट गवर्नेंस और कमांड प्लेटफॉर्म`;

    const textEn = `Hello,

Your security verification code (OTP) to reset your JanMitra citizen portal password is:

Verification Code (OTP): ${otp}

This code is valid for 10 minutes. If you did not make this request, please ignore this email.

Regards,
JanMitra Team
Smart Governance & Command Platform`;

    const mailOptions = {
      from: `"JanMitra AI" <${smtpFrom}>`,
      to: email,
      subject: subject,
      text: isHi ? textHi : textEn,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
