require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

async function testServices() {
    console.log('--- Testing MongoDB ---');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connection successful!');
        const dbInfo = await mongoose.connection.db.admin().serverStatus();
        console.log('MongoDB version:', dbInfo.version);
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
    }

    console.log('\n--- Testing SMTP ---');
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `FancyBazaar <${process.env.MAIL_FROM}>`,
            to: process.env.SMTP_USER, // sending to self for testing
            subject: 'Test Email from FancyBazaar',
            text: 'If you are reading this, your SMTP configuration is working perfectly!',
            html: '<b>If you are reading this, your SMTP configuration is working perfectly!</b>',
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (err) {
        console.error('❌ SMTP test failed:', err.message);
    }
}

testServices();
