# Basketball Weihnachtsturnier - Deployment Guide

## 📦 Installation

1. **ZIP entpacken**
```bash
unzip basketball-tournament-app.zip
cd basketball-tournament-app
```

2. **Dependencies installieren**
```bash
yarn install
# oder
npm install
```

3. **MongoDB einrichten**
- MongoDB lokal installieren oder MongoDB Atlas verwenden
- Verbindungsstring in `.env` eintragen

4. **Environment Variables (.env)**
```
MONGO_URL=mongodb://localhost:27017/basketball
DB_NAME=basketball
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=basketball-tournament-secret-key-2024
CORS_ORIGINS=*
```

5. **Test-Daten laden**
```bash
# Server starten
yarn dev

# In einem neuen Terminal:
curl -X POST http://localhost:3000/api/seed
```

6. **App starten**
```bash
yarn dev
```

App läuft auf: http://localhost:3000

## 🔐 Login-Daten

Nach dem Seed-Script:
- **Username:** admin
- **Password:** admin123

## 🚀 Production Build

```bash
yarn build
yarn start
```

## 📁 Projekt-Struktur

```
/app
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # NextAuth
│   │   ├── tournaments/  # Turnier-APIs
│   │   ├── teams/        # Team-APIs
│   │   ├── players/      # Spieler-APIs
│   │   ├── games/        # Spiel-APIs
│   │   ├── generate-schedule/  # Spielplan-Generator
│   │   └── seed/         # Test-Daten
│   ├── admin/            # Admin Dashboard
│   ├── login/            # Login-Seite
│   ├── page.tsx          # Homepage
│   └── layout.tsx        # Root Layout
├── lib/
│   ├── models/           # Mongoose Models
│   │   ├── User.ts
│   │   ├── Tournament.ts
│   │   ├── Team.ts
│   │   ├── Player.ts
│   │   └── Game.ts
│   └── mongodb.ts        # DB Connection
├── components/ui/        # shadcn/ui Components
├── .env                  # Environment Variables
├── package.json
└── tsconfig.json
```

## 🛠️ Technologie-Stack

- **Framework:** Next.js 14 (App Router)
- **Sprache:** TypeScript
- **Datenbank:** MongoDB + Mongoose
- **Auth:** NextAuth v4
- **UI:** TailwindCSS + shadcn/ui
- **Validierung:** Zod
- **Icons:** Lucide React

## 📝 Features

### ✅ Implementiert (Phase 1 - Admin)
- User Authentication (NextAuth)
- Turnier erstellen & verwalten
- Teams hinzufügen
- Spieler hinzufügen (mit Nummer)
- Spielplan-Generator (Round-Robin)
- Turnier veröffentlichen

### 🚧 Noch zu implementieren
- Kampfgericht Interface (Live-Scoring)
- Öffentlicher Bereich (Zuschauer-Ansicht)
- Ranking-Tabelle mit Berechnung
- Statistiken (Top-Scorer, 3er-König, etc.)

## 🐛 Bekannte Probleme & Fixes

### Mongoose Schema-Fehler
Falls "Schema hasn't been registered" Fehler auftreten:
- Server neu starten: `yarn dev`
- Alle Models werden zentral in `lib/models/index.ts` importiert

### Port bereits verwendet
```bash
# Port 3000 freigeben
lsof -ti:3000 | xargs kill -9
```

## 📞 Support

Bei Fragen oder Problemen:
- Siehe TEST_INSTRUCTIONS.md für detaillierte Test-Anweisungen
- Alle API-Endpoints sind dokumentiert im Code
- Seed-Daten können mit `/api/seed` neu generiert werden

## 🎯 Next Steps

1. **Kampfgericht implementieren:**
   - Timer-Komponente
   - Live-Scoring Interface
   - +1, +2, +3 Buttons pro Spieler
   - Undo-Funktion

2. **Öffentlicher Bereich:**
   - Turnierseite mit Tabs
   - Ranking-Berechnung
   - Spielplan-Ansicht
   - Statistiken-Seite

3. **Optimierungen:**
   - Real-time Updates (WebSockets)
   - Responsive Design verbessern
   - Error Handling erweitern
