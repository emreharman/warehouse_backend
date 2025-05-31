const express = require('express');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// POST ile test e-mail gönder
router.post('/send-test-email', async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
  }

  try {
    await sendEmail({ to, subject, text });
    res.status(200).json({ message: 'Test e-postası gönderildi!' });
  } catch (error) {
    console.error('Mail gönderim hatası:', error.message);
    res.status(500).json({ message: 'E-posta gönderilemedi.' });
  }
});

module.exports = router;
