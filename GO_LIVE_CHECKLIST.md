# 🚀 Kreativ Desk V2.0 – Offizielle Go-Live Checkliste & Production-Leitfaden

Dieser Leitfaden dokumentiert alle erforderlichen Schritte für die Umstellung von Test-/Entwicklungsumgebung auf den echten Produktivbetrieb von **Kreativ Desk V2.0**.

---

## 1. Domain, SSL & CDN (Bereits Aktiv ✅)
- **Produktiv-URL:** [https://www.kreativdesk.ch](https://www.kreativdesk.ch)
- **Hosting-Provider:** Vercel Pro
- **Zertifikat:** Let's Encrypt Wildcard SSL (Automatisch erneuert)
- **HTTP/2 & Brotli Compression:** Aktiviert
- **Vercel Aliase:** `www.kreativdesk.ch` und `kreativdesk.ch` leiten synchron auf die aktuellste Release-Bereitstellung.

---

## 2. E-Mail-Versand & Benachrichtigungen (Bereits Aktiv via Make.com ✅)
Der Versand von System-E-Mails läuft nicht über das Standard-Supabase-Ratelimit, sondern ist vollständig über **Make.com Webhooks** automatisiert:
- **Passwort-Reset:** `/api/send-reset-webhook` generiert den sicheren Wiederherstellungs-Link via Supabase Admin API und triggert den Make.com Webhook (`RESET_WEBHOOK_URL`), welcher die gebrandete E-Mail versendet.
- **Willkommens- & Onboarding-Mails:** `/api/send-welcome-webhook` übergibt Neuregistrierungen direkt an Make.com (`WELCOME_WEBHOOK_URL`).
- **Videocall-Einladungen:** `/api/send-invite-webhook` sendet Einladungen über Make.com (`INVITE_WEBHOOK_URL`).
- **Kein Supabase-Ratelimit:** Da Supabase die Mails nicht selbst versendet, sondern Make.com die Auslieferung übernimmt, besteht keine 3-Mails/Stunde-Begrenzung.

---

## 3. Stripe Zahlungsabwicklung (Bereits Aktiv im Live-Modus ✅)
Echte Zahlungen in Schweizer Franken (CHF) und Euro (€) sind bereits live:
- **Live-Schlüssel aktiv:** `STRIPE_SECRET_KEY` (`sk_live_...`) und `VITE_STRIPE_PUBLISHABLE_KEY` (`pk_live_...`) sind in der Produktionsumgebung hinterlegt.
- **Webhook-Verbindung:** `/api/webhook` verarbeitet `checkout.session.completed`, `customer.subscription.updated` und `customer.subscription.deleted`.
- **Tarif-IDs:** Entsprechen den Live-Produkt-IDs in `src/config/planFeatures.ts`.

---

## 4. Supabase Storage & Bucket-Sicherheit
Kreativ Desk nutzt folgende Storage-Buckets:
* `documents`: Verträge, Pläne, Exporte, temporäre Belege.
* `bim-models`: 3D-BIM-Modelle (.ifc).
* `signatures`: Digitale Unterschriften.
* `avatars`: Benutzer- und Firmenlogos.

**Sicherheits-Check:**
- Alle Buckets verfügen über RLS-Policies (Row Level Security), die sicherstellen, dass Benutzer nur Dateien ihrer eigenen `company_id` lesen und schreiben können.
- Maximale Upload-Größe für `bim-models` auf mindestens 100 MB setzen (im Supabase Dashboard unter **Storage** -> **Settings**).

---

## 5. Automatisierte Qualitätssicherung (CI/CD)
- Die GitHub Action [`.github/workflows/ci.yml`](.github/workflows/ci.yml) läuft bei jedem Push auf den `main`-Branch automatisch durch.
- **Automatische Prüfungen:**
  1. `npx tsc --noEmit` (Vollständige statische Typenprüfung gegen das reale PostgreSQL-Schema)
  2. `npm run lint` (Code-Stil und Best Practices)
  3. `npm run build` (Vite & Node Server Bundle-Kompilierung)
- Es kann kein fehlerhafter Code in die Produktion gelangen, der diese Tests nicht besteht.

---

## 6. Datenbank-Backups & Wiederherstellung
- Supabase führt standardmäßig tägliche Point-in-Time-Backups (PITR) durch.
- Vor größeren Schema-Migrationen empfiehlt sich ein manueller Snapshot:
  - Supabase Dashboard -> **Database** -> **Backups** -> **Take manual backup**.
