# Basketball Weihnachtsturnier - Test Instructions

## Setup & Seed-Daten

Die Datenbank wurde bereits mit Test-Daten gefüllt:
- 1 Turnier: "Weihnachtsturnier 2024" (Kategorie: U12)
- 4 Teams: Lakers, Bulls, Warriors, Celtics
- 24 Spieler (6 pro Team)
- 6 Spiele (Jeder gegen jeden)

### Admin Login
- **Username:** admin
- **Password:** admin123

## Test-Schritte

### 1. Login testen
1. Öffne: https://basketball-tourney.preview.emergentagent.com/login
2. Melde dich mit admin/admin123 an
3. Du solltest zum Admin-Dashboard weitergeleitet werden

### 2. Admin Dashboard testen

#### Turniere Tab
- Sieh das bestehende Turnier "Weihnachtsturnier 2024"
- Status sollte "Veröffentlicht" sein (grün)
- Erstelle ein neues Turnier:
  - Name: "Osterturnier 2025"
  - Kategorie: "U14"
  - Klicke "Turnier erstellen"

#### Teams Tab
- Wähle ein Turnier aus dem Dropdown
- Sieh alle Teams für das Turnier
- Erstelle ein neues Team:
  - Wähle Turnier
  - Name: z.B. "Rockets"
  - Klicke "Team erstellen"

#### Spieler Tab
- Wähle zuerst ein Turnier (damit Teams geladen werden)
- Sieh alle Spieler mit ihren Teams
- Erstelle einen neuen Spieler:
  - Wähle Team
  - Name: z.B. "Michael Jordan"
  - Nummer: z.B. "23"
  - Klicke "Spieler erstellen"

#### Spielplan Tab
- Wähle ein Turnier mit mindestens 2 Teams
- Klicke "Spielplan generieren"
- Es werden automatisch alle Spiele (Jeder gegen jeden) erstellt
- Anzahl Spiele = n*(n-1)/2 wobei n = Anzahl Teams

### 3. API Tests (Optional - für Entwickler)

```bash
# Alle Turniere
curl http://localhost:3000/api/tournaments

# Turnier Details
curl http://localhost:3000/api/tournaments/[ID]

# Teams für Turnier
curl http://localhost:3000/api/teams?tournamentId=[TOURNAMENT_ID]

# Spiele für Turnier
curl http://localhost:3000/api/games?tournamentId=[TOURNAMENT_ID]

# Neues Turnier erstellen
curl -X POST http://localhost:3000/api/tournaments \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Turnier","category":"U16"}'

# Spielplan generieren
curl -X POST http://localhost:3000/api/generate-schedule \
  -H "Content-Type: application/json" \
  -d '{"tournamentId":"[TOURNAMENT_ID]"}'
```

## Was bereits funktioniert ✅

### Backend
- ✅ MongoDB Verbindung
- ✅ Mongoose Models (Tournament, Team, Player, Game, User)
- ✅ NextAuth Authentifizierung
- ✅ Alle CRUD API Endpoints
- ✅ Spielplan-Generator (Round-Robin)
- ✅ Seed-Script für Test-Daten

### Frontend
- ✅ Homepage mit Turnier-Übersicht
- ✅ Login-Seite
- ✅ Admin Dashboard mit:
  - Turnierverwaltung
  - Team-Management
  - Spielerverwaltung
  - Spielplan-Generierung

## Nächste Features (In Arbeit)

### Kampfgericht Interface
- Live-Spielverwaltung
- Timer für Spiele
- Punkteeingabe (+1, +2, +3 Buttons)
- Spielerstatistiken live
- Undo-Funktion
- Spiel speichern

### Öffentlicher Bereich (Zuschauer)
- Turnierseite mit Tabs:
  - Tabelle/Ranking (mit Punkten, Spielen, +/-)
  - Spielplan (alle Spiele mit Status)
  - Statistiken (Top-Scorer, 1-Punkt-König, 3er-König)
- Einzelspiel-Ansicht mit Spielerstatistiken

## Bekannte Probleme

Keine bekannten Probleme im aktuellen Build.

## Technischer Stack

- **Framework:** Next.js 14 mit App Router
- **Sprache:** TypeScript
- **Datenbank:** MongoDB mit Mongoose
- **Authentifizierung:** NextAuth
- **UI:** TailwindCSS + shadcn/ui
- **Validierung:** Zod

## Umgebungsvariablen

Siehe `.env` Datei:
```
MONGO_URL=mongodb://localhost:27017/basketball
NEXTAUTH_URL=https://basketball-tourney.preview.emergentagent.com
NEXTAUTH_SECRET=basketball-tournament-secret-key-2024
```
