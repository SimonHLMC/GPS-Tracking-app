# GPS Tracking App für Feldarbeiten

Eine mobile Web-App zur Verfolgung von Feldarbeitsaufträgen mit GPS-Tracking, lokaler Datenspeicherung und automatischen Email-Reports.

## Features

✅ **GPS-Tracking** - Verfolge deine Position in Echtzeit während der Arbeiten  
✅ **OpenStreetMap** - Visualisiere deine Route auf einer interaktiven Karte  
✅ **Lokale Datenspeicherung** - Alle Daten werden sicher im Browser gespeichert  
✅ **Hektar-Erfassung** - Dokumentiere die bearbeitete Fläche  
✅ **Email-Reports** - Erhalte automatische Berichte nach Abschluss eines Auftrags  
✅ **Mobile-optimiert** - Funktioniert perfekt auf Handy und Tablet  

## GitHub Pages + Vercel Deployment

### GitHub Pages (Frontend)

1. Erstelle ein GitHub Repository: `gps-tracking-app`
2. Push dein Projekt:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/dein-username/gps-tracking-app.git
git push -u origin main
```

3. Enable GitHub Pages in Settings:
   - **Settings** → **Pages**
   - Branch: `main`, Folder: `/dist`

### Vercel (Backend API für Emails)

1. Gehe zu https://vercel.com und logge dich ein
2. Klick **New Project** → Wähle dein Repository
3. Build-Einstellungen:
   - Framework: **Next.js** (oder Vite mit Vercel)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables hinzufügen:
   - `GMAIL_USER` = deine-email@gmail.com
   - `GMAIL_APP_PASSWORD` = app-password
5. **Deploy** klicken

Die API läuft dann unter `https://dein-projekt.vercel.app/api/sendEmail`

### Final: API-URL anpassen

