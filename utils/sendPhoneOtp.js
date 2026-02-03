import dotenv from "dotenv";
dotenv.config();

export const sendPhoneOtp = async (phone, otp) => {
  try {
    if (!process.env.FAST2SMS_API_KEY) {
      console.log(`[MOCK] Phone OTP to ${phone}: ${otp} (Add FAST2SMS_API_KEY to .env for real SMS)`);
      return;
    }

    const message = `Your OTP is ${otp}`;

    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": process.env.FAST2SMS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "route": "otp",
        "variables_values": otp,
        "numbers": phone,
      })
    });

    const data = await response.json();
    console.log("SMS Sent Status:", data);
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
};
