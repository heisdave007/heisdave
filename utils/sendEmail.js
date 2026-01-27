import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
    try {
        const response = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: options.email,
            subject: options.subject,
            html: options.message
        });

        console.log('Email sent successfully:', response);
        return response;
    } catch (err) {
        console.error('Error sending email:', err.message);
        throw new Error('Error sending email: ' + err.message);
    }
};

export default sendEmail;
