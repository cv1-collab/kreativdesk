import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function PrivacyPolicy() {
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
          <div className="space-y-16 leading-relaxed">
            
            {/* === 1. PRIVACY POLICY === */}
            <section>
              <h1 className="text-3xl md:text-4xl font-bold text-[#fafafa] mb-8">Datenschutzerklärung für Kreativ Desk OS</h1>
              <div className="space-y-6">
                <div>
                  <p><strong>1. Allgemeine Hinweise:</strong> Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges Anliegen. Diese Datenschutzerklärung informiert darüber, welche personenbezogenen Daten im Zusammenhang mit der Nutzung der Plattform „Kreativ Desk OS" verarbeitet werden. Die Verarbeitung personenbezogener Daten erfolgt unter Beachtung des Schweizer Datenschutzgesetzes (DSG) sowie - soweit anwendbar - der Datenschutz-Grundverordnung der Europäischen Union (DSGVO).</p>
                </div>
                <div>
                  <p><strong>2. Verantwortliche Stelle:</strong> Vescio Design GmbH, Nürenbergstrasse 15, 8037 Zürich, Schweiz. E-Mail: info@vesciodesign.ch Website: www.vesciodesign.ch</p>
                </div>
                <div>
                  <p><strong>3. Beschreibung der Plattform:</strong> Kreativ Desk OS ist eine cloudbasierte Softwareplattform für Projektmanagement, visuelle Kollaboration, BIM-/CAD- Workflows, Kl-gestützte Analysen, Whiteboard-Funktionen, Dokumentenverwaltung und kreative Planungsprozesse. Die Plattform richtet sich sowohl an gewerbliche Nutzer (B2B) als auch an Privatpersonen (B2C).</p>
                </div>
                <div>
                  <p><strong>4. Erhebung und Verarbeitung personenbezogener Daten:</strong> Wir verarbeiten personenbezogene Daten ausschliesslich im Rahmen der Bereitstellung und Nutzung der Plattform. Dabei können insbesondere folgende Daten verarbeitet werden: Name und Kontaktdaten, Firmeninformationen, Login- und Zugangsdaten, Rechnungs- und Zahlungsinformationen, Projekt- und Nutzungsdaten, hochgeladene Dateien und Dokumente, Whiteboard-Inhalte, Kommunikationsdaten, technische Geräte- und Browserinformationen, IP-Adressen und Logfiles, Audio-, Video- und Chatdaten bei Nutzung von Meetingfunktionen.</p>
                </div>
                <div>
                  <p><strong>5. Zwecke der Datenverarbeitung:</strong> Die Verarbeitung erfolgt insbesondere zu folgenden Zwecken: Bereitstellung und Betrieb der Plattform, Nutzerverwaltung und Authentifizierung, Vertragsabwicklung und Rechnungsstellung, Speicherung und Verarbeitung von Projektdaten, Durchführung von Video- und Chatfunktionen, KI-gestützte Funktionen und Analysen, Verbesserung der Plattform, Sicherheit und Missbrauchsprävention, Kommunikation mit Nutzern, Analyse und Optimierung der Nutzung der Plattform.</p>
                  <p className="mt-2">5.1 Die Verarbeitung personenbezogener Daten erfolgt auf Grundlage: der Vertragserfüllung, gesetzlicher Verpflichtungen, berechtigter Interessen, einer ausdrücklichen Einwilligung der betroffenen Person, sowie weiterer gesetzlich zulässiger Rechtsgrundlagen gemäss DSG und DSGVO.</p>
                </div>
                <div>
                  <p><strong>6. Nutzung von Künstlicher Intelligenz (KI):</strong> Kreativ Desk OS nutzt Funktionen, die auf Künstlicher Intelligenz basieren, insbesondere zur Analyse, Visualisierung und Generierung von Inhalten. Wenn Sie diese Funktionen nutzen, können Texteingaben (Prompts), Dateien oder Whiteboard-Inhalte über verschlüsselte API-Schnittstellen an externe KI-Dienstleister übermittelt werden. Die übermittelten Daten werden von diesen Anbietern ausschliesslich zur Ausführung des jeweiligen Auftrags (Inhaltsgenerierung) verarbeitet. Wir achten bei der Auswahl der API-Anbieter darauf, dass Ihre Daten nicht zum Training der öffentlichen KI-Modelle dieser Drittanbieter verwendet werden. Vom Nutzer übermittelte Inhalte werden durch den Anbieter nicht zum Training eigener öffentlich verfügbarer KI-Modelle verwendet.</p>
                </div>
                <div>
                  <p><strong>7. Einsatz von Drittanbietern und externen Diensten:</strong> Zur Bereitstellung und technischen Umsetzung der Systemarchitektur werden externe Dienstleister und Cloud-Dienste eingesetzt. Dabei können personenbezogene Daten an folgende Anbieter übermittelt oder durch diese verarbeitet werden: Google Firebase / Firestore (Hosting, Datenbank, Authentifizierung und Cloudfunktionen), Google Analytics (Analyse und Optimierung der Plattformnutzung), Google Gemini (Für Text- und Bildanalyse sowie KI-Zusammenfassungen via API), fal.ai (Für KI-Bildgenerierung und visuelle Renderings), Stripe (Zahlungsabwicklung und Abonnementverwaltung), Vercel (Hosting und Deployment des Frontends), Hostinger (Domainverwaltung und Hosting der Landingpage), Make.com (Automatisierung von Workflows und Datensynchronisation).</p>
                  <p className="mt-2">Datenübermittlung ins Ausland: Einige der genannten Dienstleister haben ihren Sitz ausserhalb der Schweiz und der EU (insbesondere in den USA). Eine Datenübermittlung in diese Länder erfolgt nur, wenn der gesetzliche Datenschutz durch geeignete Garantien - wie das Swiss-US / EU-US Data Privacy Framework oder von den Aufsichtsbehörden anerkannte Standardvertragsklauseln (SCCs) - sichergestellt ist.</p>
                </div>
                <div>
                  <p><strong>8. Zahlungsabwicklung:</strong> Die Zahlungsabwicklung erfolgt über externe Zahlungsdienstleister, insbesondere Stripe. Die Verarbeitung von Zahlungsdaten (z. B. Kreditkarteninformationen) erfolgt direkt durch den jeweiligen Zahlungsdienstleister gemäss dessen eigenen Datenschutzbestimmungen. Wir speichern keine vollständigen Kreditkartendaten auf unseren eigenen Servern.</p>
                </div>
                <div>
                  <p><strong>9. Speicherung und Aufbewahrung:</strong> Personenbezogene Daten werden nur so lange gespeichert, wie dies für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten (z. B. handels- oder steuerrechtliche Vorgaben) bestehen. Nach Beendigung des Vertragsverhältnisses und Ablauf der gesetzlichen Fristen werden die entsprechenden Daten routinemässig gelöscht.</p>
                </div>
                <div>
                  <p><strong>10. Datensicherheit:</strong> Wir treffen angemessene technische und organisatorische Sicherheitsmassnahmen zum Schutz personenbezogener Daten vor Verlust, Missbrauch, unberechtigtem Zugriff oder Offenlegung. Dennoch kann die vollständige Sicherheit der Datenübertragung im Internet nicht garantiert werden.</p>
                </div>
                <div>
                  <p><strong>11. Cookies und technische Informationen (Tracking):</strong> Die Plattform verwendet Cookies und vergleichbare lokale Speichertechnologien. Dabei unterscheiden wir strikt zwischen technisch zwingend notwendigen Daten (z. B. für den Login und die Session-Sicherheit via Firebase) und optionalen Analysediensten (wie Google Analytics). Technisch notwendige Speicherung: Erfolgt automatisch zur Sicherstellung des Plattformbetriebs. Analyse und Tracking: Der Einsatz von Analyse-Tools zur Auswertung des Nutzerverhaltens erfolgt ausschliesslich nach Ihrer ausdrücklichen Zustimmung (Opt-in) über unseren Consent-Manager. Weitere Details finden Sie in unserem separaten Cookie- und Tracking-Hinweis.</p>
                </div>
                <div>
                  <p><strong>12. Rechte betroffener Personen:</strong> Betroffene Personen haben im Rahmen der anwendbaren Datenschutzgesetze insbesondere das Recht auf: Auskunft über die verarbeiteten Daten, Berichtigung unrichtiger Daten, Löschung (Recht auf Vergessenwerden), Einschränkung der Verarbeitung, Datenübertragbarkeit (Herausgabe), Widerspruch gegen bestimmte Verarbeitungen. Anfragen zur Ausübung dieser Rechte können jederzeit an die unten genannte Kontaktadresse gerichtet werden.</p>
                </div>
                <div>
                  <p><strong>13. Änderungen dieser Datenschutzerklärung:</strong> Wir behalten uns das Recht vor, diese Datenschutzerklärung jederzeit anzupassen, insbesondere bei technischen Weiterentwicklungen der Systemarchitektur oder rechtlichen Änderungen. Die jeweils aktuelle Version wird auf der Plattform veröffentlicht.</p>
                </div>
                <div>
                  <p><strong>14. Kontakt:</strong> Bei Fragen zum Datenschutz oder zur Verarbeitung personenbezogener Daten können Sie uns jederzeit kontaktieren: Vescio Design GmbH, info@vesciodesign.ch, www.vesciodesign.ch</p>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            {/* === 2. COOKIE POLICY === */}
            <section>
              <h2 className="text-3xl font-bold text-[#fafafa] mb-6">Verwendung von Cookies und Tracking-Technologien</h2>
              <div className="space-y-6">
                <div>
                  <p>Kreativ Desk OS verwendet Cookies und vergleichbare Speichertechnologien (wie Local Storage und Session-Tokens), um die Kernfunktionalitäten der Plattform sicherzustellen, die Stabilität zu gewährleisten und die Nutzererfahrung kontinuierlich zu optimieren.</p>
                </div>
                <div>
                  <p>Dabei unterscheiden wir zwischen zwingend erforderlichen Diensten und optionalen Analyse-Tools:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>Technisch notwendige Dienste (z. B. Google Firebase):</strong> Diese Technologien sind für den reibungslosen Betrieb der SaaS-Plattform unerlässlich. Sie steuern das Session-Management, die sichere Authentifizierung (Login) und essenzielle Sicherheitsmechanismen. Diese Datenverarbeitung erfolgt auf Basis unseres berechtigten Interesses an der Bereitstellung der Plattform.</li>
                    <li><strong>Analyse- und Performance-Tracking (z. B. Google Analytics):</strong> Diese Dienste helfen uns, aggregierte Daten über das Nutzerverhalten zu erheben, um Ladezeiten, UI/UX-Flows und Systemarchitektur zu verbessern. Der Einsatz dieser Tracking-Technologien erfolgt ausschließlich nach Ihrer ausdrücklichen Zustimmung (Opt-in).</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">Speicherung und Kontrolle</h3>
                  <p>Cookies und Tokens sind kleine Datenpakete, die lokal auf Ihrem Endgerät gespeichert werden. Sie haben jederzeit die volle Kontrolle über Ihre Daten:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>Consent-Management:</strong> Sie können Ihre Zustimmung für optionale Analyse- Tools jederzeit über unsere Cookie-Einstellungen / Consent-Manager erteilen, anpassen oder widerrufen.</li>
                    <li><strong>Browser-Einstellungen:</strong> Sie können die Speicherung von Cookies und lokalen Daten direkt in den Einstellungen Ihres Browsers einschränken oder vollständig blockieren.</li>
                  </ul>
                  <p className="mt-4 text-sm text-text-muted">Hinweis: Wenn Sie technisch notwendige Cookies oder lokale Speicherdaten (Local Storage) in Ihrem Browser blockieren, können grundlegende Funktionen der Plattform - insbesondere der Login und die Session-Aufrechterhaltung - nicht mehr gewährleistet werden.</p>
                </div>
              </div>
            </section>

          </div>
        ) : (
          <div className="space-y-16 leading-relaxed">
            
            {/* === 1. PRIVACY POLICY (EN) === */}
            <section>
              <h1 className="text-3xl md:text-4xl font-bold text-[#fafafa] mb-8">Privacy Policy for Kreativ Desk OS</h1>
              <div className="space-y-6">
                <div>
                  <p><strong>1. General Information:</strong> The protection of your personal data is important to us. This Privacy Policy informs you about which personal data is processed in connection with the use of the "Kreativ Desk OS" platform. The processing of personal data is carried out in compliance with the Swiss Federal Act on Data Protection (FADP) and - where applicable - the General Data Protection Regulation (GDPR) of the European Union.</p>
                </div>
                <div>
                  <p><strong>2. Data Controller:</strong> Vescio Design GmbH Nürenbergstrasse 15 8037 Zurich Switzerland Email: info@vesciodesign.ch Website: www.vesciodesign.ch</p>
                </div>
                <div>
                  <p><strong>3. Description of the Platform:</strong> Kreativ Desk OS is a cloud-based software platform for project management, visual collaboration, BIM/CAD workflows, Al-supported analytics, whiteboard functions, document management, and creative planning processes. The platform is aimed at both commercial users (B2B) and private individuals (B2C).</p>
                </div>
                <div>
                  <p><strong>4. Collection and Processing of Personal Data:</strong> We process personal data exclusively within the scope of providing and using the platform. In particular, the following data may be processed: Name and contact details, Company information, Login and access data, Billing and payment information, Project and usage data, Uploaded files and documents, Whiteboard content, Communication data, Technical device and browser information, IP addresses and log files, Audio, video, and chat data when using meeting features.</p>
                </div>
                <div>
                  <p><strong>5. Purposes of Data Processing:</strong> The processing is carried out in particular for the following purposes: Provision and operation of the platform, User management and authentication, Contract execution and invoicing, Storage and processing of project data, Execution of video and chat functions, Al-supported functions and analytics, Improvement of the platform, Security and abuse prevention, Communication with users, Analysis and optimization of platform usage.</p>
                  <p className="mt-2">5.1 The processing of personal data is based on: the performance of a contract, legal obligations, legitimate interests, explicit consent of the data subject, as well as other legally permissible bases under the FADP and GDPR.</p>
                </div>
                <div>
                  <p><strong>6. Use of Artificial Intelligence (AI):</strong> Kreativ Desk OS utilizes features based on artificial intelligence, particularly for the analysis, visualization, and generation of content. When you use these features, text inputs (prompts), files, or whiteboard content may be transmitted to external Al service providers via encrypted API interfaces. The transmitted data is processed by these providers exclusively for the execution of the respective task (content generation). When selecting API providers, we ensure that your data is not used to train the public Al models of these third-party providers. Content submitted by the user is not used by the Provider to train its own publicly available Al models.</p>
                </div>
                <div>
                  <p><strong>7. Use of Third-Party Providers and External Services:</strong> External service providers and cloud services are used for the provision and technical implementation of the system architecture. In this context, personal data may be transmitted to or processed by the following providers: Google Firebase / Firestore (Hosting, database, authentication, and cloud functions), Google Analytics (Analysis and optimization of platform usage), Google Gemini (For text and image analysis, as well as AI summaries via API), fal.ai (For AI image generation and visual rendering), Stripe (Payment processing and subscription management), Vercel (Hosting and deployment of the frontend), Hostinger (Domain management and hosting of the landing page), Make.com (Automation of workflows and data synchronization).</p>
                  <p className="mt-2">Data transmission abroad: Some of the aforementioned service providers are based outside Switzerland and the EU (especially in the US). Data transmission to these countries only takes place if statutory data protection is ensured by appropriate safeguards - such as the Swiss-US / EU-US Data Privacy Framework or Standard Contractual Clauses (SCCs) recognized by the supervisory authorities.</p>
                </div>
                <div>
                  <p><strong>8. Payment Processing:</strong> Payment processing is handled via external payment service providers, in particular Stripe. The processing of payment data (e.g., credit card information) is carried out directly by the respective payment service provider in accordance with its own privacy policy. We do not store full credit card details on our own servers.</p>
                </div>
                <div>
                  <p><strong>9. Storage and Retention:</strong> Personal data is only stored for as long as necessary for the respective purposes or as required by statutory retention obligations (e.g., commercial or tax law requirements). Upon termination of the contractual relationship and expiration of the statutory periods, the corresponding data is routinely deleted.</p>
                </div>
                <div>
                  <p><strong>10. Data Security:</strong> We implement appropriate technical and organizational security measures to protect personal data against loss, misuse, unauthorized access, or disclosure. However, complete security of data transmission over the Internet cannot be guaranteed.</p>
                </div>
                <div>
                  <p><strong>11. Cookies and Technical Information (Tracking):</strong> The platform uses cookies and comparable local storage technologies. We strictly differentiate between technically mandatory data (e.g., for login and session security via Firebase) and optional analytics services (such as Google Analytics). Technically necessary storage: Occurs automatically to ensure platform operation. Analysis and tracking: The use of analytics tools to evaluate user behavior occurs exclusively upon your explicit consent (opt-in) via our Consent Manager. Further details can be found in our separate Cookie and Tracking Notice.</p>
                </div>
                <div>
                  <p><strong>12. Rights of Data Subjects:</strong> Under applicable data protection laws, data subjects have in particular the right to: Information about the processed data (Right of access), Correction of inaccurate data (Right to rectification), Deletion (Right to be forgotten), Restriction of processing, Data portability, Objection to certain processing. Requests to exercise these rights can be directed to the contact address mentioned above at any time.</p>
                </div>
                <div>
                  <p><strong>13. Amendments to this Privacy Policy:</strong> We reserve the right to adapt this Privacy Policy at any time, in particular in the event of technical advancements in the system architecture or legal changes. The current version will be published on the platform.</p>
                </div>
                <div>
                  <p><strong>14. Contact:</strong> If you have any questions about data protection or the processing of personal data, you can contact us at any time: Vescio Design GmbH, info@vesciodesign.ch, www.vesciodesign.ch</p>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            {/* === 2. COOKIE POLICY (EN) === */}
            <section>
              <h2 className="text-3xl font-bold text-[#fafafa] mb-6">Use of Cookies and Tracking Technologies</h2>
              <div className="space-y-6">
                <div>
                  <p>Kreativ Desk OS uses cookies and comparable storage technologies (such as Local Storage and Session Tokens) to ensure the core functionalities of the platform, maintain stability, and continuously optimize the user experience.</p>
                </div>
                <div>
                  <p>In doing so, we distinguish between strictly necessary services and optional analytics tools:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>Strictly necessary services (e.g., Google Firebase):</strong> These technologies are essential for the seamless operation of the SaaS platform. They handle session management, secure authentication (login), and core security mechanisms. This data processing is based on our legitimate interest in providing the platform.</li>
                    <li><strong>Analytics and performance tracking (e.g., Google Analytics):</strong> These services help us collect aggregated data about user behavior to improve load times, UI/UX flows, and system architecture. The use of these tracking technologies occurs strictly upon your explicit consent (opt-in).</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">Storage and Control</h3>
                  <p>Cookies and tokens are small data packets stored locally on your device. You have full control over your data at all times:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>Consent Management:</strong> You can grant, adjust, or revoke your consent for optional analytics tools at any time via our Cookie Settings / Consent Manager.</li>
                    <li><strong>Browser Settings:</strong> You can restrict or completely block the storage of cookies and local data directly in your browser settings.</li>
                  </ul>
                  <p className="mt-4 text-sm text-text-muted">Note: If you block strictly necessary cookies or local storage data in your browser, core functions of the platform-particularly login and session maintenance-can no longer be guaranteed.</p>
                </div>
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}