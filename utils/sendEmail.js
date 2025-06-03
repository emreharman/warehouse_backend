const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.eu',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // 🔧 Zoho bazen TLS sorunları çıkarabiliyor
  },
});

module.exports = async function sendEmail({ to, subject, text, html }) {
  if (!to) return;
  await transporter.sendMail({
    from: `"ModTee Store" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};
