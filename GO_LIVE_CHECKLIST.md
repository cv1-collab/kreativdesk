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

## 2. Supabase Auth & E-Mail-Provider (Go-Live Konfiguration)
Im Produktivbetrieb dürfen System-Mails (Einladungen, Passwort-Resets) nicht über das standardmässige Supabase-Ratelimit laufen, sondern über einen eigenen SMTP-Dienst:

1. **E-Mail-Provider anbinden:**
   - Gehe ins Supabase Dashboard -> **Authentication** -> **SMTP Settings**.
   - Wähle z. B. **Resend**, **SendGrid** oder den Firmen-Mailserver.
   - Absender-Adresse: `noreply@kreativdesk.ch` bzw. `support@kreativdesk.ch`.
   - Absender-Name: `Kreativ Desk Team`.
2. **Redirect URLs überprüfen:**
   - Supabase Dashboard -> **Authentication** -> **URL Configuration**.
   - **Site URL:** `https://www.kreativdesk.ch`
   - **Redirect URLs (Allowlist):**
     - `https://www.kreativdesk.ch/**`
     - `https://kreativdesk.ch/**`
     - `http://localhost:5173/**` (Nur für lokale Entwicklung)
3. **E-Mail-Templates anpassen:**
   - Bestätigungs-Mail, Passwort-Wiederherstellung und Magic Link im Firmen-Design mit deutschem Text hinterlegen.

---

## 3. Stripe Zahlungsabwicklung (Test -> Live)
Wenn echte Abonnements über Schweizer Franken (CHF) oder Euro (€) abgerechnet werden:

1. **API-Schlüssel austauschen:**
   - In den Vercel Environment Variables (`Vercel Dashboard -> Settings -> Environment Variables`):
     - `STRIPE_SECRET_KEY`: Von `sk_test_...` auf `sk_live_...` umstellen.
     - `VITE_STRIPE_PUBLISHABLE_KEY`: Von `pk_test_...` auf `pk_live_...` umstellen.
2. **Stripe Webhook anlegen:**
   - Im Stripe Live-Dashboard -> **Entwickler** -> **Webhooks**:
   - Endpunkt-URL hinzufügen: `https://www.kreativdesk.ch/api/stripe/webhook`
   - Abonnierte Events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Webhook-Secret (`whsec_...`) als `STRIPE_WEBHOOK_SECRET` in Vercel hinterlegen.
3. **Preis-IDs (Price IDs):**
   - Sicherstellen, dass die Tarif-Preise (`starter`, `pro`, `enterprise`) im Stripe Live-Katalog den IDs in `src/config/planFeatures.ts` entsprechen.

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
