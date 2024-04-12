import nodemailer from "nodemailer";

// export async function GET() {
//   try {
//     return Response.json({ hello: "world" });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export async function POST(request) {
//   const data = await request.json();
//   console.log(data);
//   return Response.json(data);
// }

export async function GET() {
  Response.status(200).json({ message: "GET request received" });
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log(data);

    const transporter = nodemailer.createTransport({
      host: "mail.lexisagency.gr",
      port: 465, // or your SMTP port
      secure: true, // true for 465, false for other ports
      auth: {
        user: "webmaster@lexisagency.gr", // your email
        pass: "Supergiot@$9",
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
