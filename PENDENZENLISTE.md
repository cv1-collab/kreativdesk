# 📌 Kreativ Desk OS – Offizielle Pendenzenliste (Feature Backlog)

Dieses Dokument dient als zentrale Pendenzenliste für zukünftige funktionale Erweiterungen von **Kreativ Desk OS**.  
Alle hier aufgeführten Punkte sind für spätere Releases vorgemerkt und werden **erst nach vollständiger Stabilisierung der Beta-Version** umgesetzt.

---

## 🏗️ Pendenzen für spätere Ausbaustufen

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
