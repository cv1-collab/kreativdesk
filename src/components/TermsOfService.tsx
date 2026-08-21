import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function TermsOfService() {
  const { language } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';

  return (
    <div className="min-h-screen bg-[#09090b] text-[#a1a1aa] py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-500/30">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors mb-10 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          {currentLang === 'de' ? 'Zurück zur Startseite' : 'Back to Homepage'}
        </Link>
        
        {currentLang === 'de' ? (
          <div className="space-y-12 leading-relaxed">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                <ShieldCheck size={14} /> Rechtliche Rahmenbedingungen
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#fafafa] mb-4">
                Allgemeine Geschäftsbedingungen (AGB)
              </h1>
              <p className="text-sm text-text-muted">
                Plattform „Kreativ Desk OS“ &middot; Stand: August 2026 &middot; Vescio Design GmbH, Schweiz
              </p>
            </div>

            <div className="space-y-8 bg-surface/50 border border-border p-8 rounded-3xl">
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">1. Geltungsbereich & Vertragspartner</h2>
                <p>
                  Diese Allgemeinen Geschäftsbedingungen (nachfolgend <strong>„AGB“</strong>) gelten für die Nutzung der webbasierten Softwareplattform <strong>„Kreativ Desk OS“</strong> sowie für alle damit verbundenen Dienstleistungen, B2B-Pakete (Studio OS, Agency OS, Enterprise OS) und SaaS-Abonnements (Starter, Pro, Expert).
                </p>
                <p>
                  Vertragspartner und Betreiberin der Plattform ist:<br />
                  <strong>Vescio Design GmbH</strong><br />
                  Nürenbergstrasse 15<br />
                  8037 Zürich, Schweiz<br />
                  E-Mail: <a href="mailto:info@vesciodesign.ch" className="text-blue-400 hover:underline">info@vesciodesign.ch</a><br />
                  UID: CHE-427.784.678 MWST
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">2. Vertragsgegenstand & Leistungsumfang</h2>
                <p>
                  Kreativ Desk OS ist ein spezialisiertes Projekt- und Betriebssystem zur Planung, Steuerung und Kollaboration in Architektur, Generalplanung, Bauwesen, Design und Agentur-Workflows.
                </p>
                <p>
                  Der genaue Funktionsumfang richtet sich nach dem gewählten Tarif (Self-Service SaaS oder B2B Enterprise System) und beinhaltet u.a. mandantenisolierte Datenräume, 3D BIM Viewer (IFC), Mängelmanagement mit Live-Sync, Budget- und Rechnungsverwaltung, Rollen- und Rechtemanagement (RBAC) sowie KI-gestützte Workflows.
                </p>
                <p>
                  Der Anbieter strebt eine jährliche durchschnittliche Systemverfügbarkeit von <strong>99.5 %</strong> an (ausgenommen angekündigte Wartungsfenster).
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">3. Registrierung, Benutzerkonten & Sorgfaltspflichten</h2>
                <p>
                  Die Nutzung der Plattform setzt die Erstellung eines Benutzerkontos voraus. Der Kunde verpflichtet sich, vollständige und wahrheitsgemässe Angaben zu machen und seine Zugangsdaten vor dem unbefugten Zugriff Dritter zu schützen.
                </p>
                <p>
                  Jede Nutzerlizenz (Seat) ist personengebunden und darf nicht von mehreren Personen gleichzeitig geteilt werden. Zusätzliche Lizenzen können jederzeit flexibel hinzugebucht werden.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">4. Preise, Zahlungskonditionen & Abrechnung</h2>
                <p>
                  Alle auf der Plattform ausgewiesenen Preise verstehen sich in <strong>Schweizer Franken (CHF) rein netto exklusive der gesetzlichen Mehrwertsteuer (exkl. MwSt.)</strong>.
                </p>
                <p>
                  Die Zahlungsabwicklung für SaaS-Abos erfolgt verschlüsselt und automatisiert über den Zahlungsdienstleister <strong>Stripe</strong> per Kreditkarte oder weiteren angebotenen Zahlungsmitteln.
                </p>
                <p>
                  Bei B2B-Paketen (Studio, Agency, Enterprise) wird die Setup- und Jahresgebühr für das erste Jahr gemäss individueller Offerte in Rechnung gestellt. Ab dem 2. Jahr gilt die jeweilige Flatrate-Lizenzgebühr.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">5. Vertragslaufzeit & Kündigung</h2>
                <p>
                  <strong>Monatliche Abonnements:</strong> Können jederzeit mit Wirkung zum Ende des laufenden Abrechnungsmonats direkt im Kundenportal (Stripe Customer Portal) gekündigt werden.
                </p>
                <p>
                  <strong>Jährliche Abonnements & B2B-Pakete:</strong> Verlängern sich jeweils um ein weiteres Jahr, sofern sie nicht vor Ablauf der jeweiligen Laufzeit gekündigt werden.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">6. Datenhoheit, geistiges Eigentum & KI-Nutzung</h2>
                <p>
                  <strong>100% Datenhoheit beim Kunden:</strong> Sämtliche vom Kunden hochgeladenen Dokumente, CAD-/IFC-Pläne, Finanzdaten, Notizen und Projektdateien verbleiben ausschliesslich im Eigentum des Kunden.
                </p>
                <p>
                  <strong>Kein KI-Training:</strong> Kundendaten werden unter keinen Umständen für das Training öffentlicher KI-Modelle verwendet. KI-Funktionen (wie der KI-Concierge oder Kollisionstests) verarbeiten Daten ausschliesslich temporär und isoliert zur Auftragsausführung.
                </p>
                <p>
                  Die Softwarearchitektur, Quellcodes, Schnittstellen und das UI-Design von Kreativ Desk OS sind urheberrechtlich geschütztes Eigentum der Vescio Design GmbH.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">7. Datenschutz & Datensicherheit (Schweizer Server)</h2>
                <p>
                  Die Datenverarbeitung erfolgt unter strikter Einhaltung des <strong>Schweizer Datenschutzgesetzes (DSG)</strong> sowie – soweit anwendbar – der DSGVO.
                </p>
                <p>
                  Alle Kundendaten werden auf sicheren <strong>Schweizer Servern</strong> mandantenisoliert gespeichert und nach modernsten Industriestandards (SSL/TLS, AES-256) verschlüsselt. Details regelt unsere separate <Link to="/privacy" className="text-blue-400 hover:underline">Datenschutzerklärung</Link>.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">8. Gewährleistung & Haftungsbeschränkung</h2>
                <p>
                  Die Haftung der Vescio Design GmbH richtet sich nach den zwingenden Bestimmungen des Schweizer Obligationenrechts (OR). Soweit gesetzlich zulässig, wird die Haftung für leichte Fahrlässigkeit, indirekte Schäden, Folgeschäden oder entgangenen Gewinn ausdrücklich ausgeschlossen.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">9. Schlussbestimmungen, Anwendbares Recht & Gerichtsstand</h2>
                <p>
                  Auf alle Rechtsbeziehungen zwischen den Parteien ist ausschliesslich <strong>materielles Schweizer Recht</strong> anwendbar (unter Ausschluss des UN-Kaufrechts/CISG).
                </p>
                <p>
                  Ausschliesslicher Gerichtsstand für sämtliche Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist der Sitz der Vescio Design GmbH in <strong>Zürich, Schweiz</strong>.
                </p>
              </section>
            </div>
          </div>
        ) : (
          <div className="space-y-12 leading-relaxed">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                <ShieldCheck size={14} /> Legal Framework
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#fafafa] mb-4">
                Terms of Service (AGB)
              </h1>
              <p className="text-sm text-text-muted">
                Platform „Kreativ Desk OS“ &middot; Effective Date: August 2026 &middot; Vescio Design GmbH, Switzerland
              </p>
            </div>

            <div className="space-y-8 bg-surface/50 border border-border p-8 rounded-3xl">
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">1. Scope & Contractual Partner</h2>
                <p>
                  These Terms of Service (hereinafter <strong>„Terms“</strong>) govern the use of the web-based software platform <strong>„Kreativ Desk OS“</strong> as well as all related services, B2B enterprise systems (Studio OS, Agency OS, Enterprise OS), and SaaS subscription plans (Starter, Pro, Expert).
                </p>
                <p>
                  Contractual partner and platform operator is:<br />
                  <strong>Vescio Design GmbH</strong><br />
                  Nürenbergstrasse 15<br />
                  8037 Zurich, Switzerland<br />
                  Email: <a href="mailto:info@vesciodesign.ch" className="text-blue-400 hover:underline">info@vesciodesign.ch</a><br />
                  UID: CHE-427.784.678 MWST
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">2. Scope of Services & System Availability</h2>
                <p>
                  Kreativ Desk OS is a dedicated project and operating system for planning, management, and visual collaboration in architecture, engineering, construction, and agency workflows.
                </p>
                <p>
                  The exact feature set depends on the chosen plan and includes tenant-isolated environments, 3D BIM Viewer (IFC), defect tracking with live sync, financial and invoicing management, role-based access control (RBAC), and AI-driven workflows.
                </p>
                <p>
                  The provider targets an annual average system uptime of <strong>99.5%</strong> (excluding scheduled maintenance windows).
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">3. Registration & User Accounts</h2>
                <p>
                  Accessing the platform requires an active user account. The customer agrees to provide accurate information and safeguard login credentials against unauthorized third-party access. User licenses (seats) are assigned per individual and cannot be shared concurrently.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">4. Pricing, Payments & Invoicing</h2>
                <p>
                  All prices stated on the platform are in <strong>Swiss Francs (CHF) net, excluding statutory VAT (excl. VAT)</strong>.
                </p>
                <p>
                  Payment processing for SaaS subscriptions is handled securely via <strong>Stripe</strong>. B2B systems are invoiced according to individual enterprise agreements.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">5. Term & Termination</h2>
                <p>
                  <strong>Monthly Plans:</strong> Can be cancelled at any time effective at the end of the current billing month via the built-in Stripe Customer Portal.
                </p>
                <p>
                  <strong>Annual Plans & B2B Packages:</strong> Renew automatically for subsequent annual periods unless cancelled prior to expiration.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">6. Data Sovereignty & AI Ethics</h2>
                <p>
                  <strong>100% Data Sovereignty:</strong> All customer data, CAD/IFC models, financial records, and files remain the sole property of the customer.
                </p>
                <p>
                  <strong>No AI Model Training:</strong> Customer data is never utilized to train public AI models.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">7. Data Protection & Swiss Hosting</h2>
                <p>
                  Data processing complies with the <strong>Swiss Federal Act on Data Protection (FADP/DSG)</strong> and applicable GDPR provisions. All customer data is hosted on secure <strong>Swiss servers</strong> with enterprise-grade encryption.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">8. Limitation of Liability</h2>
                <p>
                  Liability is governed by mandatory provisions of the Swiss Code of Obligations (CO). To the extent permitted by law, liability for slight negligence and consequential damages is excluded.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#fafafa]">9. Governing Law & Jurisdiction</h2>
                <p>
                  All legal relations between the parties shall be governed exclusively by <strong>substantive Swiss law</strong>.
                </p>
                <p>
                  The exclusive place of jurisdiction for all disputes is <strong>Zurich, Switzerland</strong>.
                </p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
