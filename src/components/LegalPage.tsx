import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function LegalPage() {
  const { language } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  
  const [legalDocs, setLegalDocs] = useState<any>({});

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'systemConfig', 'legalDocuments'), (snap) => {
      if (snap.exists()) {
        setLegalDocs(snap.data());
      }
    });
    return () => unsub();
  }, []);

  const renderDownloadButton = (docType: string, label: string) => {
    const fileUrl = legalDocs[docType]?.url;
    if (!fileUrl) return null;
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-sm font-bold transition-all w-fit">
        <Download size={16} /> {label} (PDF)
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#a1a1aa] py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-500/30">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors mb-10 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          {currentLang === 'de' ? 'Zurück zur Startseite' : 'Back to Homepage'}
        </Link>
        
        {Object.keys(legalDocs).length > 0 && (
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 md:p-10 mb-12 shadow-2xl">
             <h2 className="text-2xl font-bold text-[#fafafa] mb-6">Offizielle Dokumente (Downloads)</h2>
             <p className="text-sm mb-6">Hier finden Sie die aktuell gültigen Vertragsdokumente zum Download.</p>
             <div className="flex flex-wrap gap-4">
               {renderDownloadButton('agb', 'Allgemeine Geschäftsbedingungen')}
               {renderDownloadButton('avv', 'Auftragsverarbeitungsvertrag (AVV/DPA)')}
               {renderDownloadButton('sla', 'Service Level Agreement (SLA)')}
               {renderDownloadButton('beta', 'Beta Terms / Haftungsausschluss')}
             </div>
          </div>
        )}

        {currentLang === 'de' ? (
          <div className="space-y-16 leading-relaxed">
            
            {/* === 1. AGB === */}
            <section>
              <h1 className="text-3xl md:text-4xl font-bold text-[#fafafa] mb-8">1. Allgemeine Geschäftsbedingungen (AGB) für SaaS-Dienstleistungen</h1>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">1. Geltungsbereich und Vertragsgegenstand</h3>
                  <p>1.1 Diese Allgemeinen Geschäftsbedingungen (AGB) regeln das Vertragsverhältnis zwischen der Vescio Design GmbH, Nürenbergstrasse 15, 8037 Zürich, Schweiz (nachfolgend „Anbieter") und den Nutzern (nachfolgend „Kunde") der webbasierten Softwareplattform „Kreativ Desk OS" (nachfolgend „Plattform").</p>
                  <p>1.2 Das Angebot richtet sich an gewerbliche Kunden (B2B), Unternehmen, Selbstständige, Organisationen sowie an Privatpersonen (Konsumenten bzw. Verbraucher).</p>
                  <p>1.3 Abweichende Geschäftsbedingungen des Kunden finden keine Anwendung, sofern ihrer Geltung nicht ausdrücklich schriftlich zugestimmt wurde.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">2. Leistungen der Plattform</h3>
                  <p>2.1 Der Anbieter stellt dem Kunden die Plattform als cloudbasierte Software-as-a-Service-Lösung (SaaS) zur Verfügung.</p>
                  <p>2.2 Die Plattform kann insbesondere folgende Funktionen enthalten: Projektmanagement, CAD- und BIM-Viewing, Whiteboard- und Kollaborationstools, KI-gestützte Analysen und Generierung, PDF- und Dokumentenverwaltung, Rendering- und Visualisierungstools, Cloudspeicherung und Dateiverarbeitung.</p>
                  <p>2.3 Der konkrete Leistungsumfang richtet sich nach dem vom Kunden gewählten Abonnement-Modell.</p>
                  <p>2.4 Der Anbieter ist berechtigt, Funktionen technisch weiterzuentwickeln, anzupassen oder zu verändern, sofern dadurch der wesentliche Vertragszweck nicht erheblich beeinträchtigt wird.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">3. Registrierung und Account-Sicherheit</h3>
                  <p>3.1 Die Nutzung der Plattform setzt die Erstellung eines Nutzerkontos voraus. Die Registrierung ist ausschliesslich volljährigen und unbeschränkt geschäftsfähigen Personen (Mindestalter 18 Jahre) gestattet.</p>
                  <p>3.2 Der Kunde verpflichtet sich, vollständige und wahrheitsgemässe Angaben bereitzustellen.</p>
                  <p>3.3 Der Kunde ist verpflichtet, Zugangsdaten vertraulich zu behandeln und vor dem Zugriff unberechtigter Dritter zu schützen.</p>
                  <p>3.4 Der Kunde haftet für sämtliche Aktivitäten, die über sein Nutzerkonto erfolgen.</p>
                  <p>3.5 Der Anbieter haftet nicht für Schäden, die durch unbefugten Zugriff infolge unzureichender Sicherung der Zugangsdaten durch den Kunden entstehen.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">4. Preise, Zahlungsbedingungen und Vertragslaufzeit</h3>
                  <p>4.1 Die Nutzung kostenpflichtiger Funktionen erfolgt im Rahmen wiederkehrender Abonnements.</p>
                  <p>4.2 Die jeweils aktuellen Preise und Leistungsumfänge werden auf der Website oder innerhalb der Plattform veröffentlicht. Soweit nicht anders ausgewiesen, verstehen sich die Preise für Konsumenten inklusive, für Geschäftskunden (B2B) exklusive der gesetzlichen Mehrwertsteuer.</p>
                  <p>4.3 Die Zahlungsabwicklung erfolgt über externe Zahlungsdienstleister, insbesondere Stripe.</p>
                  <p>4.4 Der Kunde ermächtigt den Anbieter, wiederkehrende Zahlungen automatisch über die hinterlegte Zahlungsmethode einzuziehen.</p>
                  <p>4.5 Die Laufzeit dieses Vertrages ist unbefristet. Beide Vertragspartner können den Vertrag jederzeit mit einer Kündigungsfrist von einem (1) Monat zum Ende der jeweils laufenden Abrechnungsperiode kündigen.</p>
                  <p>4.6 Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zur Plattform vorübergehend einzuschränken oder zu sperren.</p>
                  <p>4.7 Widerrufsrecht für Konsumenten (B2C): Ist der Kunde ein Konsument mit Wohnsitz in der EU, steht ihm grundsätzlich ein gesetzliches Widerrufsrecht von 14 Tagen zu. Ausnahme: Der Kunde stimmt ausdrücklich zu, dass der Anbieter mit der Vertragserfüllung (Bereitstellung der SaaS-Dienste) vor Ablauf der Widerrufsfrist beginnt. Dem Kunden ist bekannt, dass er durch diese Zustimmung sein Widerrufsrecht mit Beginn der Vertragsausführung verliert.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">5. Nutzung von Künstlicher Intelligenz (KI)</h3>
                  <p>5.1 Die Plattform kann Funktionen enthalten, die auf generativer künstlicher Intelligenz basieren, insbesondere für Renderings, Textgenerierung, Analysen, Zusammenfassungen oder Berechnungen.</p>
                  <p>5.2 KI-generierte Inhalte können fehlerhaft, unvollständig oder ungeeignet sein und ersetzen keine fachliche Prüfung.</p>
                  <p>5.3 Der Anbieter übernimmt keine Gewährleistung oder Haftung für: technische Richtigkeit, rechtliche Zulässigkeit, wirtschaftliche Verwendbarkeit, bauliche Umsetzbarkeit, Vollständigkeit oder Fehlerfreiheit der KI- generierten Ergebnisse.</p>
                  <p>5.4 Der Kunde ist verpflichtet, sämtliche Kl-generierten Inhalte vor produktiver Nutzung eigenständig fachlich zu prüfen.</p>
                  <p>5.5 Die Nutzung KI- generierter Inhalte erfolgt ausschliesslich auf eigenes Risiko des Kunden.</p>
                  <p>5.6 Soweit gesetzlich zulässig, verbleiben sämtliche Rechte an den durch den Kunden erzeugten Kl-generierten Inhalten beim Kunden. Der Anbieter beansprucht keine Eigentumsrechte an kundenspezifischen KI-Ausgaben oder Projektergebnissen.</p>
                  <p>5.7 Vom Kunden eingegebene Inhalte, Dateien, Pläne, Dokumente oder Prompts werden vom Anbieter nicht zum Training eigener öffentlich zugänglicher KI-Modelle verwendet.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">6. Verfügbarkeit und Service Level</h3>
                  <p>6.1 Der Anbieter bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit der Plattform.</p>
                  <p>6.2 Eine bestimmte Mindestverfügbarkeit oder permanente Erreichbarkeit wird nicht garantiert, sofern keine separate SLA-Vereinbarung abgeschlossen wurde.</p>
                  <p>6.3 Wartungsarbeiten, Sicherheitsupdates, höhere Gewalt oder technische Störungen bei Drittanbietern können zu temporären Einschränkungen führen.</p>
                  <p>6.4 Ausfallzeiten berechtigen nicht zu Schadensersatzansprüchen oder Rückforderungen, sofern keine zwingenden gesetzlichen Vorschriften entgegenstehen.</p>
                  <p>6.5 Die Plattform dient ausschliesslich der Unterstützung, Verwaltung, Visualisierung und Dokumentation von Projekten. Sie ersetzt keine fachliche Prüfung, Freigabe oder Verantwortung durch qualifizierte Architekten, Ingenieure, Fachplaner, Bauleiter oder sonstige Fachpersonen.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">7. Zulässige Nutzung</h3>
                  <p>7.1 Der Kunde verpflichtet sich, die Plattform ausschliesslich im Rahmen geltender Gesetze zu nutzen.</p>
                  <p>7.2 Untersagt sind insbesondere: Upload rechtswidriger Inhalte, Verletzungen von Urheberrechten oder Datenschutzrechten, Verbreitung von Schadsoftware, missbräuchliche API-Nutzung, Sicherheitsangriffe, Reverse Engineering, automatisierte Massennutzung ohne Zustimmung des Anbieters.</p>
                  <p>7.3 Der Anbieter ist berechtigt, Inhalte zu entfernen oder Accounts temporär oder dauerhaft zu sperren, sofern ein Verstoss gegen diese AGB vorliegt.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">8. Urheberrechte und Nutzungsrechte</h3>
                  <p>8.1 Alle Rechte an der Plattform, Software, Designs, Marken und Systemarchitektur verbleiben beim Anbieter.</p>
                  <p>8.2 Der Kunde erhält ein einfaches, nicht übertragbares und zeitlich auf die Vertragsdauer beschränktes Nutzungsrecht an der Plattform.</p>
                  <p>8.3 Die Rechte an hochgeladenen Dateien, Plänen, Texten und Inhalten verbleiben beim Kunden.</p>
                  <p>8.4 Der Kunde räumt dem Anbieter das notwendige technische Recht ein, Inhalte zu speichern, zu verarbeiten und an integrierte Dienste oder KI-Schnittstellen zu übertragen, soweit dies zur Vertragserfüllung erforderlich ist.</p>
                  <p>8.5 Der Kunde ist selbst verantwortlich dafür, dass hochgeladene Inhalte keine Rechte Dritter verletzen.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">9. Datenschutz und Datenverarbeitung</h3>
                  <p>9.1 Die Verarbeitung personenbezogener Daten erfolgt gemäss der Datenschutzerklärung des Anbieters.</p>
                  <p>9.2 Der Kunde bleibt Verantwortlicher für sämtliche von ihm hochgeladenen personenbezogenen Daten.</p>
                  <p>9.3 Der Anbieter verarbeitet Daten ausschliesslich zur Bereitstellung, Verbesserung und Sicherheit der Plattform.</p>
                  <p>9.4 Soweit erforderlich, schliessen die Parteien eine separate Vereinbarung zur Auftragsdatenverarbeitung (DPA/ADV).</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">10. Haftungsbeschränkung</h3>
                  <p>10.1 Der Anbieter haftet ausschliesslich für Schäden, die vorsätzlich oder grob fahrlässig verursacht wurden.</p>
                  <p>10.2 Die Haftung für indirekte Schäden, Folgeschäden, entgangenen Gewinn, Datenverlust oder Betriebsunterbrechungen ist ausgeschlossen.</p>
                  <p>10.3 Die Gesamthaftung des Anbieters ist auf die vom Kunden in den letzten zwölf Monaten bezahlten Abonnementgebühren beschränkt.</p>
                  <p>10.4 Zwingende gesetzliche Haftungsvorschriften (insbesondere für Personenschäden oder bei zwingenden Konsumentenschutzrechten) bleiben vorbehalten.</p>
                  <p>10.5 Der Anbieter haftet nicht für Leistungsausfälle oder Verzögerungen, die durch höhere Gewalt, Naturereignisse, Cyberangriffe, Stromausfälle, behördliche Anordnungen, Ausfälle von Hosting- oder Infrastruktur-Dienstleistern oder sonstige ausserhalb des Einflussbereichs des Anbieters liegende Ereignisse verursacht werden.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">11. Vertragsdauer und Kündigung</h3>
                  <p>11.1 Der Anbieter ist berechtigt, Verträge aus wichtigem Grund fristlos zu kündigen.</p>
                  <p>11.2 Nach Vertragsende kann der Anbieter Kundendaten nach Ablauf gesetzlicher Aufbewahrungsfristen löschen.</p>
                  <p>11.3 Nach Beendigung des Vertragsverhältnisses bleiben Kundendaten während eines Zeitraums von 30 Tagen für einen möglichen Export verfügbar. Nach Ablauf dieser Frist werden die Daten unwiderruflich gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
                  <p>11.4 Für Beta-, Test- oder Early-Access- Versionen der Plattform gelten ergänzend die jeweils veröffentlichten Beta- und Early-Access-Bedingungen.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">12. Änderungen der AGB</h3>
                  <p>12.1 Der Anbieter ist berechtigt, diese AGB anzupassen, sofern dies aus technischen, rechtlichen oder wirtschaftlichen Gründen erforderlich ist.</p>
                  <p>12.2 Änderungen werden dem Kunden in geeigneter Weise mitgeteilt.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">13. Schlussbestimmungen und Gerichtsstand</h3>
                  <p>13.1 Es gilt ausschliesslich Schweizer Recht unter Ausschluss des UN-Kaufrechts. Ist der Kunde ein Konsument, gilt diese Rechtswahl nur insoweit, als dadurch nicht der zwingende Schutz des Rechts des Staates, in dem der Konsument seinen gewöhnlichen Aufenthalt hat, entzogen wird.</p>
                  <p>13.2 Gerichtsstand für sämtliche Streitigkeiten aus oder im Zusammenhang mit diesem Vertragsverhältnis ist der Sitz des Anbieters in der Schweiz. Für Klagen von oder gegen Konsumenten gelten die zwingenden gesetzlichen Gerichtsstände.</p>
                  <p>13.3 Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            {/* === 2. AVV (DPA) === */}
            <section>
              <h2 className="text-3xl font-bold text-[#fafafa] mb-6">2. Auftragsverarbeitungsvertrag (AVV)</h2>
              <div className="space-y-6">
                <p>zwischen dem Kunden (Verantwortlicher) und Vescio Design GmbH (Auftragsverarbeiter)</p>
                <div>
                  <p><strong>1. Gegenstand und Dauer des Auftrags:</strong> Der Auftragsverarbeiter verarbeitet personenbezogene Daten im Auftrag des Verantwortlichen. Dies umfasst das Speichern, Hosten und Verwalten von Projekt-, Nutzer- und Plandaten auf der SaaS- Plattform Kreativ Desk OS". Die Dauer dieses AVV richtet sich nach der Laufzeit des Hauptvertrages (Nutzungsvertrag/Abonnement).</p>
                </div>
                <div>
                  <p><strong>2. Art und Zweck der Verarbeitung, Art der Daten und Kreis der Betroffenen:</strong> Art der Daten: Kontaktdaten (Name, E-Mail, Telefon), Projektinformationen, Zeiterfassungsdaten, Mängeldokumentationen (ggf. inkl. Fotos), IP-Adressen und System-Logs. Kreis der Betroffenen: Mitarbeiter des Kunden, externe Projektpartner, Bauherren, Subunternehmer.</p>
                </div>
                <div>
                  <p><strong>3. Weisungsrecht des Verantwortlichen:</strong> Der Auftragsverarbeiter darf Daten nur im Rahmen des Hauptvertrages und nach den dokumentierten Weisungen des Verantwortlichen verarbeiten, es sei denn, er ist gesetzlich zu einer anderen Verarbeitung verpflichtet.</p>
                </div>
                <div>
                  <p><strong>4. Technische und organisatorische Massnahmen (TOMS):</strong> Der Auftragsverarbeiter gewährleistet die Sicherheit der Daten gemäss den gesetzlichen Anforderungen. Dazu gehören Massnahmen wie: Verschlüsselung der Datenübertragung (SSL/TLS), Isolierung der Mandantendaten (Tenant-Trennung), Hosting auf Servern innerhalb der Schweiz und/oder des Europäischen Wirtschaftsraums (EWR), Regelmässige Backups und Zugriffskontrollen.</p>
                </div>
                <div>
                  <p><strong>5. Unterauftragsverhältnisse:</strong> Der Auftragsverarbeiter ist berechtigt, Unterauftragsverarbeiter (z. B. Hosting-Provider wie Google Cloud, Zahlungsdienstleister wie Stripe) einzusetzen. Diese werden vertraglich zu den gleichen Datenschutzpflichten gebunden.</p>
                </div>
                <div>
                  <p><strong>6. Löschung und Rückgabe von Daten:</strong> Nach Beendigung des Hauptvertrages löscht der Auftragsverarbeiter sämtliche personenbezogenen Daten des Verantwortlichen unwiderruflich, sofern keine gesetzlichen Aufbewahrungspflichten bestehen. Ein Export der Daten ist vor Vertragsende über das System möglich. Der Verantwortliche kann vor Vertragsende einen Export seiner Daten in einem gängigen maschinenlesbaren Format anfordern.</p>
                </div>
                <div>
                  <p><strong>7. KI-Verarbeitung:</strong> Soweit KI-Funktionen genutzt werden, erfolgt die Verarbeitung ausschliesslich zur Bereitstellung der vom Nutzer angeforderten Funktionen. Die Daten werden nicht zum Training eigener öffentlich verfügbarer KI-Modelle des Auftragsverarbeiters verwendet.</p>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            {/* === 3. SLA === */}
            <section>
              <h2 className="text-3xl font-bold text-[#fafafa] mb-6">3. Service Level Agreement (SLA) – Kreativ Desk OS</h2>
              <div className="space-y-6">
                <div>
                  <p><strong>1. Serviceverfügbarkeit (Uptime):</strong> Die Vescio Design GmbH garantiert eine Netzwerk- und Systemverfügbarkeit der Plattform „Kreativ Desk OS" von 99,5% im Jahresdurchschnitt. Von der Berechnung der Ausfallzeit ausgenommen sind: Angekündigte Wartungsfenster (geplante Wartungen finden in der Regel zwischen 22:00 und 04:00 Uhr MEZ statt) sowie Ausfälle aufgrund höherer Gewalt oder Umständen ausserhalb der Kontrolle des Anbieters (z. B. Ausfälle von Basis-Infrastruktur-Providern).</p>
                </div>
                <div>
                  <p><strong>2. Support-Level und Reaktionszeiten:</strong> Der Support steht Enterprise- und Agency- Kunden via E-Mail und Ticketsystem zur Verfügung. Die Reaktionszeiten definieren sich nach Schweregrad. Die angegebenen Reaktionszeiten stellen keine Garantie für die vollständige Behebung eines Problems innerhalb dieses Zeitraums dar: Level 1 (Kritisch): Plattform ist vollständig unerreichbar oder Kernfunktionen (z.B. Login, Datenzugriff) sind komplett ausgefallen. Reaktionszeit: Innerhalb von 4 Stunden (während der regulären Geschäftszeiten Mo-Fr, 08:00 - 17:00 Uhr). Level 2 (Hoch): Einzelne wichtige Module (z.B. Finanzmodul, BIM-Viewer) funktionieren nicht, Workarounds sind nicht möglich. Reaktionszeit: Innerhalb von 12 Geschäftsstunden. Level 3 (Normal): Allgemeine Fragen, kleine Bugs, Nutzungsprobleme ohne kritischen Einfluss auf das operative Geschäft. Reaktionszeit: Innerhalb von 24 bis 48 Geschäftsstunden.</p>
                </div>
                <div>
                  <p><strong>3. Datensicherung (Backups):</strong> Der Anbieter führt automatisierte, verschlüsselte Backups der Plattform-Datenbanken durch. Das Disaster-Recovery-Ziel (RPO Recovery Point Objective) liegt bei 24 Stunden. Backups werden verschlüsselt gespeichert und regelmässig auf Wiederherstellbarkeit getestet.</p>
                </div>
                <div>
                  <p><strong>4. Pönalen / Gutschriften (SLA-Credits):</strong> Wird die garantierte Verfügbarkeit von 99,5% in einem Kalendermonat nachweislich unterschritten, hat der Kunde Anspruch auf eine Gutschrift in Höhe von 10% der monatlichen anteiligen Gebühr für den darauffolgenden Abrechnungszyklus.</p>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            {/* === 4. BETA TERMS === */}
            <section>
              <h2 className="text-3xl font-bold text-[#fafafa] mb-6">4. Early Access & Beta Nutzungsbedingungen</h2>
              <div className="space-y-6">
                <div>
                  <p><strong>1. Status der Plattform:</strong> Die Plattform Kreativ Desk OS" wird dem Nutzer im aktuellen Stadium als „Beta-Version" bzw. im „Early Access" zur Verfügung gestellt. Die Software wird aktiv weiterentwickelt, getestet und unterliegt fortlaufenden Änderungen an Architektur, Ul und Funktionsumfang.</p>
                </div>
                <div>
                  <p><strong>2. Erwartbare Einschränkungen:</strong> Der Nutzer erkennt ausdrücklich an, dass die Beta-Version Fehler („Bugs") enthalten kann, die sich auf die Funktionalität auswirken können. Es kann zu Latenzen, temporären Ausfällen oder im schlimmsten Fall zu Datenverlusten kommen.</p>
                </div>
                <div>
                  <p><strong>3. Nutzung auf eigenes Risiko & Datensicherung:</strong> Die Nutzung der Plattform erfolgt auf eigenes Risiko. Der Nutzer wird hiermit ausdrücklich angewiesen, die Plattform während der Beta-Phase nicht als alleinigen und einzigen Speicherort (Single Source of Truth) für kritische Geschäftsdaten zu nutzen. Der Nutzer ist verpflichtet, eigene Backups und Kopien von hochgeladenen Plänen, Budgets und Verträgen lokal vorzuhalten.</p>
                </div>
                <div>
                  <p><strong>4. Haftungsausschluss:</strong> Jegliche Haftung der Vescio Design GmbH für direkte oder indirekte Schäden, Datenverlust, Betriebsunterbrechungen oder entgangenen Gewinn, die aus der Nutzung der Beta-Version resultieren, wird im gesetzlich maximal zulässigen Umfang ausgeschlossen. Dies gilt insbesondere für Fehler, die durch integrierte Drittanbieter oder KI-Module generiert werden.</p>
                </div>
                <div>
                  <p><strong>5. Feedback und Weiterentwicklung:</strong> Durch die Nutzung der Beta-Version erklärt sich der Nutzer bereit, auftretende Fehler oder Feedback zur Plattform an das Entwicklungsteam zu melden. Der Anbieter hat das Recht, dieses Feedback unentgeltlich zur Verbesserung der Software zu nutzen.</p>
                </div>
                <div>
                  <p><strong>6. Funktionsänderungen:</strong> Der Anbieter behält sich vor, Funktionen jederzeit zu ändern, einzuschränken, zu erweitern oder vollständig zu entfernen.</p>
                </div>
                <div>
                  <p><strong>7. KI-Hinweis:</strong> Kl-generierte Inhalte dienen ausschliesslich der Unterstützung von Arbeitsprozessen und ersetzen keine fachliche, rechtliche, finanzielle oder technische Beratung.</p>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            {/* === 5. AI DISCLAIMER === */}
            <section>
              <h2 className="text-3xl font-bold text-[#fafafa] mb-6">5. AI Disclaimer / Haftungsausschluss für KI-Funktionen</h2>
              <div className="space-y-6">
                <div>
                  <p><strong>1. Allgemeine Hinweise:</strong> Kreativ Desk OS enthält Funktionen, die auf künstlicher Intelligenz (KI) basieren. Die KI-Funktionen dienen ausschließlich der Unterstützung von kreativen, organisatorischen und konzeptionellen Arbeitsprozessen. Die durch KI generierten Inhalte, Analysen, Visualisierungen, Berechnungen, Zusammenfassungen oder Vorschläge erfolgen automatisiert und können fehlerhaft, unvollständig oder ungeeignet sein.</p>
                </div>
                <div>
                  <p><strong>2. Keine fachliche oder rechtliche Beratung:</strong> Die Plattform ersetzt insbesondere keine: Architekturleistungen, Fachplanung, Statik, Bauleitung, Ingenieurleistungen, Rechtsberatung, Finanz- oder Steuerberatung, Sicherheits- oder Normenprüfung. KI- generierte Inhalte stellen keine verbindliche fachliche Empfehlung oder Planung dar.</p>
                </div>
                <div>
                  <p><strong>3. Verantwortung der Nutzer:</strong> Alle durch KI erzeugten Inhalte müssen vor einer produktiven, wirtschaftlichen, technischen oder baulichen Nutzung eigenständig geprüft und verifiziert werden. Die Verantwortung für Entscheidungen, Planungen, Konstruktionen, Kostenberechnungen, Ausschreibungen, Projektumsetzungen, rechtliche oder technische Bewertungen liegt ausschließlich bei den Nutzern der Plattform.</p>
                </div>
                <div>
                  <p><strong>4. Keine Gewährleistung:</strong> Der Anbieter übernimmt keine Gewähr für Richtigkeit, Vollständigkeit, Aktualität, technische Umsetzbarkeit, rechtliche Zulässigkeit, wirtschaftliche Eignung, Fehlerfreiheit der durch KI generierten Inhalte oder Vorschläge.</p>
                </div>
                <div>
                  <p><strong>5. Visualisierungen und generierte Inhalte:</strong> Kl-generierte Renderings, Bilder, Visualisierungen, Whiteboard-Inhalte oder Entwürfe dienen ausschließlich der konzeptionellen und kreativen Unterstützung. Abweichungen zwischen generierten Visualisierungen und realen Umsetzungen sind möglich.</p>
                </div>
                <div>
                  <p><strong>6. Nutzung auf eigenes Risiko:</strong> Die Nutzung sämtlicher KI-Funktionen erfolgt ausschließlich auf eigenes Risiko der Nutzer. Der Anbieter haftet nicht für direkte oder indirekte Schäden, Fehlentscheidungen, Projektfehler, Datenverluste, wirtschaftliche Schäden, Folgeschäden, Verzögerungen oder Fehlkalkulationen, die aus der Nutzung Kl-generierter Inhalte entstehen.</p>
                </div>
                <div>
                  <p><strong>7. Drittanbieter, externe KI-Dienste und Dateneingabe:</strong> Zur Bereitstellung von KI- Funktionen können externe KI-Dienste und Drittanbieter (APIs) eingesetzt werden. Dabei können Daten automatisiert verarbeitet oder an externe Systeme übermittelt werden. Die Verarbeitung erfolgt gemäß den jeweiligen Datenschutz- und Nutzungsbedingungen der eingesetzten Drittanbieter. Der Nutzer ist allein dafür verantwortlich, sicherzustellen, dass durch die Eingabe von Texten, Prompts oder Dateien in die KI-Funktionen keine streng vertraulichen Informationen, Geschäftsgeheimnisse oder personenbezogene Daten Dritter unrechtmäßig an diese externen Dienste übermittelt werden.</p>
                </div>
                <div>
                  <p><strong>8. Änderungen der KI-Funktionen:</strong> Der Anbieter behält sich das Recht vor, KI- Funktionen jederzeit anzupassen, einzuschränken, zu erweitern oder einzustellen. Ein Anspruch auf permanente Verfügbarkeit bestimmter KI-Funktionen besteht nicht.</p>
                </div>
                <div>
                  <p><strong>9. Zustimmung zur Nutzung:</strong> Dieser Haftungsausschluss ist Bestandteil der Allgemeinen Geschäftsbedingungen (AGB) von Kreativ Desk OS. Mit der Nutzung der Plattform und ihrer KI-Funktionen erklären sich die Nutzer mit diesem Haftungsausschluss einverstanden.</p>
                </div>
              </div>
            </section>

          </div>
        ) : (
          <div className="space-y-16 leading-relaxed">
            
            {/* === 1. GTC (EN) === */}
            <section>
              <h1 className="text-3xl md:text-4xl font-bold text-[#fafafa] mb-8">1. General Terms and Conditions (GTC) for SaaS Services</h1>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">1. Scope and Subject of the Agreement</h3>
                  <p>1.1 These General Terms and Conditions (GTC) govern the contractual relationship between Vescio Design GmbH, Nürenbergstrasse 15, 8037 Zürich, Switzerland (hereinafter referred to as the "Provider") and the users (hereinafter referred to as the "Customer") of the web- based software platform "Kreativ Desk OS" (hereinafter referred to as the "Platform").</p>
                  <p>1.2 The offer is directed at commercial customers (B2B), companies, freelancers, organizations, as well as private individuals (consumers). 1.3 Deviating terms and conditions of the Customer shall not apply unless their validity has been expressly agreed to in writing.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">2. Services of the Platform</h3>
                  <p>2.1 The Provider makes the Platform available to the Customer as a cloud-based Software-as-a-Service (SaaS) solution. 2.2 The Platform may include the following features in particular: Project management, CAD and BIM viewing, Whiteboard and collaboration tools, Al-supported analytics and generation, PDF and document management, Rendering and visualization tools, Cloud storage and file processing.</p>
                  <p>2.3 The specific scope of services depends on the subscription model selected by the Customer. 2.4 The Provider is entitled to technically develop, adapt, or modify functions, provided this does not significantly impair the essential purpose of the contract.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">3. Registration and Account Security</h3>
                  <p>3.1 The use of the Platform requires the creation of a user account. Registration is exclusively permitted for individuals of legal age and with full legal capacity (minimum age 18 years). 3.2 The Customer undertakes to provide complete and truthful information. 3.3 The Customer is obligated to treat access data confidentially and protect it from unauthorized access by third parties. 3.4 The Customer is liable for all activities that occur under their user account. 3.5 The Provider shall not be liable for damages resulting from unauthorized access due to insufficient securing of the access data by the Customer.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">4. Prices, Payment Terms, and Contract Duration</h3>
                  <p>4.1 The use of paid features takes place within the framework of recurring subscriptions. 4.2 The respective current prices and scope of services are published on the website or within the Platform. Unless otherwise stated, prices for consumers include statutory value- added tax (VAT), while prices for commercial customers (B2B) exclude VAT. 4.3 Payment processing is handled via external payment service providers, in particular Stripe. 4.4 The Customer authorizes the Provider to automatically collect recurring payments via the stored payment method. 4.5 The duration of this contract is indefinite. Both contracting parties may terminate the contract at any time with a notice period of one (1) month to the end of the respective current billing period. 4.6 In the event of default in payment, the Provider is entitled to temporarily restrict or block access to the Platform. 4.7 Right of Withdrawal for Consumers (B2C): If the Customer is a consumer resident in the EU, they are generally entitled to a statutory right of withdrawal of 14 days. Exception: The Customer expressly agrees that the Provider shall begin with the execution of the contract (provision of the SaaS services) before the expiry of the withdrawal period. The Customer acknowledges that by giving this consent, they lose their right of withdrawal once the execution of the contract has begun.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">5. Use of Artificial Intelligence (AI)</h3>
                  <p>5.1 The Platform may contain features based on generative artificial intelligence, in particular for renderings, text generation, analytics, summaries, or calculations. 5.2 Al-generated content may be erroneous, incomplete, or unsuitable and does not replace professional verification. 5.3 The Provider assumes no warranty or liability for the: technical accuracy, legal admissibility, economic usability, structural feasibility, completeness or freedom from error of the Al-generated results. 5.4 The Customer is obligated to independently and professionally verify all Al-generated content prior to productive use. 5.5 The use of Al-generated content is solely at the Customer's own risk. 5.6 As far as legally permissible, all rights to the Al-generated content created by the Customer remain with the Customer. The Provider claims no ownership rights to customer-specific Al outputs or project results. 5.7 Content, files, plans, documents, or prompts entered by the Customer are not used by the Provider to train its own publicly accessible Al models.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">6. Availability and Service Level</h3>
                  <p>6.1 The Provider endeavors to ensure the most uninterrupted availability of the Platform possible. 6.2 A specific minimum availability or permanent accessibility is not guaranteed unless a separate Service Level Agreement (SLA) has been concluded. 6.3 Maintenance work, security updates, force majeure, or technical disruptions at third-party providers may lead to temporary restrictions. 6.4 Downtimes do not entitle the Customer to claims for damages or refunds, provided no mandatory statutory provisions dictate otherwise. 6.5 The Platform serves exclusively to support, manage, visualize, and document projects. It does not replace professional review, approval, or responsibility by qualified architects, engineers, specialist planners, site managers, or other professionals.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">7. Permitted Use</h3>
                  <p>7.1 The Customer undertakes to use the Platform exclusively within the framework of applicable laws. 7.2 The following are particularly prohibited: Uploading illegal content, Violations of copyright or data protection rights, Distribution of malware, Abusive use of the API, Security attacks, Reverse engineering, Automated mass use without the Provider's consent. 7.3 The Provider is entitled to remove content or temporarily or permanently suspend accounts if there is a violation of these GTC.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">8. Copyright and Terms of Use</h3>
                  <p>8.1 All rights to the Platform, software, designs, trademarks, and system architecture remain with the Provider. 8.2 The Customer receives a simple, non-transferable right of use to the Platform, limited in time to the duration of the contract. 8.3 The rights to uploaded files, plans, texts, and content remain with the Customer. 8.4 The Customer grants the Provider the necessary technical right to store, process, and transfer content to integrated services or Al interfaces, insofar as this is necessary to fulfill the contract. 8.5 The Customer is personally responsible for ensuring that uploaded content does not violate the rights of third parties.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">9. Data Protection and Data Processing</h3>
                  <p>9.1 The processing of personal data is carried out in accordance with the Provider's privacy policy. 9.2 The Customer remains the data controller for all personal data they upload. 9.3 The Provider processes data exclusively for the provision, improvement, and security of the Platform. 9.4 Where necessary, the parties shall conclude a separate Data Processing Agreement (DPA).</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">10. Limitation of Liability</h3>
                  <p>10.1 The Provider is liable exclusively for damages caused intentionally or by gross negligence. 10.2 Liability for indirect damages, consequential damages, lost profits, data loss, or business interruptions is excluded. 10.3 The overall liability of the Provider is limited to the subscription fees paid by the Customer in the last twelve months. 10.4 Mandatory statutory liability provisions (in particular for personal injury or mandatory consumer protection rights) remain reserved. 10.5 The Provider is not liable for performance failures or delays caused by force majeure, natural disasters, cyber attacks, power outages, official orders, failures of hosting or infrastructure service providers, or other events beyond the Provider's control.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">11. Contract Duration and Termination</h3>
                  <p>11.1 The Provider is entitled to terminate contracts without notice for good cause. 11.2 After the termination of the contract, the Provider may delete Customer data following the expiration of statutory retention periods. 11.3 After termination of the contractual relationship, Customer data remains available for a possible export for a period of 30 days. After this period, the data will be irrevocably deleted, provided there are no statutory retention obligations. 11.4 For Beta, test, or Early Access versions of the Platform, the respectively published Beta and Early Access Terms apply additionally.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">12. Amendments to the GTC</h3>
                  <p>12.1 The Provider is entitled to amend these GTC if this is necessary for technical, legal, or economic reasons. 12.2 The Customer will be notified of amendments in an appropriate manner.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">13. Final Provisions and Jurisdiction</h3>
                  <p>13.1 Swiss law applies exclusively, excluding the UN Convention on Contracts for the International Sale of Goods (CISG). If the Customer is a consumer, this choice of law applies only to the extent that it does not deprive them of the mandatory protection afforded by the law of the country in which the consumer has their habitual residence. 13.2 The place of jurisdiction for all disputes arising from or in connection with this contractual relationship is the registered office of the Provider in Switzerland. For lawsuits filed by or against consumers, the mandatory statutory places of jurisdiction apply. 13.3 Should individual provisions of these GTC be or become invalid, the validity of the remaining provisions shall remain unaffected.</p>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            {/* === 2. DPA (EN) === */}
            <section>
              <h2 className="text-3xl font-bold text-[#fafafa] mb-6">2. Data Processing Agreement (DPA)</h2>
              <div className="space-y-6">
                <p>Between the Customer (Data Controller) and Vescio Design GmbH (Data Processor)</p>
                <div>
                  <p><strong>1. Subject Matter and Duration of the Agreement:</strong> The Data Processor processes personal data on behalf of the Data Controller. This includes storing, hosting, and managing project, user, and plan data on the "Kreativ Desk OS" SaaS platform. The duration of this DPA depends on the term of the main contract (Terms of Use/Subscription).</p>
                </div>
                <div>
                  <p><strong>2. Nature and Purpose of Processing, Type of Data, and Categories of Data Subjects:</strong> Type of Data: Contact data (name, email, phone), project information, time tracking data, defect documentation (incl. photos if applicable), IP addresses, and system logs. Categories of Data Subjects: Customer's employees, external project partners, clients/builders, subcontractors.</p>
                </div>
                <div>
                  <p><strong>3. Controller's Right to Issue Instructions:</strong> The Data Processor may only process data within the scope of the main contract and according to the documented instructions of the Data Controller, unless legally obligated to process it otherwise.</p>
                </div>
                <div>
                  <p><strong>4. Technical and Organizational Measures (TOMS):</strong> The Data Processor ensures the security of the data in accordance with legal requirements. This includes measures such as: Encryption of data transmission (SSL/TLS), Isolation of tenant data (tenant separation), Secure hosting on European/Swiss servers (e.g., Google Cloud Europe) and/or within the EEA, Regular backups and access controls.</p>
                </div>
                <div>
                  <p><strong>5. Subprocessing:</strong> The Data Processor is entitled to engage sub-processors (e.g., hosting providers like Google Cloud, payment service providers like Stripe). These will be contractually bound to the same data protection obligations.</p>
                </div>
                <div>
                  <p><strong>6. Deletion and Return of Data:</strong> Upon termination of the main contract, the Data Processor shall irrevocably delete all personal data of the Data Controller, unless statutory retention obligations apply. Data export is possible via the system before the end of the contract. The Data Controller can request an export of their data in a common machine-readable format prior to contract termination.</p>
                </div>
                <div>
                  <p><strong>7. Al Processing:</strong> Insofar as Al functions are used, processing occurs exclusively to provide the functions requested by the user. The data is not used to train the Data Processor's own publicly available Al models.</p>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            {/* === 3. SLA (EN) === */}
            <section>
              <h2 className="text-3xl font-bold text-[#fafafa] mb-6">3. Service Level Agreement (SLA) – Kreativ Desk OS</h2>
              <div className="space-y-6">
                <div>
                  <p><strong>1. Service Availability (Uptime):</strong> Vescio Design GmbH guarantees a network and system availability for the "Kreativ Desk OS" platform of 99.5% as an annual average. Excluded from the calculation of downtime are: Announced maintenance windows (planned maintenance generally occurs between 10:00 PM and 4:00 AM CET). Outages due to force majeure or circumstances beyond the Provider's control (e.g., failures of core infrastructure providers).</p>
                </div>
                <div>
                  <p><strong>2. Support Levels and Response Times:</strong> Support is available to Enterprise and Agency customers via email and a ticketing system. Response times are defined by severity. The stated response times do not constitute a guarantee for the complete resolution of an issue within this timeframe: Level 1 (Critical): Platform is completely unreachable or core functions (e.g., login, data access) have completely failed. Response time: Within 4 hours (during regular business hours Mon-Fri, 08:00 - 17:00). Level 2 (High): Individual important modules (e.g., finance module, BIM viewer) are not working, workarounds are not possible. Response time: Within 12 business hours. Level 3 (Normal): General questions, minor bugs, usage issues without critical impact on daily operations. Response time: Within 24 to 48 business hours.</p>
                </div>
                <div>
                  <p><strong>3. Data Backup:</strong> The Provider conducts automated, encrypted backups of the platform databases. The Disaster Recovery Objective (RPO - Recovery Point Objective) is 24 hours. Backups are stored encrypted and regularly tested for recoverability.</p>
                </div>
                <div>
                  <p><strong>4. Penalties / SLA Credits:</strong> If the guaranteed availability of 99.5% in a calendar month is demonstrably not met, the Customer is entitled to a credit of 10% of the pro-rated monthly fee for the following billing cycle.</p>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            {/* === 4. BETA TERMS (EN) === */}
            <section>
              <h2 className="text-3xl font-bold text-[#fafafa] mb-6">4. Early Access & Beta Terms of Use</h2>
              <div className="space-y-6">
                <div>
                  <p><strong>1. Status of the Platform:</strong> The platform "Kreativ Desk OS" is provided to the user in its current state as a "Beta Version" or in "Early Access". The software is actively being developed, tested, and is subject to continuous changes in architecture, UI, and functionality.</p>
                </div>
                <div>
                  <p><strong>2. Expected Limitations:</strong> The user expressly acknowledges that the Beta Version may contain errors ("bugs") that could affect functionality. Latency, temporary outages, or in the worst-case scenario, data loss may occur.</p>
                </div>
                <div>
                  <p><strong>3. Use at Own Risk & Data Backup:</strong> The use of the platform is at your own risk. The user is expressly advised not to use the platform during the Beta phase as the sole storage location (Single Source of Truth) for critical business data. The user is obligated to keep local backups and copies of uploaded plans, budgets, and contracts.</p>
                </div>
                <div>
                  <p><strong>4. Disclaimer of Liability:</strong> Any liability of Vescio Design GmbH for direct or indirect damages, data loss, business interruptions, or lost profits resulting from the use of the Beta Version is excluded to the maximum extent permitted by law. This applies in particular to errors generated by integrated third-party providers or Al modules.</p>
                </div>
                <div>
                  <p><strong>5. Feedback and Further Development:</strong> By using the Beta Version, the user agrees to report any occurring errors or feedback regarding the platform to the development team. The Provider has the right to use this feedback free of charge to improve the software.</p>
                </div>
                <div>
                  <p><strong>6. Functional Changes:</strong> The Provider reserves the right to change, restrict, expand, or completely remove features at any time.</p>
                </div>
                <div>
                  <p><strong>7. Al Notice:</strong> Al-generated content serves exclusively to support work processes and does not replace professional, legal, financial, or technical advice.</p>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            {/* === 5. AI DISCLAIMER (EN) === */}
            <section>
              <h2 className="text-3xl font-bold text-[#fafafa] mb-6">5. AI Disclaimer / Liability Waiver for AI Features</h2>
              <div className="space-y-6">
                <div>
                  <p><strong>1. General Information:</strong> Kreativ Desk OS contains features based on artificial intelligence (AI). The Al features are intended exclusively to support creative, organizational, and conceptual work processes. The content, analyses, visualizations, calculations, summaries, or suggestions generated by Al are created automatically and may be incorrect, incomplete, or unsuitable.</p>
                </div>
                <div>
                  <p><strong>2. No Professional or Legal Advice:</strong> The platform specifically does not replace: Architectural services, Specialist planning, Structural engineering, Construction management, Engineering services, Legal advice, Financial or tax advice, Safety or standards compliance checks. Al-generated content does not constitute a binding professional recommendation or plan.</p>
                </div>
                <div>
                  <p><strong>3. User Responsibility:</strong> All Al-generated content must be independently checked and verified prior to any productive, commercial, technical, or structural use. The responsibility for Decisions, Planning, Constructions, Cost calculations, Tenders, Project implementations, Legal or technical assessments lies exclusively with the users of the platform.</p>
                </div>
                <div>
                  <p><strong>4. No Warranty:</strong> The provider assumes no warranty for the: Accuracy, Completeness, Timeliness, Technical feasibility, Legal admissibility, Commercial suitability, Freedom from errors of the Al-generated content or suggestions.</p>
                </div>
                <div>
                  <p><strong>5. Visualizations and Generated Content:</strong> Al-generated renderings, images, visualizations, whiteboard content, or drafts serve exclusively as conceptual and creative support. Deviations between generated visualizations and real-world implementations are possible.</p>
                </div>
                <div>
                  <p><strong>6. Use at Own Risk:</strong> The use of all Al features is strictly at the user's own risk. The provider is not liable for direct or indirect damages, incorrect decisions, project errors, data loss, economic losses, consequential damages, delays, or miscalculations arising from the use of Al-generated content.</p>
                </div>
                <div>
                  <p><strong>7. Third-Party Providers, External Al Services, and Data Input:</strong> External Al services and third-party providers (APIs) may be used to provide Al features. In this process, data may be processed automatically or transmitted to external systems. The processing is carried out in accordance with the respective privacy policies and terms of use of the third-party providers used. The user is solely responsible for ensuring that the input of texts, prompts, or files into the Al features does not unlawfully transmit strictly confidential information, trade secrets, or personal data of third parties to these external services.</p>
                </div>
                <div>
                  <p><strong>8. Changes to Al Features:</strong> The provider reserves the right to adapt, restrict, expand, or discontinue Al features at any time. There is no entitlement to the permanent availability of specific Al features.</p>
                </div>
                <div>
                  <p><strong>9. Consent to Use:</strong> This disclaimer is an integral part of the General Terms and Conditions (GTC) of Kreativ Desk OS. By using the platform and its Al features, users agree to this disclaimer.</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}