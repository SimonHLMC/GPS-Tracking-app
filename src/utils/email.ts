import { Task, getTotalHectares } from './storage';

export interface ReportData {
  task: Task;
  mapImageData?: string;
}

export const sendReport = async (reportData: ReportData, userEmail: string): Promise<void> => {
  try {
    const task = reportData.task;
    const endTime = task.endTime || Date.now();
    const duration = new Date(endTime - task.startTime).toISOString().substring(11, 19);
    const totalHectares = getTotalHectares(task);

    const taskDetails = {
      name: task.name,
      startTime: new Date(task.startTime).toLocaleString('de-DE'),
      endTime: new Date(endTime).toLocaleString('de-DE'),
      duration: duration,
      hectares: totalHectares.toFixed(2),
      pointsCount: task.points.length,
    };

    const message = `
      Dein Feldarbeit-Report wurde erfolgreich generiert.
      
      Auftrag: ${task.name}
      Startzeit: ${taskDetails.startTime}
      Endzeit: ${taskDetails.endTime}
      Dauer: ${duration}
      Bearbeitete Hektare: ${totalHectares.toFixed(2)} ha
      GPS-Punkte: ${task.points.length}
    `;

    // Development-Modus: Demo-Email
    const isProd = import.meta.env.PROD;
    
    if (!isProd) {
      // 🎯 DEMO-MODUS: Zeige Email in der Konsole
      console.log('%c✅ DEMO-EMAIL GESTARTET', 'background: #4CAF50; color: white; padding: 10px; font-weight: bold; font-size: 14px;');
      console.log('%c📧 EMAIL-BERICHT', 'background: #2196F3; color: white; padding: 8px; font-weight: bold;');
      
      console.table({
        '📧 Empfänger': userEmail,
        '📌 Betreff': `Feldarbeit Report: ${task.name}`,
        '🎯 Auftrag': task.name,
        '⏱️ Startzeit': new Date(task.startTime).toLocaleString('de-DE'),
        '⏱️ Endzeit': new Date(endTime).toLocaleString('de-DE'),
        '⏳ Dauer': duration,
        '🌾 Hektare bearbeitet': `${totalHectares.toFixed(2)} ha`,
        '📍 GPS-Punkte': task.points.length,
      });
      
      console.log('%c✅ SUCCESS! Demo-Report ist bereit!', 'background: #4CAF50; color: white; padding: 10px; font-weight: bold;');
      return; // Erfolg im Demo-Modus
    }

    // Production: Echter API-Call (wird nicht lokal verwendet)
    console.log('🚀 Production-Modus: Versuche API-Versand...');
    const apiUrl = `${import.meta.env.VITE_API_URL || 'https://gps-tracker-api.vercel.app'}/api/sendEmail`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        subject: `Feldarbeit Report: ${task.name}`,
        message: message,
        taskDetails: taskDetails,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Fehler: ${response.status}`);
    }

    console.log('✅ Email via API versendet');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
