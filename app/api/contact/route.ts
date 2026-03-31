import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, phone, subject, message } = body;

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "NEXA Rentals <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL || "info@nexarentals.es",
      replyTo: email,
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h2 style="color: #FF7A00; margin-bottom: 20px;">New Contact Form Submission</h2>

          <p><strong>Full Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
          <p><strong>Subject:</strong> ${subject}</p>

          <div style="margin-top: 20px;">
            <p><strong>Message:</strong></p>
            <div style="padding: 14px; background: #f7f7f7; border-radius: 8px; white-space: pre-line;">
              ${message}
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}