import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to, subject, text) => {
    try {
        if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
            console.log("Mock Email Send (Missing Credentials):");
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${text}`);
            return;
        }

        await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            text,
        });
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error("Email send failed:", err);
    }
};
