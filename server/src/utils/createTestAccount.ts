import nodemailer from "nodemailer";

nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.log(err);
    return;
  }
  // create reusable transporter object using the default SMTP transport
  nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass, // generated ethereal password
    },
  });
  console.log(account.user, account.pass);
});
