import nodemailer from 'nodemailer';
import twilio from 'twilio';

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password
    },
});

export const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    } catch (error) {
        throw new Error('Failed to send email: ' + error.message);
    }
};



export const sendSMS = async (to, body) => {
    try {
        await twilioClient.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
    } catch (error) {   
        throw new Error('Failed to send SMS: ' + error.message);
    }
};




