# 📌 Kreativ Desk OS – Offizielle Pendenzenliste (Feature Backlog & To-Do)

Dieses Dokument dient als zentrale Pendenzenliste für **Kreativ Desk OS**.  

---

## 🎯 Priorität 1: Neue Preisstruktur, Stripe & RBAC Gastzugänge [ERLEDIGT ✅]

### 1. Neue Preisstruktur im Frontend (Landing Page, Pricing Page & Paywall)
- [x] **Self-Service SaaS Tarife aktualisiert:**
  - **Starter:** CHF 49 / Mt. (jährlich abgerechnet, CHF 588 / J.) bzw. CHF 59 / Mt. flexibel (1 Seat, 3 Projekte, 15 GB Speicher, 2D CAD).
  - **Pro (Beliebt):** CHF 89 / Mt. (jährlich abgerechnet, CHF 1'068 / J.) bzw. CHF 109 / Mt. flexibel (1 Seat, unbegrenzt Projekte, 100 GB Speicher, 3D BIM Viewer IFC, Mobile Mängel-App, KI-Briefing).
  - **Team Starter (Neu):** CHF 240 / Mt. (jährlich abgerechnet, CHF 2'880 / J.) bzw. CHF 290 / Mt. flexibel (Inkl. 3 Seats, 250 GB Speicher, zentrales Firmen-Dashboard, Basis-Rollen, QR-Rechnungen, Zusatz-Seat CHF 75/Mt.).
- [x] **B2B Projekt-Systeme (Aufteilung Software + Onboarding-Paket):**
  - **Studio OS:** CHF 6'800 / Jahr + Einmaliges Implementation Package CHF 3'500 (inkl. 5 Governance-Lizenzen, Kickoff-Workshop, Datenimport, 2h Admin-Schulung).
  - **Agency OS:** CHF 16'800 / Jahr + Einmaliges Implementation Package CHF 6'500 (inkl. 15 Governance-Lizenzen, Kollisionsprüfung im Browser, Whitelabeling, Workflow-Audit, Schnittstellen-Setup, Teamschulung).
  - **Enterprise OS:** Individuell ab CHF 45'000 / Jahr + Custom Engineering ab CHF 15'000 (SSO/SAML, ERP-Tiefenintegration wie Abacus/BauBit, dedizierte Schweizer Instanz, 99.9% SLA).
- [x] **Conversion-Hebel & Badges integriert:**
  - Vertrauensanker-Badge: *„🇨🇭 Vertrag nach Schweizer Recht (Zürich) • DSG- & DSGVO-konform • Serverstandort Schweiz“*.
  - Transparente Bulletpoints bei den Onboarding-Paketen statt abstraktem „Setup“.
  - Anker-Text am ROI-Rechner (*„Ein Büro mit 10 Mitarbeitern spart durchschnittlich CHF 18’400 / Jahr...“*).
  - Killer-Feature in allen Plänen hervorgehoben: *„✓ Unbegrenzte kostenlose Handwerker- & Bauherren-Zugänge“*.

### 2. RBAC Gastzugänge & Seat-Zählung korrigiert (ProjectTeam.tsx)
- [x] **Seat-Limit Bugfix in `ProjectTeam.tsx`:**
  - `checkSeatLimit()` so angepasst, dass **nur interne Mitarbeiter (`role === 'Internal'`)** gegen das bezahlte Seat-Kontingent gezählt werden.
  - Externe Handwerker (`Field Guest`), Bauherren (`Client Guest`) und Fachplaner (`Collaborator`) sind **kostenlos und unbegrenzt**.
- [x] **Berechtigungs-Schutz (Zero Leakage):**
  - Sicherstellen, dass Handwerker (`Field Guest` / Subunternehmer) nur ihnen zugewiesene Gewerke/Mängel sehen und BKP 100-900 / Finanzdaten strikt verborgen bleiben:
    - `src/config/permissions.ts`: `normalizeRole` leitet Handwerker, Subunternehmer und externe Gäste strikt auf `'guest'` mit Null-Toleranz-Fallback.
    - `src/hooks/usePermissions.ts`: Sperrt `canViewFinance`, `canViewProjectBudget`, `canEditBilling` und Admin-Rechte vollständig für Gäste/Handwerker.
    - `src/components/Finance.tsx` & `src/components/Layout.tsx`: BKP 100–900 Navigationspunkt und Finanz-Tab sind für Field Guests komplett ausgeblendet und mit 403 / Access Denied Screen abgesichert.
    - `src/components/Dashboard.tsx`: BKP-Budget-Karten, Budgetauslastungs-Charts und Budget-Varianz-Links werden für Handwerker durch ein geschütztes Gewerk- & Ticket-Panel ersetzt.
    - `src/components/Defects.tsx`: Handwerker sehen ausschliesslich Mängel ihres zugewiesenen Gewerks (`trade`) bzw. Mängel, bei denen sie als Zuweiser hinterlegt sind. Mängel anderer Gewerke und fremde Löschfunktionen sind gesperrt.
    - `api/_handlers/financial-ledger.ts`: Backend-Endpunkt weist Gast- und Handwerker-Anfragen mit `403 Forbidden` strikt ab.

### 3. Stripe & Subscription-Logik im Backend synchronisiert
- [x] **6 neue Stripe Price-IDs angelegt & eingetragen:**
  - Starter: Monat `price_1UJ7wAQTfAtOGrggmwM9ctT7` | Jahr `price_1UJ7wBQTfAtOGrgg0W8idkBn`
  - Pro: Monat `price_1UJ7wBQTfAtOGrggIHnw7NFO` | Jahr `price_1UJ7wBQTfAtOGrggKhnjecz8`
  - Team Starter: Monat `price_1UJ7wCQTfAtOGrggtc8sK2NT` | Jahr `price_1UJ7wCQTfAtOGrgg5jYFVujy`
  - In `src/services/stripeClient.ts` hinterlegt.
- [x] **Webhook & Limits angepasst:**
  - `api/webhook.ts`: Bei Buchung von Team Starter automatisch `max_seats: 3` zuweisen.
  - `src/hooks/useSubscriptionLimits.ts`, `src/utils/planFeatures.ts` & `src/utils/storageGuard.ts`:
    - Starter: 15 GB Speicher.
    - Pro: 100 GB Speicher.
    - Team Starter: 3 Seats, 250 GB Speicher, Invoicing, Rollen.
- [x] **Paywall (`TrialGuard.tsx`):**
  - Preise synchronisiert (49/59, 89/109, 240/290) und alte Hardcoded-Werte (30/149) endgültig abgelöst.

---

## 🏗️ Pendenzen für spätere Ausbaustufen (Backlog)

### 1. Digitales Bautagebuch & SIA-Baustellenbericht (SIA 118)
- **Ziel:** Rechtssichere, tägliche Baudokumentation für Schweizer Bauleiter und Architekten.
- **Funktionen:**
  - Schnelle Erfassung von Wetter/Temperatur, anwesenden Gewerken/Handwerkern, Tagesfortschritt und Vorkommnissen.
  - Direkte Verknüpfung mit den bestehenden Baustellen-Mängeln und Fotos.
  - 1-Klick-PDF-Export eines unterschriftsfertigen Baustellen-Tagesberichts für Bauherren und Behörden.
- **Status:** *Geparkt in Pendenzenliste*

### 2. SIA 118 Mängel- & Abnahmeprotokoll (PDF-Export)
- **Ziel:** Offizielles Bauabnahme-Dokument direkt aus dem bestehenden Mängelboard.
- **Funktionen:**
  - Exportfunktion im Mängelboard: Generiert ein druckfertiges, gebrandetes PDF-Dokument.
  - Enthält Fotos, Fristen, verantwortliche Handwerker und ein digitales Unterschriftenfeld für Bauleiter und Unternehmer.
- **Status:** *Geparkt in Pendenzenliste*

### 3. SIA 102 Phasen- & Honorar-Cockpit
- **Ziel:** Schweizer Honorarabrechnung nach SIA 102 Phasen (Vorprojekt, Bauprojekt, Bewilligung, Ausschreibung, Ausführung).
- **Funktionen:**
  - Visualisierung des Projektfortschritts pro SIA-Phase im Projekt-Dashboard.
  - Verknüpfung mit dem neuen `financialLedgerService.ts` zur Budget- und Margenüberwachung.
- **Status:** *Geparkt in Pendenzenliste*

### 4. Globales Command-Menu (`CMD + K`)
- **Ziel:** Schnelle Tastaturnavigation für Power-User im Büro.
- **Funktionen:**
  - Spotlight-Suchfenster für Projekte, Dokumente, Mängel, Rechnungen und Kunden.
- **Status:** *Geparkt in Pendenzenliste*

---

## 🎯 Aktueller Fokus: Stabilisierung, Sicherheit & Flüssigkeit
1. Bestehende Kernmodule (Finanzen, 3D BIM, Mängel, Dokumente, CRM, Projekte) zu 100% funktionsfähig halten.
2. Keine Regressionsfehler in der bestehenden Online-Beta.
3. Ruckelfreie, reaktive UI und lückenlose Mandantensicherheit (RLS).
