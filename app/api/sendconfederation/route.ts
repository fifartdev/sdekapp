import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";

const CONFEDERATION_RECIPIENTS = "ked.oseka@gmail.com, oseka@oseka.gr";

export async function POST(request: Request) {
  const data = await request.json();

  if (!data.subject || !data.message) {
    return NextResponse.json({ error: "Missing subject or message" }, { status: 400 });
  }

  try {
    await sendMail({
      to: CONFEDERATION_RECIPIENTS,
      subject: data.subject,
      text: data.message,
      from: "ΔΙΑΙΤΗΤΗΣ ΟΣΕΚΑ<oseka@fifart.net>",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send confederation email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }
}
