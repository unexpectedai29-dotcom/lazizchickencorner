import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route to send a real OTP via Nodemailer
  app.post('/api/send-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    try {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = Number(process.env.SMTP_PORT) || 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const fromAddress = process.env.SMTP_FROM || user || '"Laziz Chicken Corners" <no-reply@laziz.in>';

      let transporter;

      if (user && pass) {
        // Real SMTP client provided by settings secrets
        transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
        });
      } else {
        // Fallback to auto-generated test Ethereal account if no user SMTP exists (sends real email to Ethereal!)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log(`[SMTP] Ethereal fallback account initialized: ${testAccount.user}`);
      }

      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: `🔑 Laziz Chicken Corners - Your Email Sign-in OTP: ${otp}`,
        text: `Your Laziz Chicken Corners verification code is: ${otp}. Do not share this OTP with anyone.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0c0a09; color: #ffffff; border-radius: 8px; border: 1px solid #FF6B00; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #FF6B00; margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: bold;">LAZIZ CHICKEN CORNERS</h1>
              <p style="color: #a1a1aa; font-size: 14px; margin: 5px 0 0 0;">Flavorful Charcoal Grill since 2002</p>
            </div>
            <div style="background-color: #171717; padding: 24px; border-radius: 6px; border: 1px solid #27272a; text-align: center;">
              <p style="font-size: 16px; margin: 0 0 16px 0; color: #e4e4e7;">Your security verification code is:</p>
              <div style="font-size: 36px; font-weight: bold; color: #facc15; letter-spacing: 6px; padding: 12px 24px; background-color: #0e0e11; border-radius: 6px; display: inline-block; margin-bottom: 16px; border: 1px solid #333;">
                ${otp}
              </div>
              <p style="font-size: 12px; color: #a1a1aa; margin: 16px 0 0 0; line-height: 1.5;">This OTP is valid for 10 minutes. Please enter it in the checkout verification screen to complete your registration or login.</p>
            </div>
            ${!user || !pass ? `
            <div style="margin-top: 20px; padding: 12px; background-color: #1c1502; border: 1px solid #cca300; border-radius: 6px; font-size: 11px; color: #ffd633; line-height: 1.4;">
              <strong>Sandbox Note:</strong> This email was dispatched via an Ethereal SMTP test account because custom SMTP configuration credentials (SMTP_USER/SMTP_PASS) are not yet supplied in the environment.
            </div>
            ` : ''}
            <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #71717a;">
              📍 Sironj, near Nanni Bee Masjid. Store Service line: 9926715071
            </div>
          </div>
        `,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      res.json({
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
        isTestAccount: !user || !pass
      });
    } catch (err: any) {
      console.error('Failed to dispatch email OTP:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to deliver email.' });
    }
  });

  // Serve static assets and SPA pages
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Full-Stack Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
