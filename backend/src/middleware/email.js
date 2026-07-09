import nodemailer from "nodemailer";


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
        console.log("Message sent successfully", info.response);
        return { response: true, info }
    } catch (error) {
       console.error("Error sending Email:", error);
       return { response: false, error: error.message }; 
    }
}


export default MailSending;