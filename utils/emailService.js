import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to, subject, text) => {
    try {
        const serviceId = process.env.EMAILJS_SERVICE_ID;
        const templateId = process.env.EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.EMAILJS_PUBLIC_KEY;
        const privateKey = process.env.EMAILJS_PRIVATE_KEY;

        if (!serviceId || !templateId || !publicKey || !privateKey) {
            console.log("Mock Email Send (Missing EmailJS Credentials):");
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${text}`);
            return;
        }

        const data = {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            accessToken: privateKey,
            template_params: {
                to_email: to,
                subject: subject,
                message: text, // Assuming your template uses {{message}}
            }
        };

        await axios.post('https://api.emailjs.com/api/v1.0/email/send', data);
        console.log(`Email sent successfully via EmailJS to ${to}`);

    } catch (err) {
        console.error("EmailJS send failed:", err.response ? err.response.data : err.message);
    }
};
