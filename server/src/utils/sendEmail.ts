import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "",
    pass: "",
  },
});

export async function sendEmail(to: string, html: string) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to,
    subject: "Hello ✔", // Subject line
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}