In [src/utils/email.ts](src/utils/email.ts#L31), ersetze:
```typescript
const apiUrl = 'https://dein-projekt.vercel.app/api/sendEmail';
```

## Email-Versand

### 🎯 Lokal (Development)
- ✅ **Funktioniert sofort ohne Setup**
- Demo-Modus: Emails werden simuliert und in der Browser-Konsole angezeigt
- Öffne **F12 → Console** um die Demo-Report-Daten zu sehen

### 🚀 Production (echte Emails)

Für echte Email-Versand brauchst du einen Vercel Backend:

1. Backend-Code ist bereits im `/api` Ordner vorhanden
2. Deploy zu Vercel:
   - Gehe zu https://vercel.com
   - "New Project" → Wähle dein GitHub-Repo
   - Vercel deployt automatisch mit GitHub Actions

3. Environment-Variablen bei Vercel registrieren:
   - **Settings** → **Environment Variables**
   - Füge hinzu:
     ```
     GMAIL_USER = deine-email@gmail.com
     GMAIL_APP_PASSWORD = 16-stelliges-app-password
     ```

4. Vercel-URL in App eintragen:
   - Erstelle `.env.local`:
     ```
     VITE_API_URL=https://dein-vercel-projekt.vercel.app
     ```

**Teste lokal zuerst mit `npm run dev` - Emails werden in der Console angezeigt!** 💡

## Gmail App-Password (für echten Versand)

Die App nutzt **Google OAuth2** für sichere Anmeldung. Du brauchst einen Google Cloud Project.

### Google Cloud Setup

1. Gehe zu **Google Cloud Console**: https://console.cloud.google.com

2. Neues Projekt erstellen:
   - Klick auf "Select a project" oben links
   - "New Project" 
   - Name: "GPS Tracking App"
   - Create

3. APIs aktivieren:
   - Suche "Google+ API" in der Suchleiste
   - Klick darauf → "Enable"

4. OAuth Consent Screen:
   - Linkes Menu → APIs & Services → OAuth consent screen
   - Wähle "External" 
   - Fülle aus:
     - App name: "GPS Tracking"
     - User support email: deine-email@gmail.com
     - Developer contact: deine-email@gmail.com
   - Save and Continue (über die nächsten Steps)

5. OAuth 2.0 Client erstellen:
   - Linkes Menu → Credentials
   - Create Credentials → OAuth 2.0 Client IDs
   - Application type: "Web application"
   - Name: "GPS Tracking App"
   - Authorized JavaScript origins hinzufügen:
     - `http://localhost:5173` (lokal)
     - `https://dein-username.github.io` (Production)
   - Authorized redirect URIs:
     - `http://localhost:5173` (lokal)
     - `https://dein-username.github.io` (Production)
   - Create

6. **Client ID kopieren** (die lange Nummer mit .apps.googleusercontent.com)

### In der App eintragen

**Lokal (Development):**
```bash
# Ersetze in src/App.tsx
<GoogleOAuthProvider clientId="DEINE_CLIENT_ID">

# Mit deiner echten Client ID
<GoogleOAuthProvider clientId="123456789-abcdef.apps.googleusercontent.com">
```

**Vercel (Production):**
(Verwende die gleiche Client ID, solange sie in deinen OAuth URIs eingetragen ist)

## Email-Einrichtung

### Step 1: Gmail App-Password generieren

1. Gehe zu: https://myaccount.google.com/apppasswords
2. Wähle "Mail" und "Windows Computer" (oder dein Gerät)
3. Generiere ein **App-Password** (16 Zeichen)
4. Kopiere das Passwort

### Step 2: Environment-Variablen setzen

**Lokal (Development):**
```bash
# Erstelle .env.local im Projekt-Root
GMAIL_USER=deine-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

**Auf Vercel (Production):**
1. Gehe zu deinem Vercel-Project → Settings → Environment Variables
2. Füge hinzu:
   ```
   GMAIL_USER = deine-email@gmail.com
   GMAIL_APP_PASSWORD = xxxx-xxxx-xxxx-xxxx
   ```
3. Speichere und deploye neu

### Step 3: API-Endpoint konfigurieren

In `src/utils/email.ts` zeile 31, ersetze:
```typescript
const apiUrl = 'https://dein-vercel-domain.vercel.app/api/sendEmail';
```
Mit deiner echten Vercel-URL.

## Sicherheit

⚠️ **Wichtig:** 
- Gibst du deinen Gmail-Account bei Vercel ein, wird er **auf Vercel-Servern** gespeichert
- App-Passwörter sind sicherer als echte Passwörter
- Aktiviere 2-Faktor-Authentifizierung in deinem Gmail
- Das App-Password kann jederzeit widerrufen werden

## Lokal testen mit Mailhog (Optional)

Falls du lokal ohne Gmail testen möchtest:

```bash
# Starte Mailhog (kostenlos)
npm install -g mailhog
mailhog

# Öffne: http://localhost:1025 für Emails
```

Dann in `.env.local`:
```
ADMIN_EMAIL_HOST=localhost
ADMIN_EMAIL_PORT=1025
```

## Offline-Benutzung

Die App funktioniert auch offline! Daten werden lokal im Browser gespeichert. Ohne Internet-Verbindung:
- ✅ GPS sperrt sich
- ✅ Karte lädt nicht neu
- ✅ Email kann nicht versendet werden

## Technologie

- **React 18** - UI-Framework
- **TypeScript** - Typsicherheit
- **Vite** - Build-Tool
- **Leaflet** - Kartenlibrary
- **EmailJS** - Email-Service
- **LocalStorage** - Datenspeicherung

## Browserkompatibilität

- ✅ Chrome/Edge (mobile & desktop)
- ✅ Firefox
- ✅ Safari (im privaten Modus nicht vollständig)
- ✅ Android Browser

## Tipps und Tricks

💡 **Für beste GPS-Genauigkeit:**
- Nutze die App im Freien
- Aktiviere "Hohe Genauigkeit" in Handy-Einstellungen
- Warte 30 Sekunden bis das GPS sperrt

💡 **Daten sichern:**
- Exportiere regelmäßig deine Aufträge
- Verwende mehrere Browser nicht gleichzeitig (LocalStorage kann überschrieben werden)

## Troubleshooting

**Problem: GPS funktioniert nicht**
- Stelle sicher, dass du die App über HTTPS aufrufst (GitHub Pages tut das)
- Überprüfe Ortungsberechtigung im Browser
- Nutze die App im Freien

**Problem: Karte wird nicht angezeigt**
- Überprüfe deine Internetverbindung (Karten brauchen Online)
- Warte kurz, die Tiles laden eventuell noch

**Problem: Emails werden nicht versendet**
- Überprüfe deine EmailJS Konfiguration
- Nutze gültige Email-Adresse
- Schaue in die Browser-Konsole (F12) für Fehler

## Lizenz

MIT

## Support

Für Fragen oder Probleme, erstelle ein Issue im GitHub Repository.
