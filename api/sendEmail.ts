import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, subject, message, taskDetails } = req.body;

  // Validierung
  if (!email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Nutze Umgebungsvariablen für Gmail-Credentials
    const emailUser = process.env.GMAIL_USER;
    const emailPass = process.env.GMAIL_APP_PASSWORD;

    if (!emailUser || !emailPass) {
      return res.status(500).json({ 
        error: 'Email service not configured. Contact administrator.' 
      });
    }

    // Erstelle Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Formattiere HTML-Email
    const htmlContent = `
      <h2>Feldarbeit Report</h2>
      <p><strong>Auftrag:</strong> ${taskDetails?.name || 'N/A'}</p>
      <p><strong>Startzeit:</strong> ${taskDetails?.startTime || 'N/A'}</p>
      <p><strong>Endzeit:</strong> ${taskDetails?.endTime || 'N/A'}</p>
      <p><strong>Dauer:</strong> ${taskDetails?.duration || 'N/A'}</p>
      <p><strong>Bearbeitete Hektare:</strong> ${taskDetails?.hectares || 'N/A'} ha</p>
      <p><strong>GPS-Punkte erfasst:</strong> ${taskDetails?.pointsCount || 'N/A'}</p>
      <hr />
      <p>${message}</p>
    `;

    // Sende Email
    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: subject,
      html: htmlContent,
      text: message,
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
