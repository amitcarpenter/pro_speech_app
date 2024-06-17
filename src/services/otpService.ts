import nodemailer from 'nodemailer';

// Generate OTP 
export const generateOTP = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

interface SendOtpEmailOptions {
    to: string;
    otp: string;
}

// send email 
export const send_otp_on_email = async ({ to, otp }: SendOtpEmailOptions): Promise<void> => {
    const mailOptions = {
        from: EMAIL_USER,
        to,
        subject: 'Your Verification OTP Code',
        text: `Your OTP code is ${otp}. Please use this to verify your account.`,
        html: `<p>Your OTP code is <b>${otp}</b>. Please use this to verify your account.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${to}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Error sending OTP email');
    }
};
