import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: true,
    auth:{
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    }
});


async function MailSending(options) {
    const mailOptions = {
        from: options.from,
        to: options.email,
        subject:options.subject,
        text:options.message
    }

    try {
        const info  = await transporter.sendMail(mailOptions);
        return { response: true, info }
    } catch (error) {
       console.error("Error sending Email:", error);
        throw error
    }
}


export default MailSending;