import nodemailer from "nodemailer";

export async function GET() {
  return Response.json({ message: "Request Received" });
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log(data);

    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_PUBLIC_SMTP_HOST,
      port: 465, // or your SMTP port
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.NEXT_PUBLIC_SMTP_EMAIL, // your email
        pass: process.env.NEXT_PUBLIC_SMTP_PASSWORD + "$9",
      },
    });
    const info = await transporter.sendMail({
      from: "OSEKA<noreply@oseka.gr>", // sender address
      to: data.email, // list of receivers
      subject: data.subject, // Subject line
      text: data.message, // plain text body
      // html: '<b>Hello world?</b>', // html body
    });
    console.log("Message sent: %s", info.messageId);
    return Response.json(data);
  } catch (error) {
    console.log("Error is: ", error);
  }
}
