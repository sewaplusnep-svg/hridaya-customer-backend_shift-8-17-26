const emailjs = require("@emailjs/nodejs");

const sendOtpEmail = async (email, otp) => {
  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        otp: otp,
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    console.log("OTP Email Sent Successfully:", response.status);

  } catch (error) {
    console.log("EmailJS Error:", error);
    throw error;
  }
};

module.exports = sendOtpEmail;