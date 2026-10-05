import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";

export async function POST(request: Request) {
  const data = await request.json();

  if (!data.email || !data.subject || !data.message) {
    return NextResponse.json({ error: "Missing email, subject, or message" }, { status: 400 });
  }

  try {
    await sendMail({ to: data.email, subject: data.subject, text: data.message });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }
}
