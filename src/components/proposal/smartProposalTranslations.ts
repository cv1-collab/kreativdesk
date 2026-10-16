import { SmartProposal } from '../../services/proposalService';
import { demoSmartProposal } from '../../utils/demoTemplates';

export const SMART_PROPOSAL_TRANSLATIONS: Record<'de' | 'en' | 'fr', Record<string, string>> = {
  de: {
    backToApp: 'Zurück zur App',
    back: 'Zurück',
    backTooltip: 'Zurück zum Pitch Deck Studio / Dashboard',
    daysLeft: 'Noch {days} Tage',
    share: 'Teilen',
    shareTooltip: 'Offerte teilen (WhatsApp, LinkedIn, E-Mail)',
    companyAndQR: 'Firmendaten & QR-IBAN',
    companyAndQRTooltip: 'Schweizer Firmendaten, QR-IBAN & Bankangaben bearbeiten',
    story: 'Story',
    deck: 'Deck',
    approved: 'Freigegeben',
    accept: 'Annehmen',
    successTitle: 'Dieses Angebot wurde erfolgreich digital freigegeben!',
    successSubtitle: 'Rechtsverbindlich signiert für {client} ({currency} {amount})',
    pdfStudioBtn: 'Vertragsbeleg & QR-Zahlteil PDF Studio',
    qrSlipTitle: 'Offizieller Schweizer QR-Zahlteil (30% Projektanzahlung)',
    depositHeading: 'Anzahlung: CHF {amount}',
    depositDesc: 'Sie können die Projektanzahlung bequem via TWINT, Mobile-Banking oder E-Banking per QR-Code Scan begleichen. Die Ausführungsplanung startet unmittelbar nach Zahlungseingang.',
    accountQrIban: 'Konto / QR-IBAN ({bank})',
    creditorUid: 'Zahlungsempfänger & UID',
    twintQrLabel: 'TWINT & E-Banking QR-Zahlteil',
    heroBadge: 'Exklusives Projektangebot & Präsentation',
    createdFor: 'Erstellt für:',
    showreelLabel: '▶ 4K Projekt-Showreel',
    storyHeading: 'Projekt-Details & Etappen',
    storySubheading: 'Blättern Sie durch alle wesentlichen Folien und Planungsunterlagen',
    after3d: '✨ 3D-Neubau (Nachher)',
    beforeSite: '📷 Bestand (Vorher)',
    noComparison: 'Keine Vergleichsbilder geladen',
    pos: 'Pos',
    servicePhase: 'Leistung / Phase',
    serviceExecution: 'Leistung / Ausführung',
    amount: 'Betrag',
    total: 'Gesamt',
    slideCountLabel: '{title} • Folie {curr} von {total}',
    keyboardHint: '⌨️ [←] [→] [Space] zum Blättern',
    showStoryMode: 'Story Mode anzeigen',
    prev: 'Vorherige',
    next: 'Nächste',
    slideThumb: 'Folie {num}',
    costHeading: 'Investitionsübersicht & Konfiguration',
    costSubheading: 'Wählen Sie optionale Zusatzpakete für Ihr massgeschneidertes Leistungspaket',
    baseScopeTitle: 'Basis-Leistungsumfang & Ausführung',
    baseScopeSub: 'Konzeption, Werkplanung & Projektbegleitung gemäss SIA',
    optionalAddons: 'Optionale Zusatzpakete',
    totalExclVat: 'Gesamtinvestition (Exkl. MwSt.)',
    acceptProposalCta: 'Angebot digital annehmen',
    siaBadge: 'Transparenter SIA-Zahlungsplan',
    siaHeading: 'Etappen & Zahlungsmeilensteine',
    siaSubheading: 'Vergütung nach tatsächlichem Baufortschritt gemäss SIA 102 / 118',
    tranche: 'Tranche',
    dueAmount: 'Fälliger Betrag:',
    defaultMs1Phase: 'Phase 1: Vorprojekt & Machbarkeit',
    defaultMs1Desc: 'Grundlagenanalyse, Vorkonzept & Kostenschätzung (SIA 102)',
    defaultMs2Phase: 'Phase 2: Bauprojekt & Baueingabe',
    defaultMs2Desc: 'Bewilligungsfähige Projektpläne & Baueingabe bei Behörden',
    defaultMs3Phase: 'Phase 3: Ausführungsplanung',
    defaultMs3Desc: 'Detailpläne, Devisierung & Vergabe an Handwerker',
    defaultMs4Phase: 'Phase 4: Realisierung & Bauleitung',
    defaultMs4Desc: 'Örtliche Bauleitung, Qualitäts- & Kostenkontrolle',
    defaultMs5Phase: 'Phase 5: Abschluss & Abnahme',
    defaultMs5Desc: 'Schlussabrechnung, Mängelbehebung & Übergabe',
    legalBadge: 'Rechtliche Sicherheit',
    legalHeading: 'Vertragsdokumente & AGBs',
    legalSubheading: 'Transparente Geschäftsbedingungen, Werkverträge & Unterlagen zur Einsicht',
    validPerSia: 'Gültig gemäss SIA',
    previewInBrowser: 'Vorschau im Browser',
    downloadPdf: 'PDF Herunterladen',
    officialLegalDoc: 'Offizielles Vertragsdokument der Kreativ Desk Planung',
    officialLegalDocDesc: 'Dieses Dokument basiert auf den Standardkonditionen des Schweizerischen Ingenieur- und Architektenvereins (SIA) und dem Schweizerischen Obligationenrecht (OR).',
    close: 'Schliessen',
    inquiryHeading: 'Haben Sie eine Frage zur Offerte?',
    inquirySubheading: 'Unser Planungsteam steht Ihnen direkt per WhatsApp, Telefon oder Chat zur Verfügung.',
    askViaWhatsapp: 'Direkt per WhatsApp fragen',
    inquiryNamePlaceholder: 'Ihr Name',
    inquiryEmailPlaceholder: 'Ihre E-Mail',
    inquiryQuestionPlaceholder: 'Ihre Frage oder Bemerkung zu einer bestimmten Position...',
    send: 'Senden',
    sentToast: 'Gesendet! ✅',
    inquirySuccess: 'Vielen Dank! Ihre Rückfrage wurde an den zuständigen Projektleiter übermittelt.',
    phoneInquiry: 'Telefonische Rückfrage',
    emailInquiry: 'E-Mail schreiben',
    copyright: '© 2026 Kreativ Desk & interacTV – Sichere Cloud-Präsentationen mit 30-Tage Gültigkeitsgarantie',
    modalTitle: 'Angebot verbindlich annehmen',
    modalSub: 'Rechtsgültige E-Signatur & Beauftragung',
    orderSuccessTitle: 'Vielen Dank für Ihren Auftrag!',
    orderSuccessDesc: 'Die Offerte wurde erfolgreich digital gegengezeichnet. Ihr Vertrag, die E-Mail-Bestätigung und der Schweizer QR-Zahlteil wurden generiert.',
    sia118BadgeTitle: 'SIA 118 E-Signatur',
    sia118BadgeDesc: 'Rechtsgültig digital signiert & revisionssicher archiviert.',
    bexioBadgeTitle: '🇨🇭 Bexio ERP Sync',
    bexioSuccess: 'Offerte #{num} & Anzahlung gebucht.',
    bexioPending: 'Synchronisation mit Schweizer Buchhaltung aktiv.',
    emailBadgeTitle: 'Bestätigungs-E-Mail',
    emailDelivered: 'Zugestellt an {email}',
    emailSentTo: 'Beleg & QR-Link an {email} versendet.',
    qrBadgeTitle: 'Swiss QR-Rechnung (30%)',
    qrBadgeDesc: 'QR-IBAN: {iban}... sofort zahlbar.',
    downloadOrderPdf: 'Auftragsbestätigung (PDF)',
    downloadSwissQrBill: 'Schweizer QR-Rechnung (30% Anzahlung)',
    confirmedTotalLabel: 'Bestätigter Gesamtbetrag (exkl. MwSt.):',
    siaCompliantBadge: 'SIA 102/118 Konform',
    yourName: 'Ihr Name *',
    yourNamePlaceholder: 'z. B. Dr. Thomas Keller',
    company: 'Firma / Organisation',
    companyPlaceholder: 'z. B. Keller Holding AG',
    businessEmail: 'Geschäftliche E-Mail *',
    businessEmailPlaceholder: 'z. B. keller@firma.ch',
    phone: 'Telefonnummer',
    phonePlaceholder: 'z. B. +41 79 123 45 67',
    drawSignatureLabel: 'Digitale Unterschrift (mit Finger oder Maus zeichnen) *',
    resetSignature: 'Zurücksetzen',
    signHerePlaceholder: 'Hier unterschreiben...',
    signRequiredError: 'Bitte leisten Sie Ihre digitale Unterschrift im Unterschriften-Feld.',
    legalCheckboxLabel: 'Ich bestätige hiermit die verbindliche Annahme der Offerte sowie die Kenntnisnahme und Akzeptanz der Allgemeinen Geschäftsbedingungen (AGB), des Werkvertrages (SIA 118) und des SIA-Zahlungsplans.',
    cancel: 'Abbrechen',
    signing: 'Wird signiert...',
    signSubmitBtn: 'Rechtsverbindlich Unterzeichnen & PDF laden',
    floatingAiBtn: 'Fragen zum Angebot? (KI-Berater)',
    aiAdvisorTitle: 'KI-Projektberater',
    aiAdvisorSubtitle: 'Live-Auskunft zur Offerte #{token}',
    aiThinking: 'Antwort wird formuliert...',
    aiInputPlaceholder: 'Frage zu Phasen, Preis, Terminen...',
    initialAiGreeting: 'Guten Tag! Ich bin Ihr persönlicher KI-Projektberater für dieses Angebot. Haben Sie Fragen zum Leistungsumfang, den Phasen, Zahlungskonditionen oder Garantien?',
    shareModalTitle: 'Offerte & Präsentation teilen',
    shareModalSub: 'Direkt per WhatsApp, LinkedIn oder E-Mail an Entscheider senden',
    directLinkLabel: 'Direktlink zur interaktiven Offerte',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    smartphoneQrTitle: 'Smartphone QR-Scan',
    smartphoneQrDesc: 'Kunde kann den QR-Code mit der Smartphone-Kamera scannen, um die Offerte sofort auf dem Handy zu prüfen & digital zu unterschreiben.',
    companyModalTitle: 'Schweizer Firmendaten & QR-Rechnung',
    companyModalSub: 'Verwaltung von QR-IBAN, UID-Nummer, Bankinstitut und Firmenangaben',
    companyName: 'Firmenname / Rechnungssteller *',
    legalForm: 'Rechtsform',
    streetAndNo: 'Strasse & Nr.',
    street: 'Strasse',
    number: 'Nr.',
    zipAndCity: 'PLZ & Ort',
    zip: 'PLZ',
    city: 'Ort',
    bankingQrSection: 'Schweizer QR-Rechnung & Bankdaten',
    qrIban: 'Schweizer QR-IBAN (Zahlteil) *',
    bankName: 'Bankinstitut',
    uidNumber: 'UID / MWST-Nummer',
    regularIban: 'Reguläre IBAN',
    officialEmail: 'Offizielle E-Mail',
    saveCompanyBtn: 'Firmendaten & QR-Code speichern',
    presentationNotFound: 'Präsentation nicht gefunden',
    presentationNotFoundDesc: 'Der angeforderte Link ist ungültig oder wurde gelöscht. Bitte wenden Sie sich an Ihren Ansprechpartner.',
    validityExpired: 'Gültigkeit abgelaufen',
    proposalExpiredTitle: 'Dieses Angebot ist abgelaufen',
    proposalExpiredDesc: 'Das Angebot für {title} war 30 Tage gültig und ist am {date} abgelaufen. Möchten Sie eine Verlängerung oder ein aktualisiertes Angebot anfordern?',
    requestExtension: 'Verlängerung anfragen',
    loadingPresentation: 'Lade Kunden-Präsentation...',
    protectedPresentation: 'Geschützte Kunden-Präsentation',
    pinRequired: 'Dieses Dokument ist passwortgeschützt. Bitte geben Sie Ihren PIN-Code ein.',
    pinWrong: 'Falscher PIN-Code. Bitte erneut versuchen.',
    openPresentation: 'Präsentation öffnen',
    lightMode: 'Hell',
    darkMode: 'Dunkel',
    switchToLight: 'Zum Hell-Modus wechseln',
    switchToDark: 'Zum Dunkel-Modus wechseln',
    shareThemeLabel: 'Design beim Teilen'
  },
  en: {
    backToApp: 'Back to App',
    back: 'Back',
    backTooltip: 'Back to Pitch Deck Studio / Dashboard',
    daysLeft: '{days} days left',
    share: 'Share',
    shareTooltip: 'Share proposal (WhatsApp, LinkedIn, Email)',
    companyAndQR: 'Company & QR-IBAN',
    companyAndQRTooltip: 'Edit Swiss company details, QR-IBAN & banking information',
    story: 'Story',
    deck: 'Deck',
    approved: 'Approved',
    accept: 'Accept',
    successTitle: 'This proposal has been digitally approved!',
    successSubtitle: 'Legally signed for {client} ({currency} {amount})',
    pdfStudioBtn: 'Contract Receipt & Swiss QR PDF Studio',
    qrSlipTitle: 'Official Swiss QR Payment Slip (30% Project Deposit)',
    depositHeading: 'Deposit: CHF {amount}',
    depositDesc: 'You can settle the project deposit conveniently via TWINT, mobile banking or e-banking by scanning the QR code. Execution planning commences immediately upon payment.',
    accountQrIban: 'Account / QR-IBAN ({bank})',
    creditorUid: 'Beneficiary & UID',
    twintQrLabel: 'TWINT & E-Banking QR Payment Part',
    heroBadge: 'Exclusive Project Proposal & Presentation',
    createdFor: 'Created for:',
    showreelLabel: '▶ 4K Project Showreel',
    storyHeading: 'Project Details & Stages',
    storySubheading: 'Browse through all key slides and planning documents',
    after3d: '✨ 3D New Build (After)',
    beforeSite: '📷 Existing Site (Before)',
    noComparison: 'No comparison images loaded',
    pos: 'Pos',
    servicePhase: 'Service / Phase',
    serviceExecution: 'Service / Execution',
    amount: 'Amount',
    total: 'Total',
    slideCountLabel: '{title} • Slide {curr} of {total}',
    keyboardHint: '⌨️ [←] [→] [Space] to navigate',
    showStoryMode: 'Show Story Mode',
    prev: 'Previous',
    next: 'Next',
    slideThumb: 'Slide {num}',
    costHeading: 'Investment Overview & Configuration',
    costSubheading: 'Select optional add-on packages for your customized scope of work',
    baseScopeTitle: 'Base Scope of Work & Execution',
    baseScopeSub: 'Concept, detail design & project management according to SIA',
    optionalAddons: 'Optional Add-on Packages',
    totalExclVat: 'Total Investment (Excl. VAT)',
    acceptProposalCta: 'Accept proposal digitally',
    siaBadge: 'Transparent SIA Payment Schedule',
    siaHeading: 'Stages & Payment Milestones',
    siaSubheading: 'Remuneration based on actual construction progress per SIA 102 / 118',
    tranche: 'Installment',
    dueAmount: 'Due Amount:',
    defaultMs1Phase: 'Phase 1: Preliminary Project & Feasibility',
    defaultMs1Desc: 'Basic analysis, preliminary concept & cost estimate (SIA 102)',
    defaultMs2Phase: 'Phase 2: Building Project & Submission',
    defaultMs2Desc: 'Approvable project plans & authority permit submission',
    defaultMs3Phase: 'Phase 3: Detailed Execution Planning',
    defaultMs3Desc: 'Detailed drawings, tendering & contractor procurement',
    defaultMs4Phase: 'Phase 4: Realization & Site Supervision',
    defaultMs4Desc: 'On-site construction supervision, quality & cost control',
    defaultMs5Phase: 'Phase 5: Completion & Handover',
    defaultMs5Desc: 'Final accounting, snag list resolution & formal handover',
    legalBadge: 'Legal Certainty',
    legalHeading: 'Contract Documents & Terms',
    legalSubheading: 'Transparent terms and conditions, works contracts & review documents',
    validPerSia: 'Valid according to SIA',
    previewInBrowser: 'Preview in Browser',
    downloadPdf: 'Download PDF',
    officialLegalDoc: 'Official Contract Document of Kreativ Desk Planning',
    officialLegalDocDesc: 'This document is based on standard SIA conditions and the Swiss Code of Obligations (CO).',
    close: 'Close',
    inquiryHeading: 'Do you have a question about this proposal?',
    inquirySubheading: 'Our planning team is available directly via WhatsApp, phone, or chat.',
    askViaWhatsapp: 'Ask directly via WhatsApp',
    inquiryNamePlaceholder: 'Your Name',
    inquiryEmailPlaceholder: 'Your Email',
    inquiryQuestionPlaceholder: 'Your question or comment regarding a specific position...',
    send: 'Send',
    sentToast: 'Sent! ✅',
    inquirySuccess: 'Thank you! Your inquiry has been forwarded to the project manager.',
    phoneInquiry: 'Phone Inquiry',
    emailInquiry: 'Send Email',
    copyright: '© 2026 Kreativ Desk & interacTV – Secure Cloud Presentations with 30-Day Validity Guarantee',
    modalTitle: 'Accept Proposal Bindingly',
    modalSub: 'Legally binding e-signature & commissioning',
    orderSuccessTitle: 'Thank you for your order!',
    orderSuccessDesc: 'The proposal has been successfully counter-signed digitally. Your contract, confirmation email, and Swiss QR-bill have been generated.',
    sia118BadgeTitle: 'SIA 118 E-Signature',
    sia118BadgeDesc: 'Legally signed digitally & audit-proof archived.',
    bexioBadgeTitle: '🇨🇭 Bexio ERP Sync',
    bexioSuccess: 'Proposal #{num} & deposit booked.',
    bexioPending: 'Sync with Swiss accounting active.',
    emailBadgeTitle: 'Confirmation Email',
    emailDelivered: 'Delivered to {email}',
    emailSentTo: 'Receipt & QR link sent to {email}.',
    qrBadgeTitle: 'Swiss QR-Bill (30%)',
    qrBadgeDesc: 'QR-IBAN: {iban}... immediately payable.',
    downloadOrderPdf: 'Order Confirmation (PDF)',
    downloadSwissQrBill: 'Swiss QR-Bill (30% Deposit)',
    confirmedTotalLabel: 'Confirmed Total Amount (excl. VAT):',
    siaCompliantBadge: 'SIA 102/118 Compliant',
    yourName: 'Your Name *',
    yourNamePlaceholder: 'e.g. Dr. Thomas Keller',
    company: 'Company / Organization',
    companyPlaceholder: 'e.g. Keller Holding AG',
    businessEmail: 'Business Email *',
    businessEmailPlaceholder: 'e.g. keller@company.com',
    phone: 'Phone Number',
    phonePlaceholder: 'e.g. +41 79 123 45 67',
    drawSignatureLabel: 'Digital Signature (draw with finger or mouse) *',
    resetSignature: 'Reset',
    signHerePlaceholder: 'Sign here...',
    signRequiredError: 'Please provide your digital signature in the signature box.',
    legalCheckboxLabel: 'I hereby confirm the binding acceptance of the proposal as well as the acknowledgment and acceptance of the General Terms and Conditions (GTC), the Works Contract (SIA 118), and the SIA Payment Schedule.',
    cancel: 'Cancel',
    signing: 'Signing...',
    signSubmitBtn: 'Sign Bindingly & Download PDF',
    floatingAiBtn: 'Questions on proposal? (AI Advisor)',
    aiAdvisorTitle: 'AI Project Advisor',
    aiAdvisorSubtitle: 'Live guidance for proposal #{token}',
    aiThinking: 'Formulating response...',
    aiInputPlaceholder: 'Ask about phases, pricing, deadlines...',
    initialAiGreeting: 'Hello! I am your personal AI project advisor for this proposal. Do you have any questions regarding the scope, phases, payment terms, or warranties?',
    shareModalTitle: 'Share Proposal & Presentation',
    shareModalSub: 'Send directly via WhatsApp, LinkedIn or email to decision makers',
    directLinkLabel: 'Direct link to interactive proposal',
    copy: 'Copy',
    copied: 'Copied!',
    smartphoneQrTitle: 'Smartphone QR Scan',
    smartphoneQrDesc: 'Client can scan the QR code with their smartphone camera to review and digitally sign the proposal immediately.',
    companyModalTitle: 'Swiss Company Data & QR-Bill',
    companyModalSub: 'Manage QR-IBAN, UID number, banking institution and company details',
    companyName: 'Company Name / Billed By *',
    legalForm: 'Legal Form',
    streetAndNo: 'Street & No.',
    street: 'Street',
    number: 'No.',
    zipAndCity: 'ZIP & City',
    zip: 'ZIP',
    city: 'City',
    bankingQrSection: 'Swiss QR-Bill & Banking Details',
    qrIban: 'Swiss QR-IBAN (Payment Part) *',
    bankName: 'Banking Institution',
    uidNumber: 'UID / VAT Number',
    regularIban: 'Regular IBAN',
    officialEmail: 'Official Email',
    saveCompanyBtn: 'Save Company Data & QR-Code',
    presentationNotFound: 'Presentation not found',
    presentationNotFoundDesc: 'The requested link is invalid or has been deleted. Please contact your representative.',
    validityExpired: 'Validity Expired',
    proposalExpiredTitle: 'This proposal has expired',
    proposalExpiredDesc: 'The proposal for {title} was valid for 30 days and expired on {date}. Would you like to request an extension or an updated offer?',
    requestExtension: 'Request Extension',
    loadingPresentation: 'Loading client presentation...',
    protectedPresentation: 'Protected Client Presentation',
    pinRequired: 'This document is password protected. Please enter your PIN code.',
    pinWrong: 'Incorrect PIN code. Please try again.',
    openPresentation: 'Open Presentation',
    lightMode: 'Light',
    darkMode: 'Dark',
    switchToLight: 'Switch to Light Mode',
    switchToDark: 'Switch to Dark Mode',
    shareThemeLabel: 'Design when sharing'
  },
  fr: {
    backToApp: 'Retour à l\'app',
    back: 'Retour',
    backTooltip: 'Retour au Pitch Deck Studio / Tableau de bord',
    daysLeft: 'Encore {days} j.',
    share: 'Partager',
    shareTooltip: 'Partager l\'offre (WhatsApp, LinkedIn, Email)',
    companyAndQR: 'Données entreprise & QR-IBAN',
    companyAndQRTooltip: 'Modifier les données suisses, QR-IBAN & coordonnées bancaires',
    story: 'Histoire',
    deck: 'Slides',
    approved: 'Validé',
    accept: 'Accepter',
    successTitle: 'Cette offre a été validée numériquement avec succès!',
    successSubtitle: 'Signé juridiquement pour {client} ({currency} {amount})',
    pdfStudioBtn: 'Reçu contractuel & bulletin QR PDF Studio',
    qrSlipTitle: 'Bulletin de versement QR officiel (30% acompte de projet)',
    depositHeading: 'Acompte : CHF {amount}',
    depositDesc: 'Vous pouvez régler l\'acompte facilement par TWINT, banque mobile ou e-banking en scannant le code QR. La planification démarre dès réception.',
    accountQrIban: 'Compte / QR-IBAN ({bank})',
    creditorUid: 'Bénéficiaire & UID',
    twintQrLabel: 'Bulletin de versement QR TWINT & E-Banking',
    heroBadge: 'Offre de projet exclusive & présentation',
    createdFor: 'Créé pour :',
    showreelLabel: '▶ Showreel de projet 4K',
    storyHeading: 'Détails du projet & étapes',
    storySubheading: 'Parcourez toutes les diapositives et documents de planification',
    after3d: '✨ Rendu 3D (Après)',
    beforeSite: '📷 État des lieux (Avant)',
    noComparison: 'Aucune image de comparaison chargée',
    pos: 'Pos',
    servicePhase: 'Prestation / Phase',
    serviceExecution: 'Prestation / Exécution',
    amount: 'Montant',
    total: 'Total',
    slideCountLabel: '{title} • Diapositive {curr} sur {total}',
    keyboardHint: '⌨️ [←] [→] [Espace] pour naviguer',
    showStoryMode: 'Afficher le mode Histoire',
    prev: 'Précédente',
    next: 'Suivante',
    slideThumb: 'Diapo {num}',
    costHeading: 'Aperçu des investissements & configuration',
    costSubheading: 'Sélectionnez des options pour votre offre sur mesure',
    baseScopeTitle: 'Étendue des prestations de base & exécution',
    baseScopeSub: 'Conception, plans d\'exécution et suivi de projet selon SIA',
    optionalAddons: 'Forfaits optionnels',
    totalExclVat: 'Investissement total (hors TVA)',
    acceptProposalCta: 'Accepter l\'offre en ligne',
    siaBadge: 'Plan de paiement SIA transparent',
    siaHeading: 'Étapes & jalons de paiement',
    siaSubheading: 'Rémunération selon l\'avancement réel des travaux selon SIA 102 / 118',
    tranche: 'Tranche',
    dueAmount: 'Montant dû :',
    defaultMs1Phase: 'Phase 1 : Avant-projet & faisabilité',
    defaultMs1Desc: 'Analyse de base, concept préalable & estimation des coûts (SIA 102)',
    defaultMs2Phase: 'Phase 2 : Projet de construction & mise à l\'enquête',
    defaultMs2Desc: 'Plans autorisables & dépôt du permis auprès des autorités',
    defaultMs3Phase: 'Phase 3 : Plans d\'exécution détaillés',
    defaultMs3Desc: 'Plans de détail, soumissions & adjudication aux artisans',
    defaultMs4Phase: 'Phase 4 : Réalisation & direction des travaux',
    defaultMs4Desc: 'Direction des travaux sur place, contrôle qualité et coûts',
    defaultMs5Phase: 'Phase 5 : Clôture & réception',
    defaultMs5Desc: 'Décompte final, levée des réserves et remise de l\'ouvrage',
    legalBadge: 'Sécurité juridique',
    legalHeading: 'Documents contractuels & CGV',
    legalSubheading: 'Conditions transparentes, contrats d\'entreprise & documents à consulter',
    validPerSia: 'Valable selon SIA',
    previewInBrowser: 'Aperçu dans le navigateur',
    downloadPdf: 'Télécharger le PDF',
    officialLegalDoc: 'Document contractuel officiel de Kreativ Desk',
    officialLegalDocDesc: 'Ce document est basé sur les normes SIA et le Code des obligations suisse (CO).',
    close: 'Fermer',
    inquiryHeading: 'Avez-vous une question concernant l\'offre ?',
    inquirySubheading: 'Notre équipe est à votre disposition par WhatsApp, téléphone ou chat.',
    askViaWhatsapp: 'Demander directement via WhatsApp',
    inquiryNamePlaceholder: 'Votre nom',
    inquiryEmailPlaceholder: 'Votre email',
    inquiryQuestionPlaceholder: 'Votre question ou remarque concernant un poste...',
    send: 'Envoyer',
    sentToast: 'Envoyé ! ✅',
    inquirySuccess: 'Merci ! Votre question a été transmise au chef de projet.',
    phoneInquiry: 'Contact téléphonique',
    emailInquiry: 'Écrire un email',
    copyright: '© 2026 Kreativ Desk & interacTV – Présentations cloud sécurisées avec garantie de 30 jours',
    modalTitle: 'Accepter l\'offre fermement',
    modalSub: 'Signature électronique valable & commande',
    orderSuccessTitle: 'Merci pour votre commande !',
    orderSuccessDesc: 'L\'offre a été contresignée numériquement avec succès. Votre contrat, confirmation et bulletin QR suisse ont été générés.',
    sia118BadgeTitle: 'Signature électronique SIA 118',
    sia118BadgeDesc: 'Signé numériquement et archivé de façon infalsifiable.',
    bexioBadgeTitle: '🇨🇭 Synchronisation Bexio ERP',
    bexioSuccess: 'Offre #{num} & acompte enregistrés.',
    bexioPending: 'Synchronisation avec la comptabilité suisse active.',
    emailBadgeTitle: 'Email de confirmation',
    emailDelivered: 'Envoyé à {email}',
    emailSentTo: 'Reçu et lien QR envoyés à {email}.',
    qrBadgeTitle: 'Facture QR suisse (30%)',
    qrBadgeDesc: 'QR-IBAN : {iban}... payable immédiatement.',
    downloadOrderPdf: 'Confirmation de commande (PDF)',
    downloadSwissQrBill: 'Facture QR suisse (30% acompte)',
    confirmedTotalLabel: 'Montant total confirmé (hors TVA) :',
    siaCompliantBadge: 'Conforme SIA 102/118',
    yourName: 'Votre nom *',
    yourNamePlaceholder: 'ex. M. Thomas Keller',
    company: 'Entreprise / Organisation',
    companyPlaceholder: 'ex. Keller Holding SA',
    businessEmail: 'Email professionnel *',
    businessEmailPlaceholder: 'ex. keller@entreprise.ch',
    phone: 'Numéro de téléphone',
    phonePlaceholder: 'ex. +41 79 123 45 67',
    drawSignatureLabel: 'Signature numérique (dessiner avec le doigt ou la souris) *',
    resetSignature: 'Réinitialiser',
    signHerePlaceholder: 'Signer ici...',
    signRequiredError: 'Veuillez apposer votre signature numérique dans le champ réservé.',
    legalCheckboxLabel: 'Je confirme par la présente l\'acceptation ferme de l\'offre ainsi que la prise de connaissance et l\'acceptation des Conditions Générales (CGV), du contrat d\'entreprise (SIA 118) et du plan de paiement SIA.',
    cancel: 'Annuler',
    signing: 'Signature en cours...',
    signSubmitBtn: 'Signer juridiquement & télécharger le PDF',
    floatingAiBtn: 'Questions sur l\'offre ? (Conseiller IA)',
    aiAdvisorTitle: 'Conseiller de projet IA',
    aiAdvisorSubtitle: 'Renseignements en direct pour l\'offre #{token}',
    aiThinking: 'Rédaction de la réponse...',
    aiInputPlaceholder: 'Question sur les étapes, prix, délais...',
    initialAiGreeting: 'Bonjour ! Je suis votre conseiller IA personnel pour cette offre. Avez-vous des questions sur les prestations, les étapes, les conditions de paiement ou les garanties ?',
    shareModalTitle: 'Partager l\'offre & la présentation',
    shareModalSub: 'Envoyer directement par WhatsApp, LinkedIn ou email aux décideurs',
    directLinkLabel: 'Lien direct vers l\'offre interactive',
    copy: 'Copier',
    copied: 'Copié !',
    smartphoneQrTitle: 'Scan QR sur smartphone',
    smartphoneQrDesc: 'Le client peut scanner le code QR avec son smartphone pour consulter et signer l\'offre immédiatement.',
    companyModalTitle: 'Données d\'entreprise suisse & facture QR',
    companyModalSub: 'Gestion de l\'IBAN QR, numéro IDE, banque et coordonnées',
    companyName: 'Raison sociale / Facturé par *',
    legalForm: 'Forme juridique',
    streetAndNo: 'Rue & N°',
    street: 'Rue',
    number: 'N°',
    zipAndCity: 'NPA & Localité',
    zip: 'NPA',
    city: 'Localité',
    bankingQrSection: 'Facture QR suisse & coordonnées bancaires',
    qrIban: 'QR-IBAN suisse (bulletin de versement) *',
    bankName: 'Établissement bancaire',
    uidNumber: 'Numéro IDE / TVA',
    regularIban: 'IBAN ordinaire',
    officialEmail: 'Email officiel',
    saveCompanyBtn: 'Enregistrer les données & le code QR',
    presentationNotFound: 'Présentation introuvable',
    presentationNotFoundDesc: 'Le lien demandé est invalide ou a été supprimé. Veuillez contacter votre interlocuteur.',
    validityExpired: 'Validité expirée',
    proposalExpiredTitle: 'Cette offre a expiré',
    proposalExpiredDesc: 'L\'offre pour {title} était valable 30 jours et a expiré le {date}. Souhaitez-vous demander une prolongation ou une mise à jour ?',
    requestExtension: 'Demander une prolongation',
    loadingPresentation: 'Chargement de la présentation...',
    protectedPresentation: 'Présentation client protégée',
    pinRequired: 'Ce document est protégé par mot de passe. Veuillez saisir votre code PIN.',
    pinWrong: 'Code PIN erroné. Veuillez réessayer.',
    openPresentation: 'Ouvrir la présentation',
    lightMode: 'Clair',
    darkMode: 'Sombre',
    switchToLight: 'Passer au mode clair',
    switchToDark: 'Passer au mode sombre',
    shareThemeLabel: 'Thème lors du partage'
  }
};

export const SLIDE_TITLE_TRANSLATIONS: Record<string, { de: string; en: string; fr: string }> = {
  'Projekt Status Overview': {
    de: 'Projekt Status Overview',
    en: 'Project Status Overview',
    fr: 'Aperçu du statut du projet'
  },
  'Projektstatus Übersicht': {
    de: 'Projektstatus Übersicht',
    en: 'Project Status Overview',
    fr: 'Aperçu du statut du projet'
  },
  'Aktueller Baufortschritt': {
    de: 'Aktueller Baufortschritt',
    en: 'Current Construction Progress',
    fr: 'Avancement actuel des travaux'
  },
  'Das Projekt-Team': {
    de: 'Das Projekt-Team',
    en: 'The Project Team',
    fr: 'L’équipe du projet'
  },
  'Projekt-Budget': {
    de: 'Projekt-Budget',
    en: 'Project Budget',
    fr: 'Budget du projet'
  },
  'Projekt Budget': {
    de: 'Projekt Budget',
    en: 'Project Budget',
    fr: 'Budget du projet'
  },
  'Meilensteine & Zeitplan': {
    de: 'Meilensteine & Zeitplan',
    en: 'Milestones & Timeline',
    fr: 'Jalons & calendrier'
  },
  'Architektur & Konzept': {
    de: 'Architektur & Konzept',
    en: 'Architecture & Concept',
    fr: 'Architecture & concept'
  },
  'Vision & Architekturkonzept': {
    de: 'Vision & Architekturkonzept',
    en: 'Vision & Architectural Concept',
    fr: 'Vision & concept architectural'
  },
  '3D-Showreel & BIM-Modellierung': {
    de: '3D-Showreel & BIM-Modellierung',
    en: '3D Showreel & BIM Modeling',
    fr: 'Showreel 3D & modélisation BIM'
  },
  'Materialisierung & Ausbau-Standard': {
    de: 'Materialisierung & Ausbau-Standard',
    en: 'Materials & Interior Standards',
    fr: 'Matérialisation & standard de finition'
  },
  'Investitions- & BKP-Gliederung': {
    de: 'Investitions- & BKP-Gliederung',
    en: 'Investment Structure & BKP Breakdown',
    fr: 'Structure des investissements & CFC'
  },
  'Ihr interdisziplinäres Planungsteam': {
    de: 'Ihr interdisziplinäres Planungsteam',
    en: 'Your Interdisciplinary Planning Team',
    fr: 'Votre équipe de planification pluridisciplinaire'
  },
  '3D Modell & Visualisierung': {
    de: '3D Modell & Visualisierung',
    en: '3D Model & Visualization',
    fr: 'Modèle 3D & Visualisation'
  },
  'Offerte & Kostenübersicht': {
    de: 'Offerte & Kostenübersicht',
    en: 'Proposal & Cost Overview',
    fr: 'Offre & aperçu des coûts'
  },
  'interacTV Smart Station Konzept': {
    de: 'interacTV Smart Station Konzept',
    en: 'interacTV Smart Station Concept',
    fr: 'Concept interacTV Smart Station'
  },
  '1. 60s Flightcase-Unboxing & Werkzeugloser Aufbau': {
    de: '1. 60s Flightcase-Unboxing & Werkzeugloser Aufbau',
    en: '1. 60s Flightcase Unboxing & Toolless Setup',
    fr: '1. Déballage flightcase 60s & montage sans outils'
  },
  '2. Formgefrästes Flightcase & CNC-Schaumstoff-Inlay': {
    de: '2. Formgefrästes Flightcase & CNC-Schaumstoff-Inlay',
    en: '2. Custom Milled Flightcase & CNC Foam Inlay',
    fr: '2. Flightcase fraisé & mousse CNC sur mesure'
  },
  '3. Kostenaufstellung & Schweizer SIA-Konditionen': {
    de: '3. Kostenaufstellung & Schweizer SIA-Konditionen',
    en: '3. Cost Breakdown & Swiss SIA Conditions',
    fr: '3. Détail des coûts & conditions suisses SIA'
  },
  'Vorher / Nachher Vergleich': {
    de: 'Vorher / Nachher Vergleich',
    en: 'Before / After Comparison',
    fr: 'Comparatif Avant / Après'
  },
  '3D Raummodell & Grundriss': {
    de: '3D Raummodell & Grundriss',
    en: '3D Room Model & Floor Plan',
    fr: 'Modèle spatial 3D & Plan d’étage'
  },
  'Projekt Übersicht': {
    de: 'Projekt Übersicht',
    en: 'Project Overview',
    fr: 'Aperçu du projet'
  },
  'Ausführungsplanung': {
    de: 'Ausführungsplanung',
    en: 'Execution Planning',
    fr: 'Plans d’exécution'
  },
  'Projekt Meilensteine': {
    de: 'Projekt Meilensteine',
    en: 'Project Milestones',
    fr: 'Jalons du projet'
  }
};

export const SLIDE_CONTENT_TRANSLATIONS: Record<string, { de: string; en: string; fr: string }> = {
  'Das Projekt Quartier Neubau Süd verbindet skandinavische Schlichtheit mit Schweizer Präzision:\n\n• Holz-Hybridbauweise mit minimalem CO₂-Footprint\n• Lichtdurchflutete Räume durch bodentiefe Dreifach-Panoramafenster\n• Höchste Schall- und Wärmedämmwerte nach Minergie-P-Standard': {
    de: 'Das Projekt Quartier Neubau Süd verbindet skandinavische Schlichtheit mit Schweizer Präzision:\n\n• Holz-Hybridbauweise mit minimalem CO₂-Footprint\n• Lichtdurchflutete Räume durch bodentiefe Dreifach-Panoramafenster\n• Höchste Schall- und Wärmedämmwerte nach Minergie-P-Standard',
    en: 'The Quartier Neubau South project combines Scandinavian simplicity with Swiss precision:\n\n• Wood-hybrid construction with minimal carbon footprint\n• Sun-drenched rooms through floor-to-ceiling triple-glazed panoramic windows\n• Top-tier acoustic and thermal insulation values according to Minergie-P standard',
    fr: 'Le projet Quartier Neubau Sud allie la sobriété scandinave à la précision suisse :\n\n• Construction hybride en bois à empreinte carbone minimale\n• Espaces baignés de lumière grâce à des triples vitrages panoramiques du sol au plafond\n• Valeurs d’isolation acoustique et thermique optimales selon le standard Minergie-P'
  },
  'Vollständige digitale Modellierung aller Gewerke (Architektur, Statik, HLKS):\n\n• Kollisionsfreie Schnittstellenplanung vor Baubeginn\n• Automatische Mengenauszüge für exakte BKP-Kostensicherheit\n• 4K-Walkthrough für Bauherren und Behörden': {
    de: 'Vollständige digitale Modellierung aller Gewerke (Architektur, Statik, HLKS):\n\n• Kollisionsfreie Schnittstellenplanung vor Baubeginn\n• Automatische Mengenauszüge für exakte BKP-Kostensicherheit\n• 4K-Walkthrough für Bauherren und Behörden',
    en: 'Complete digital modeling of all trades (architecture, structural engineering, MEP):\n\n• Clash-free interface coordination prior to site groundbreaking\n• Automated quantity takeoffs for exact BKP cost reliability\n• 4K walkthrough for owners and approval authorities',
    fr: 'Modélisation numérique intégrale de tous les corps d’état (architecture, statique, CVC) :\n\n• Planification d’interfaces sans collision avant le début des travaux\n• Métrés automatisés garantissant la sécurité des coûts CFC\n• Visite immersive 4K pour le maître de l’ouvrage et les autorités'
  },
  'Exklusive Materialien mit langlebiger Patina und Werthaltigkeit:\n\n• Handverlesenes Schweizer Eichenparkett (geölt)\n• Fein geglätteter Sichtbeton im Treppenhaus und Entrée\n• Grossformatiges Feinsteinzeug und hochwertige Sanitärapparate': {
    de: 'Exklusive Materialien mit langlebiger Patina und Werthaltigkeit:\n\n• Handverlesenes Schweizer Eichenparkett (geölt)\n• Fein geglätteter Sichtbeton im Treppenhaus und Entrée\n• Grossformatiges Feinsteinzeug und hochwertige Sanitärapparate',
    en: 'Exclusive materials with enduring patina and high value retention:\n\n• Hand-selected Swiss oak parquet (oiled)\n• Smooth exposed concrete in staircases and entrance foyer\n• Large-format porcelain stoneware and premium sanitary fittings',
    fr: 'Matériaux nobles offrant une patine durable et une haute valeur patrimoniale :\n\n• Parquet en chêne suisse trié à la main (huilé)\n• Béton brut soigneusement lissé dans la cage d’escalier et le hall d’entrée\n• Grès cérame grand format et appareils sanitaires haut de gamme'
  },
  'Echter 60-Sekunden Zeitraffer-Beweis: 1 Person öffnet das Transport-Case und stellt die 4K Smart Station komplett ohne Werkzeug auf. Verdeckte Kabelführung und Schweizer Präzision.': {
    de: 'Echter 60-Sekunden Zeitraffer-Beweis: 1 Person öffnet das Transport-Case und stellt die 4K Smart Station komplett ohne Werkzeug auf. Verdeckte Kabelführung und Schweizer Präzision.',
    en: 'Real 60-second timelapse proof: 1 person opens the transport case and sets up the 4K Smart Station completely tool-free. Concealed cable routing and Swiss precision.',
    fr: 'Preuve en accéléré de 60 secondes : 1 personne ouvre le flightcase et monte la station 4K sans aucun outil. Passage de câbles invisible et précision suisse.'
  },
  'Sicherer Transport im massgeschneiderten CNC-Schaumstoff-Inlay. Maximale Flexibilität: Nutzen Sie Ihre eigenen Bildschirme via Universal VESA 200/400 Halterung oder zertifizierte 4K PCAP Multitouch-Displays (32" bis 98").': {
    de: 'Sicherer Transport im massgeschneiderten CNC-Schaumstoff-Inlay. Maximale Flexibilität: Nutzen Sie Ihre eigenen Bildschirme via Universal VESA 200/400 Halterung oder zertifizierte 4K PCAP Multitouch-Displays (32" bis 98").',
    en: 'Safe transport in custom CNC foam inlay. Maximum flexibility: Use your own screens via universal VESA 200/400 mount or certified 4K PCAP multitouch displays (32" to 98").',
    fr: 'Transport sécurisé dans un calage en mousse usiné par CNC. Flexibilité maximale : utilisez vos propres écrans avec fixation VESA 200/400 universelle ou des écrans tactiles 4K PCAP certifiés (32" à 98").'
  },
  'Die Rohbauarbeiten sind zu 80% abgeschlossen. Der Innenausbau startet planmässig nächste Woche.': {
    de: 'Die Rohbauarbeiten sind zu 80% abgeschlossen. Der Innenausbau startet planmässig nächste Woche.',
    en: 'Structural work is 80% complete. Interior construction begins as scheduled next week.',
    fr: 'Les travaux de gros œuvre sont achevés à 80%. L’aménagement intérieur commence comme prévu la semaine prochaine.'
  },
  'Der Fokus liegt aktuell auf dem Betonieren der Decke über dem 1. Obergeschoss sowie der Vorbereitung für die Fassadenelemente.': {
    de: 'Der Fokus liegt aktuell auf dem Betonieren der Decke über dem 1. Obergeschoss sowie der Vorbereitung für die Fassadenelemente.',
    en: 'The current focus is on pouring concrete for the ceiling above the 1st floor and preparing facade elements.',
    fr: 'L’accent est actuellement mis sur le bétonnage du plafond au-dessus du 1er étage et sur la préparation des éléments de façade.'
  }
};

export const INTRO_TEXT_TRANSLATIONS: Record<string, { de: string; en: string; fr: string }> = {
  'Sehr geehrter Herr Dr. Keller, herzlichen Dank für das fundierte Vorgespräch. Wir freuen uns, Ihnen nachfolgend unser detailliertes Gesamtangebot für Konzeption, Werkplanung, Devisierung und örtliche Bauleitung (SIA Phasen 31 bis 53) vorzulegen.': {
    de: 'Sehr geehrter Herr Dr. Keller, herzlichen Dank für das fundierte Vorgespräch. Wir freuen uns, Ihnen nachfolgend unser detailliertes Gesamtangebot für Konzeption, Werkplanung, Devisierung und örtliche Bauleitung (SIA Phasen 31 bis 53) vorzulegen.',
    en: 'Dear Dr. Keller, thank you very much for our insightful preliminary discussion. We are pleased to present below our detailed comprehensive proposal for conceptual design, execution planning, tendering, and on-site construction management (SIA phases 31 to 53).',
    fr: 'Cher Dr Keller, nous vous remercions vivement pour cet entretien préliminaire constructif. Nous avons le plaisir de vous soumettre ci-après notre offre globale détaillée pour la conception, les plans d’exécution, les soumissions et la direction des travaux sur place (phases SIA 31 à 53).'
  },
  'Vielen Dank für das Vertrauen in unser Team. Nachfolgend präsentieren wir Ihnen das massgeschneiderte Konzept, alle Projekt-Videos, Meilensteine und die verbindliche Kostenaufstellung.': {
    de: 'Vielen Dank für das Vertrauen in unser Team. Nachfolgend präsentieren wir Ihnen das massgeschneiderte Konzept, alle Projekt-Videos, Meilensteine und die verbindliche Kostenaufstellung.',
    en: 'Thank you for placing your trust in our team. Below we present the tailored concept, all project videos, milestones, and the binding cost breakdown.',
    fr: 'Merci de votre confiance envers notre équipe. Nous vous présentons ci-dessous le concept sur mesure, toutes les vidéos de projet, les jalons et le détail des coûts.'
  },
  'Herzlichen Dank für Ihr Interesse an der interacTV Smart Station. Nachfolgend präsentieren wir Ihnen das modulare Konzept für Ihren Messeauftritt – mit Schweizer CAD-Präzisions-Chassis, flexibler Display-Wahl (BYOD oder 4K Touchscreen), interaktiver Lead-Erfassung und verbindlicher Kostenaufstellung.': {
    de: 'Herzlichen Dank für Ihr Interesse an der interacTV Smart Station. Nachfolgend präsentieren wir Ihnen das modulare Konzept für Ihren Messeauftritt – mit Schweizer CAD-Präzisions-Chassis, flexibler Display-Wahl (BYOD oder 4K Touchscreen), interaktiver Lead-Erfassung und verbindlicher Kostenaufstellung.',
    en: 'Thank you for your interest in the interacTV Smart Station. Below we present the modular concept for your exhibition booth – featuring Swiss CAD precision chassis, flexible display options (BYOD or 4K touchscreen), interactive lead capture, and binding cost breakdown.',
    fr: 'Merci de votre intérêt pour l’interacTV Smart Station. Nous vous présentons ci-dessous le concept modulaire pour votre stand – avec châssis de précision CAO suisse, choix d’écran flexible (BYOD ou écran tactile 4K), saisie interactive des prospects et détail des coûts.'
  },
  'Herzlichen Dank für das persönliche Gespräch. Wir freuen uns, Ihnen unser umfassendes Konzept für Architektur, Ausführungsplanung und BIM-Projektsteuerung präsentieren zu dürfen.': {
    de: 'Herzlichen Dank für das persönliche Gespräch. Wir freuen uns, Ihnen unser umfassendes Konzept für Architektur, Ausführungsplanung und BIM-Projektsteuerung präsentieren zu dürfen.',
    en: 'Thank you for the personal meeting. We are delighted to present our comprehensive concept for architecture, execution planning, and BIM project management.',
    fr: 'Merci beaucoup pour cet échange personnel. Nous sommes ravis de vous présenter notre concept global für l’architecture, les plans d’exécution et le pilotage de projet BIM.'
  },
  'Exklusives Angebot und massgeschneidertes Projektkonzept.': {
    de: 'Exklusives Angebot und massgeschneidertes Projektkonzept.',
    en: 'Exclusive proposal and tailored project concept.',
    fr: 'Offre exclusive et concept de projet sur mesure.'
  }
};

export const BUDGET_GROUP_TRANSLATIONS: Record<string, { de: string; en: string; fr: string }> = {
  'Vorprojekt & Bewilligungsverfahren': {
    de: 'Vorprojekt & Bewilligungsverfahren',
    en: 'Preliminary Project & Permitting',
    fr: 'Avant-projet & mise à l\'enquête'
  },
  'Ausschreibung & Ausführungsplanung': {
    de: 'Ausschreibung & Ausführungsplanung',
    en: 'Tendering & Detailed Execution Planning',
    fr: 'Appels d\'offres & plans d\'exécution'
  },
  'Bauleitung, QS & Inbetriebnahme': {
    de: 'Bauleitung, QS & Inbetriebnahme',
    en: 'Site Supervision, QA & Commissioning',
    fr: 'Direction des travaux, AQ & mise en service'
  },
  'interacTV Event Pro 80 Chassis (Ø 80cm Standfuss)': {
    de: 'interacTV Event Pro 80 Chassis (Ø 80cm Standfuss)',
    en: 'interacTV Event Pro 80 Chassis (Ø 80cm Base)',
    fr: 'Châssis interacTV Event Pro 80 (Socle Ø 80cm)'
  },
  'Display-Lösung (4K Touchscreen / BYOD Montage)': {
    de: 'Display-Lösung (4K Touchscreen / BYOD Montage)',
    en: 'Display Solution (4K Touchscreen / BYOD Mount)',
    fr: 'Solution d\'affichage (Écran tactile 4K / Montage BYOD)'
  },
  'Lead PRO Software & Gamification-Lizenz': {
    de: 'Lead PRO Software & Gamification-Lizenz',
    en: 'Lead PRO Software & Gamification License',
    fr: 'Logiciel Lead PRO & Licence de gamification'
  },
  'Standplatz-Express-Logistik & 5-Minuten Aufbau': {
    de: 'Standplatz-Express-Logistik & 5-Minuten Aufbau',
    en: 'Booth Express Logistics & 5-Minute Setup',
    fr: 'Logistique express sur stand & montage en 5 minutes'
  },
  'Bexio / CRM Live-Sync Anbindung': {
    de: 'Bexio / CRM Live-Sync Anbindung',
    en: 'Bexio / CRM Live-Sync Integration',
    fr: 'Connexion Live-Sync Bexio / CRM'
  }
};

export const TEAM_ROLE_TRANSLATIONS: Record<string, { de: string; en: string; fr: string }> = {
  'Lead Architecture & BIM': {
    de: 'Lead Architecture & BIM',
    en: 'Lead Architecture & BIM',
    fr: 'Direction architecture & BIM'
  },
  'Bauleiter SIA / Devisierung': {
    de: 'Bauleiter SIA / Devisierung',
    en: 'SIA Site Manager / Tendering',
    fr: 'Direction des travaux SIA / Soumissions'
  },
  'Bauingenieurin & Statik ETH': {
    de: 'Bauingenieurin & Statik ETH',
    en: 'Civil & Structural Engineer ETH',
    fr: 'Ingénieure civile & statique EPF'
  }
};

export const OPTION_TRANSLATIONS: Record<string, {
  title: { de: string; en: string; fr: string };
  desc: { de: string; en: string; fr: string };
}> = {
  '3D-Echtzeit BIM-Visualisierung & VR-Begehung': {
    title: {
      de: '3D-Echtzeit BIM-Visualisierung & VR-Begehung',
      en: 'Real-Time 3D BIM Visualization & VR Walkthrough',
      fr: 'Visualisation BIM temps réel & visite VR'
    },
    desc: {
      de: 'Fotorealistisches 3D-BIM-Modell mit interaktiver Virtual-Reality-Begehung für Bauherren und Käufer auf Tablet & VR-Headset.',
      en: 'Photorealistic 3D BIM model with interactive virtual reality walkthrough for clients and buyers on tablet & VR headset.',
      fr: 'Modèle BIM 3D photoréaliste avec visite interactive en réalité virtuelle pour maîtres d\'ouvrage et acquéreurs sur tablette & casque VR.'
    }
  },
  'Monatliche Drohnen-Baufortschrittsdokumentation (4K)': {
    title: {
      de: 'Monatliche Drohnen-Baufortschrittsdokumentation (4K)',
      en: 'Monthly Drone Construction Progress Documentation (4K)',
      fr: 'Suivi de chantier mensuel par drone (4K)'
    },
    desc: {
      de: 'Hochauflösende Luftbildaufnahmen, 3D-Fotogrammetrie-Messungen und monatliches Zeitraffervideo für die Bauherrschaft.',
      en: 'High-resolution aerial imagery, 3D photogrammetry surveys, and monthly timelapse videos for the client.',
      fr: 'Prises de vues aériennes haute résolution, mesures photogrammétriques 3D et vidéo accélérée mensuelle pour le maître d\'ouvrage.'
    }
  },
  'Minergie-P-ECO Fachbegleitung & Nachhaltigkeitsnachweis': {
    title: {
      de: 'Minergie-P-ECO Fachbegleitung & Nachhaltigkeitsnachweis',
      en: 'Minergie-P-ECO Specialist Advisory & Sustainability Verification',
      fr: 'Accompagnement Minergie-P-ECO & bilan écologique'
    },
    desc: {
      de: 'Zertifizierungsbegleitung, ökologische Baustoffberatung und Energienachweise nach kantonalem MuKEn-Standard.',
      en: 'Certification consulting, ecological material advisory, and energy certificates according to cantonal MuKEn standards.',
      fr: 'Suivi de certification, conseil en matériaux écologiques et bilans énergétiques selon les normes MoPEC.'
    }
  },
  'Express-Baubewilligungsverfahren & behördliche Sonderverhandlung': {
    title: {
      de: 'Express-Baubewilligungsverfahren & behördliche Sonderverhandlung',
      en: 'Fast-Track Building Permit Procedure & Authority Coordination',
      fr: 'Procédure de permis accélérée & négociations administratives'
    },
    desc: {
      de: 'Prioritäre Bearbeitung der Baueingabe mit proaktiver Denkmalpflege- und Umweltämter-Koordination.',
      en: 'Priority processing of permit applications with proactive heritage preservation and environmental agency coordination.',
      fr: 'Traitement prioritaire de la demande de permis avec coordination proactive des monuments historiques et services environnementaux.'
    }
  },
  'interacTV 4K PCAP Touchscreen 55"': {
    title: {
      de: 'interacTV 4K PCAP Touchscreen 55"',
      en: '55" 4K PCAP Touchscreen Display',
      fr: 'Écran tactile 4K PCAP 55"'
    },
    desc: {
      de: 'Ultra HD IPS Commercial Display mit 10-Punkt PCAP Touchscreen betriebsbereit vorinstalliert',
      en: 'Ultra HD IPS commercial display with 10-point PCAP touchscreen pre-installed and ready to use',
      fr: 'Écran commercial IPS Ultra HD avec dalle tactile PCAP 10 points préinstallé prêt à l\'emploi'
    }
  },
  'NFC Lift & Learn Sensorik-Kit': {
    title: {
      de: 'NFC Lift & Learn Sensorik-Kit',
      en: 'NFC Lift & Learn Sensor Kit',
      fr: 'Kit capteurs NFC Lift & Learn'
    },
    desc: {
      de: 'USB-Sensorik mit 10x programmierbaren Produkt-Tags zur interaktiven Produkterklärung',
      en: 'USB sensors with 10 programmable product tags for interactive product demonstrations',
      fr: 'Capteurs USB avec 10 tags produits programmables pour explication interactive'
    }
  },
  '3D WebGL Messestand Visualizer & Digital Twin': {
    title: {
      de: '3D WebGL Messestand Visualizer & Digital Twin',
      en: '3D WebGL Booth Visualizer & Digital Twin',
      fr: 'Visualiseur de stand 3D WebGL & Jumeau numérique'
    },
    desc: {
      de: 'Interaktive Standansicht für Kunden & Web-Showroom vor Messebeginn',
      en: 'Interactive booth view for clients and virtual showroom before the trade fair starts',
      fr: 'Aperçu interactif du stand pour clients et showroom virtuel avant le salon'
    }
  },
  'All-Risk Messe- & Transportschutz (Vollkasko)': {
    title: {
      de: 'All-Risk Messe- & Transportschutz (Vollkasko)',
      en: 'All-Risk Trade Fair & Transport Insurance',
      fr: 'Protection transport & salon tous risques (Tous risques)'
    },
    desc: {
      de: 'Umfassender Versicherungsschutz ohne Selbstbehalt während der gesamten Messe',
      en: 'Comprehensive insurance coverage without deductible for the entire exhibition duration',
      fr: 'Couverture d\'assurance intégrale sans franchise pendant toute la durée du salon'
    }
  }
};

export const MILESTONE_TRANSLATIONS: Record<string, {
  phase: { de: string; en: string; fr: string };
  desc: { de: string; en: string; fr: string };
}> = {
  '1. Phase: Projektierung, Vorprojekt & Baubewilligung (30%)': {
    phase: {
      de: '1. Phase: Projektierung, Vorprojekt & Baubewilligung (30%)',
      en: 'Phase 1: Project Design, Preliminary Project & Building Permit (30%)',
      fr: '1ère Phase : Conception, avant-projet & permis de construire (30%)'
    },
    desc: {
      de: 'Fällig bei digitaler Freigabe und Auftragsbestätigung (Swiss QR-Rechnung).',
      en: 'Due upon digital approval and order confirmation (Swiss QR-bill).',
      fr: 'Exigible dès validation numérique et confirmation de commande (facture QR suisse).'
    }
  },
  '2. Phase: Ausführungsplanung, Devisierung & Vergabe (40%)': {
    phase: {
      de: '2. Phase: Ausführungsplanung, Devisierung & Vergabe (40%)',
      en: 'Phase 2: Detailed Execution Planning, Tendering & Awarding (40%)',
      fr: '2ème Phase : Plans d\'exécution, soumissions & adjudication (40%)'
    },
    desc: {
      de: 'Fällig nach Freigabe der Werkpläne vor Aushub und Baumeisterstart.',
      en: 'Due after approval of working drawings prior to excavation and structural work.',
      fr: 'Exigible après approbation des plans d\'exécution avant terrassement et gros œuvre.'
    }
  },
  '3. Phase: Bauleitung, Realisierung & schlüsselfertige Übergabe (30%)': {
    phase: {
      de: '3. Phase: Bauleitung, Realisierung & schlüsselfertige Übergabe (30%)',
      en: 'Phase 3: Site Management, Realization & Turnkey Handover (30%)',
      fr: '3ème Phase : Direction des travaux, réalisation & remise clés en main (30%)'
    },
    desc: {
      de: 'Fällig nach mängelfreier Bauabnahme und Bezug der Liegenschaft.',
      en: 'Due after defect-free acceptance and building occupancy.',
      fr: 'Exigible après réception sans réserves de l\'ouvrage et remise des clés.'
    }
  },
  '1. Reservierung & Chassis-Bereitstellung': {
    phase: {
      de: '1. Reservierung & Chassis-Bereitstellung',
      en: '1. Reservation & Chassis Preparation',
      fr: '1. Réservation & mise à disposition du châssis'
    },
    desc: {
      de: 'Nach Auftragsbestätigung und Terminreservierung',
      en: 'Upon order confirmation and reservation',
      fr: 'Dès confirmation de commande et réservation de date'
    }
  },
  '2. Standanlieferung & Übergabe': {
    phase: {
      de: '2. Standanlieferung & Übergabe',
      en: '2. Booth Delivery & Handover',
      fr: '2. Livraison sur stand & mise en service'
    },
    desc: {
      de: 'Nach Einweisung und erfolgreichem Probebetrieb vor Ort',
      en: 'After briefing and successful trial run on-site',
      fr: 'Après formation et essai réussi sur place'
    }
  }
};

export const LEGAL_DOC_TRANSLATIONS: Record<string, { de: string; en: string; fr: string }> = {
  'SIA 118 Allgemeine Bedingungen für Bauarbeiten': {
    de: 'SIA 118 Allgemeine Bedingungen für Bauarbeiten',
    en: 'SIA 118 General Conditions for Construction Works',
    fr: 'SIA 118 Conditions générales pour l\'exécution des travaux de construction'
  },
  'Kreativ Desk AGB Planungsverträge & SIA 102 Honorarordnung': {
    de: 'Kreativ Desk AGB Planungsverträge & SIA 102 Honorarordnung',
    en: 'Kreativ Desk GTC Planning Contracts & SIA 102 Fee Regulations',
    fr: 'Kreativ Desk CGV Contrats de planification & SIA 102 Règlement des honoraires'
  },
  'Schweizer DSGVO & Bauherren-Vertraulichkeitsvereinbarung (NDA)': {
    de: 'Schweizer DSGVO & Bauherren-Vertraulichkeitsvereinbarung (NDA)',
    en: 'Swiss FADP & Client Non-Disclosure Agreement (NDA)',
    fr: 'LPD suisse & Accord de confidentialité maître de l\'ouvrage (NDA)'
  },
  'SIA 118 Allgemeine Bedingungen für Messe- & Mietverträge': {
    de: 'SIA 118 Allgemeine Bedingungen für Messe- & Mietverträge',
    en: 'SIA 118 General Conditions for Exhibition & Rental Contracts',
    fr: 'SIA 118 Conditions générales pour contrats de salon et de location'
  },
  'DSGVO / Schweizer DSG Datenschutzvereinbarung': {
    de: 'DSGVO / Schweizer DSG Datenschutzvereinbarung',
    en: 'Data Privacy Agreement according to Swiss FADP / GDPR',
    fr: 'Accord de protection des données selon la LPD suisse / RGPD'
  }
};

export const LEGAL_CONTENT_TRANSLATIONS = {
  de: {
    badgeSiaStandard: '🇨🇭 SIA Standard',
    badgeBinding: 'Rechtsverbindlich',
    badgeEdition: 'Stand: Ausgabe 2026',
    legalFrameworkSubtitle: 'Rechtsverbindliches Schweizer Vertragswerk nach SIA',
    clientHeader: 'Auftraggeber (Bauherrschaft / Bauleitung)',
    clientSub: 'handelnd im Auftrag der Bauherrschaft',
    contractorHeader: 'Auftragnehmer (Werkunternehmer / Kunde)',
    country: 'Schweiz',
    clientSignLabel: 'Auftraggeber / Bauleitung',
    clientSignSub: 'Zürich, digital signiert',
    contractorSignLabel: 'Auftragnehmer / Kunde',
    contractorSignPending: 'Wird bei digitaler Annahme signiert',
    contractorSignSub: 'E-Signatur via Smart Offerte',
    printDoc: 'Drucken',
    downloadPdf: 'PDF Download',
    close: 'Schliessen',
    refLabel: 'Ref',
    projectLabel: 'Projekt',
    werkvertragTag: 'SIA 118 • OR Art. 363 ff.',
    agbTag: 'SIA 102 • Honorarordnung',
    ndaTag: 'Schweizer DSG • Vertraulichkeit',
    standardTag: 'Vertragsdokument',
    werkvertrag: {
      sec1Title: '§ 1. Vertragsgegenstand & Ausführungsumfang',
      sec1Text: 'Der Unternehmer verpflichtet sich zur fachgerechten, mangelfreien und termingerechten Erstellung der vereinbarten Bau-, Ausbau- und Montageleistungen gemäss vorliegender Offerte, dem Leistungsverzeichnis und den freigegebenen Werkplänen.',
      sec2Title: '§ 2. Rechtsgrundlagen (SIA 118)',
      sec2Intro: 'Für diesen Werkvertrag gelten als integrale, verbindliche Vertragsbestandteile in folgender Rangfolge:',
      sec2List: [
        'Dieser Werkvertragstext und die freigegebene Offerte',
        'Die SIA-Norm 118 „Allgemeine Bedingungen für Bauarbeiten“ (Ausgabe 2013)',
        'Die einschlägigen fachtechnischen Spezialnormen der SIA für das betreffende Gewerk',
        'Die Bestimmungen des Schweizerischen Obligationenrechts (OR Art. 363 ff.)'
      ],
      sec3Title: '§ 3. Vergütung, Festpreisgarantie & Zahlungsplan',
      sec3Text: 'Die vereinbarten Preise gelten als garantierte Festpreise bis zur vollständigen Fertigstellung und formellen Abnahme des Werkes. Teuerungen sind ausdrücklich ausgeschlossen. Abschlagszahlungen erfolgen gemäss dem vereinbarten Meilenstein-Zahlungsplan nach Prüfung und Freigabe durch die Bauleitung.',
      sec4Title: '§ 4. Ausführungsfristen, Bauprogramm & Verzug',
      sec4Text: 'Die im Bauprogramm vereinbarten Termine sind verbindliche Vertragsfristen. Bei drohendem Verzug hat der Unternehmer unverzüglich schriftlich Anzeige zu erstatten. Gerät der Unternehmer in Verzug, behält sich die Bauleitung das Recht vor, nach schriftlicher Mahnung und Fristansetzung gemäss Art. 169 SIA 118 auf Kosten des Unternehmers eine Ersatzvornahme durch ein Drittunternehmen zu veranlassen.',
      sec5Title: '§ 5. Formelle Abnahme, Rügefristen & Gewährleistung (SIA 118)',
      sec5Handover: 'Die Abnahme erfolgt nach Fertigstellung formell mittels gemeinsamem Abnahmeprotokoll (SIA 118 Art. 157 ff.).',
      sec5Notice2YLabel: '2-jährige Rügefrist (Art. 172 SIA 118):',
      sec5Notice2YText: 'Läuft ab Datum der formellen Abnahme. Während dieser Frist können Mängel jederzeit gerügt werden.',
      sec5Notice5YLabel: '5-jährige Verjährungsfrist (Art. 180 SIA 118):',
      sec5Notice5YText: 'Gilt für verdeckte Mängel ab Abnahmedatum.',
      sec6Title: '§ 6. Sicherheitsleistung & Garantierückbehalt',
      sec6Text: 'Zur Sicherstellung der Mängelrechte verbleibt bei der Schlussrechnung ein Garantierückbehalt von 10 % oder der Unternehmer stellt eine gleichwertige Bank- oder Versicherungsgarantie für die Dauer der zweijährigen Rügefrist bereit.',
      sec7Title: '§ 7. Gerichtsstand & Anwendbares Recht',
      sec7Text: 'Ausschliesslicher Gerichtsstand für sämtliche Streitigkeiten aus diesem Werkvertrag ist der Ort der gelegenen Sache (Zürich, Schweiz). Es gilt ausschliesslich Schweizerisches Recht.'
    },
    agb: {
      sec1Title: '§ 1. Geltungsbereich & Vertragsgrundlagen (SIA 102)',
      sec1Text: 'Diese Allgemeinen Geschäftsbedingungen regeln das Vertragsverhältnis für alle Architektur-, Planungs- und Bauleitungsleistungen und basieren auf der Ordnung SIA 102 (Ordnung für Leistungen und Honorare der Architektinnen und Architekten).',
      sec2Title: '§ 2. Urheberrechte & Geistiges Eigentum',
      sec2Text: 'Sämtliche Pläne, Entwürfe, 3D-BIM-Modelle und Berechnungen verbleiben im geistigen Eigentum des Planers und dürfen nur für das vertraglich vereinbarte Bauwerk verwendet werden.',
      sec3Title: '§ 3. Zahlungsfristen & Verzugszins',
      sec3Text: 'Rechnungen und Abschlagszahlungen sind innerhalb von 30 Tagen netto zahlbar. Bei Verzug wird der gesetzliche Verzugszins von 5 % p.a. fällig.',
      sec4Title: '§ 4. Anwendbares Recht & Gerichtsstand',
      sec4Text: 'Es gilt ausschliesslich Schweizer Recht unter Ausschluss des Wiener Kaufrechts. Gerichtsstand ist Zürich, Schweiz.'
    },
    nda: {
      sec1Title: '§ 1. Vertraulichkeitsverpflichtung & Schweizer DSG',
      sec1Text: 'Die Parteien verpflichten sich gegenseitig, sämtliche im Rahmen des Projekts ausgetauschten Daten, Bauherrenangaben, Kalkulationen und CAD-/BIM-Daten streng vertraulich zu behandeln und die Vorgaben des Schweizer Datenschutzgesetzes (DSG) vollumfänglich einzuhalten.',
      sec2Title: '§ 2. Dauer & Weitergabe an Dritte',
      sec2Text: 'Die Vertraulichkeit gilt für die gesamte Projektdauer sowie 5 Jahre über den Projektabschluss hinaus. Eine Weitergabe an Fachplaner und Behörden erfolgt nur, soweit dies zur Projektabwicklung zwingend erforderlich ist.'
    },
    standard: {
      sec1Title: '§ 1. Verbindliche Vertragsbedingungen',
      sec1Text: 'Dieses Vertragsdokument ist integraler Bestandteil der Offerte und wird mit der digitalen Freigabe durch die Vertragsparteien rechtsverbindlich anerkannt.'
    }
  },
  en: {
    badgeSiaStandard: '🇨🇭 SIA Standard',
    badgeBinding: 'Legally Binding',
    badgeEdition: 'Edition: 2026 Release',
    legalFrameworkSubtitle: 'Legally binding Swiss contractual framework according to SIA',
    clientHeader: 'Principal (Client / Site Management)',
    clientSub: 'acting on behalf of the client',
    contractorHeader: 'Contractor (Works Fabricator / Client)',
    country: 'Switzerland',
    clientSignLabel: 'Principal / Site Management',
    clientSignSub: 'Zurich, digitally signed',
    contractorSignLabel: 'Contractor / Client',
    contractorSignPending: 'Signed upon digital acceptance',
    contractorSignSub: 'E-Signature via Smart Proposal',
    printDoc: 'Print',
    downloadPdf: 'PDF Download',
    close: 'Close',
    refLabel: 'Ref',
    projectLabel: 'Project',
    werkvertragTag: 'SIA 118 • Swiss CO Art. 363 et seq.',
    agbTag: 'SIA 102 • Fee Regulations',
    ndaTag: 'Swiss FADP • Confidentiality',
    standardTag: 'Contract Document',
    werkvertrag: {
      sec1Title: '§ 1. Scope of Works & Performance',
      sec1Text: 'The contractor undertakes to execute the agreed construction, fitting, and installation works professionally, free of defects, and on schedule in accordance with this proposal, the bill of quantities, and the approved execution drawings.',
      sec2Title: '§ 2. Hierarchy of Governing Standards (SIA 118)',
      sec2Intro: 'The following documents constitute this construction contract in descending order of precedence:',
      sec2List: [
        'This main contract text and the approved proposal',
        'SIA Standard 118 "General Conditions for Construction Works" (Edition 2013)',
        'The applicable technical SIA specialist standards for the respective trade',
        'The provisions of the Swiss Code of Obligations (CO Art. 363 et seq.)'
      ],
      sec3Title: '§ 3. Remuneration, Fixed Price Guarantee & Payment Schedule',
      sec3Text: 'The agreed prices are guaranteed fixed lump-sum prices until complete completion and formal acceptance of the works. Price escalations are expressly excluded. Progress payments are made in accordance with the agreed milestone payment schedule following inspection and approval by site management.',
      sec4Title: '§ 4. Deadlines, Construction Schedule & Default',
      sec4Text: 'The milestones agreed in the construction schedule are binding contract deadlines. In the event of impending delays, the contractor must promptly notify in writing. If the contractor defaults, site management reserves the right, following written notice and deadline pursuant to Art. 169 SIA 118, to commission third-party substitute execution at the contractor\'s expense.',
      sec5Title: '§ 5. Formal Acceptance, Notice of Defects & Warranty (SIA 118)',
      sec5Handover: 'Handover shall be formalized upon completion by means of a joint formal acceptance protocol (SIA 118 Art. 157 et seq.).',
      sec5Notice2YLabel: '2-year warranty notice period (Art. 172 SIA 118):',
      sec5Notice2YText: 'Runs from the date of formal acceptance. During this period, defects may be notified at any time.',
      sec5Notice5YLabel: '5-year limitation period (Art. 180 SIA 118):',
      sec5Notice5YText: 'Applies to hidden defects from the formal acceptance date.',
      sec6Title: '§ 6. Security Deposit & Warranty Retention',
      sec6Text: 'To secure warranty claims, a 10% retention is withheld from the final invoice, or the contractor provides an equivalent bank or insurance guarantee for the duration of the two-year defect notification period.',
      sec7Title: '§ 7. Jurisdiction & Applicable Law',
      sec7Text: 'Exclusive place of jurisdiction for all disputes arising from this works contract is the location of the property (Zurich, Switzerland). Swiss substantive law applies exclusively.'
    },
    agb: {
      sec1Title: '§ 1. Scope & Contractual Framework (SIA 102)',
      sec1Text: 'These General Terms and Conditions govern the contractual relationship for all architectural, engineering, and site management services based on SIA Regulation 102 (Regulation for Services and Fees of Architects).',
      sec2Title: '§ 2. Copyright & Intellectual Property',
      sec2Text: 'All drawings, design drafts, 3D BIM models, and calculations remain the intellectual property of the planner and may only be utilized for the contractually agreed construction project.',
      sec3Title: '§ 3. Payment Terms & Default Interest',
      sec3Text: 'Invoices and progress claims are payable net within 30 days. In the event of default, statutory default interest of 5% p.a. becomes due.',
      sec4Title: '§ 4. Applicable Law & Jurisdiction',
      sec4Text: 'Swiss substantive law applies exclusively, excluding the UN Convention on Contracts for the International Sale of Goods (CISG). Place of jurisdiction is Zurich, Switzerland.'
    },
    nda: {
      sec1Title: '§ 1. Confidentiality Obligation & Swiss FADP',
      sec1Text: 'The parties mutually undertake to treat all project data, client disclosures, calculations, and CAD/BIM data in strict confidentiality and to fully comply with the provisions of the Swiss Federal Act on Data Protection (FADP).',
      sec2Title: '§ 2. Term & Disclosure to Third Parties',
      sec2Text: 'Confidentiality shall remain in effect for the entire duration of the project and for 5 years following project completion. Disclosure to specialist planners and public authorities shall occur solely to the extent strictly necessary for project execution.'
    },
    standard: {
      sec1Title: '§ 1. Binding Contract Terms',
      sec1Text: 'This contract document forms an integral part of the proposal and is legally recognized upon digital approval by the contracting parties.'
    }
  },
  fr: {
    badgeSiaStandard: '🇨🇭 SIA Standard',
    badgeBinding: 'Juridiquement contraignant',
    badgeEdition: 'Version : Édition 2026',
    legalFrameworkSubtitle: 'Cadre contractuel suisse juridiquement contraignant selon la SIA',
    clientHeader: 'Maître de l\'ouvrage (Direction des travaux)',
    clientSub: 'agissant pour le compte du maître de l\'ouvrage',
    contractorHeader: 'Entrepreneur (Adjudicataire / Client)',
    country: 'Suisse',
    clientSignLabel: 'Maître de l\'ouvrage / Direction',
    clientSignSub: 'Zurich, signé numériquement',
    contractorSignLabel: 'Entrepreneur / Client',
    contractorSignPending: 'Signé lors de l\'acceptation numérique',
    contractorSignSub: 'Signature électronique via Offre Intelligente',
    printDoc: 'Imprimer',
    downloadPdf: 'Télécharger PDF',
    close: 'Fermer',
    refLabel: 'Réf',
    projectLabel: 'Projet',
    werkvertragTag: 'SIA 118 • CO suisse art. 363 et suiv.',
    agbTag: 'SIA 102 • Règlement des honoraires',
    ndaTag: 'LPD suisse • Confidentialité',
    standardTag: 'Document contractuel',
    werkvertrag: {
      sec1Title: '§ 1. Objet du contrat & étendue des prestations',
      sec1Text: 'L\'entrepreneur s\'engage à exécuter les prestations de construction, d\'aménagement et de montage convenues de manière professionnelle, sans défauts et dans les délais, conformément à la présente offre, au descriptif des prestations et aux plans d\'exécution approuvés.',
      sec2Title: '§ 2. Bases juridiques (norme SIA 118)',
      sec2Intro: 'Pour ce contrat d\'entreprise, les éléments suivants constituent des parties intégrantes et contraignantes selon l\'ordre de priorité suivant :',
      sec2List: [
        'Le présent texte du contrat d\'entreprise et l\'offre validée',
        'La norme SIA 118 « Conditions générales pour l\'exécution des travaux de construction » (édition 2013)',
        'Les normes techniques spécialisées applicables de la SIA pour le corps de métier concerné',
        'Les dispositions du Code des obligations suisse (CO art. 363 et suiv.)'
      ],
      sec3Title: '§ 3. Rémunération, prix forfaitaire garanti & plan de paiement',
      sec3Text: 'Les prix convenus sont considérés comme des prix forfaitaires fermes et garantis jusqu\'à l\'achèvement complet et la réception formelle de l\'ouvrage. Tout renchérissement est expressément exclu. Les paiements d\'acomptes sont effectués conformément au plan d\'échéances convenu après vérification et validation par la direction des travaux.',
      sec4Title: '§ 4. Délais d\'exécution, calendrier des travaux & demeure',
      sec4Text: 'Les dates convenues dans le calendrier de construction constituent des délais contractuels obligatoires. En cas de menace de retard, l\'entrepreneur doit en aviser immédiatement la direction par écrit. Si l\'entrepreneur prend du retard, la direction des travaux se réserve le droit, après mise en demeure écrite et fixation d\'un délai conformément à l\'art. 169 SIA 118, d\'ordonner l\'exécution par un tiers aux frais de l\'entrepreneur.',
      sec5Title: '§ 5. Réception formelle, délais de réclamation & garantie (SIA 118)',
      sec5Handover: 'La réception a lieu formellement après achèvement au moyen d\'un procès-verbal de réception conjoint (SIA 118 art. 157 et suiv.).',
      sec5Notice2YLabel: 'Délai de réclamation de 2 ans (art. 172 SIA 118) :',
      sec5Notice2YText: 'Court à compter de la date de réception formelle. Pendant ce délai, les défauts peuvent être signalés à tout moment.',
      sec5Notice5YLabel: 'Délai de prescription de 5 ans (art. 180 SIA 118) :',
      sec5Notice5YText: 'S\'applique aux défauts cachés à compter de la date de réception.',
      sec6Title: '§ 6. Sûretés & retenue de garantie',
      sec6Text: 'Pour garantir les droits en cas de défauts, une retenue de garantie de 10 % est conservée sur le décompte final, ou l\'entrepreneur fournit une garantie bancaire ou d\'assurance équivalente pour la durée du délai de réclamation de deux ans.',
      sec7Title: '§ 7. For juridique & droit applicable',
      sec7Text: 'Le for exclusif pour tous les litiges découlant du présent contrat d\'entreprise est le lieu de situation de l\'immeuble (Zurich, Suisse). Le droit suisse s\'applique exclusivement.'
    },
    agb: {
      sec1Title: '§ 1. Champ d\'application & bases contractuelles (SIA 102)',
      sec1Text: 'Les présentes conditions générales régissent les relations contractuelles pour toutes les prestations d\'architecture, de planification et de direction des travaux, fondées sur le règlement SIA 102 (Règlement des prestations et des honoraires des architectes).',
      sec2Title: '§ 2. Droits d\'auteur & propriété intellectuelle',
      sec2Text: 'Tous les plans, esquisses, modèles BIM 3D et calculs restent la propriété intellectuelle du planificateur et ne peuvent être utilisés que pour l\'ouvrage convenu dans le contrat.',
      sec3Title: '§ 3. Délais de paiement & intérêts de retard',
      sec3Text: 'Les factures et acomptes sont payables à 30 jours net. En cas de retard, l\'intérêt moratoire légal de 5 % par an est exigible.',
      sec4Title: '§ 4. Droit applicable & for juridique',
      sec4Text: 'Le droit suisse s\'applique exclusivement, à l\'exclusion de la Convention de Vienne (CVIM). Le for juridique est fixé à Zurich, Suisse.'
    },
    nda: {
      sec1Title: '§ 1. Obligation de confidentialité & LPD suisse',
      sec1Text: 'Les parties s\'engagent mutuellement à traiter de manière strictement confidentielle toutes les données échangées dans le cadre du projet, indications du maître d\'ouvrage, calculs et données CAO/BIM, et à respecter intégralement les dispositions de la loi fédérale suisse sur la protection des données (LPD).',
      sec2Title: '§ 2. Durée & transmission à des tiers',
      sec2Text: 'La confidentialité s\'applique pour toute la durée du projet ainsi que 5 ans après la clôture du projet. La transmission à des mandataires spécialisés et aux autorités n\'a lieu que dans la mesure strictement requise pour la réalisation du projet.'
    },
    standard: {
      sec1Title: '§ 1. Conditions contractuelles obligatoires',
      sec1Text: 'Ce document contractuel fait partie intégrante de l\'offre et est reconnu comme juridiquement contraignant dès sa validation numérique par les parties.'
    }
  }
};

export function createDemoProposalForToken(shareToken?: string): SmartProposal {
  const isSteleProposal = Boolean(shareToken && (shareToken.includes('stele') || shareToken.includes('messe')));
  if (isSteleProposal) {
    return {
      id: 'demo-proposal-stele',
      projectId: shareToken || 'interactv-stele',
      companyId: 'comp-interactv',
      ownerId: 'demo-owner',
      shareToken: shareToken || 'demo-stele',
      title: 'interacTV Smart Station – 4K Messe- & Event-Paket',
      clientName: 'Messe-Verantwortlicher & Projektleitung',
      clientCompany: 'Aussteller AG • Swissbau / Fachmesse',
      clientEmail: 'messe@aussteller.ch',
      clientPhone: '+41 79 200 40 80',
      introText: 'Herzlichen Dank für Ihr Interesse an der interacTV Smart Station. Nachfolgend präsentieren wir Ihnen das modulare Konzept für Ihren Messeauftritt – mit Schweizer CAD-Präzisions-Chassis, flexibler Display-Wahl (BYOD oder 4K Touchscreen), interaktiver Lead-Erfassung und verbindlicher Kostenaufstellung.',
      heroVideoUrl: demoSmartProposal.heroVideoUrl,
      heroImageUrl: demoSmartProposal.heroImageUrl,
      basePrice: 2140,
      currency: 'CHF',
      options: [
        { id: 'opt-1', title: 'interacTV 4K PCAP Touchscreen 55"', description: 'Ultra HD IPS Commercial Display mit 10-Punkt PCAP Touchscreen betriebsbereit vorinstalliert', price: 561, selectedByDefault: true },
        { id: 'opt-2', title: 'NFC Lift & Learn Sensorik-Kit', description: 'USB-Sensorik mit 10x programmierbaren Produkt-Tags zur interaktiven Produkterklärung', price: 350, selectedByDefault: false },
        { id: 'opt-3', title: '3D WebGL Messestand Visualizer & Digital Twin', description: 'Interaktive Standansicht für Kunden & Web-Showroom vor Messebeginn', price: 450, selectedByDefault: false },
        { id: 'opt-4', title: 'All-Risk Messe- & Transportschutz (Vollkasko)', description: 'Umfassender Versicherungsschutz ohne Selbstbehalt während der gesamten Messe', price: 180, selectedByDefault: true }
      ],
      attachments: [
        { id: 'att-1', name: 'SIA_Messeofferte_Mietvertrag_2026.pdf', url: '/demo-assets/bau_grundriss_eg.pdf', size: '1.8 MB', type: 'pdf' },
        { id: 'att-2', name: 'CAD_Massblatt_Chassis_80cm.pdf', url: '/demo-assets/bau_grundriss_eg.pdf', size: '3.2 MB', type: 'plan' }
      ],
      legalDocuments: [
        { id: 'doc-1', name: 'SIA 118 Allgemeine Bedingungen für Messe- & Mietverträge', type: 'werkvertrag', url: '/demo-assets/bau_grundriss_eg.pdf', isRequired: true, uploadedAt: new Date().toISOString() },
        { id: 'doc-2', name: 'DSGVO / Schweizer DSG Datenschutzvereinbarung', type: 'agb', url: '/demo-assets/bau_grundriss_eg.pdf', isRequired: true, uploadedAt: new Date().toISOString() }
      ],
      paymentMilestones: [
        { id: 'm-1', phase: '1. Reservierung & Chassis-Bereitstellung', percentage: 50, description: 'Nach Auftragsbestätigung und Terminreservierung' },
        { id: 'm-2', phase: '2. Standanlieferung & Übergabe', percentage: 50, description: 'Nach Einweisung und erfolgreichem Probebetrieb vor Ort' }
      ],
      themeStyle: 'scenography',
      themeColor: '#0284C7',
      slides: [
        {
          id: 's1',
          title: '1. 60s Flightcase-Unboxing & Werkzeugloser Aufbau',
          content: 'Echter 60-Sekunden Zeitraffer-Beweis: 1 Person öffnet das Transport-Case und stellt die 4K Smart Station komplett ohne Werkzeug auf. Verdeckte Kabelführung und Schweizer Präzision.',
          layout: 'video-focus',
          videoUrl: demoSmartProposal.heroVideoUrl,
          imageUrl: demoSmartProposal.heroImageUrl
        },
        {
          id: 's2',
          title: '2. Formgefrästes Flightcase & CNC-Schaumstoff-Inlay',
          content: 'Sicherer Transport im massgeschneiderten CNC-Schaumstoff-Inlay. Maximale Flexibilität: Nutzen Sie Ihre eigenen Bildschirme via Universal VESA 200/400 Halterung oder zertifizierte 4K PCAP Multitouch-Displays (32" bis 98").',
          layout: 'split',
          imageUrl: demoSmartProposal.heroImageUrl
        },
        {
          id: 's3',
          title: '3. Kostenaufstellung & Schweizer SIA-Konditionen',
          layout: 'data-budget',
          dataPayload: {
            totalBudget: 2140,
            budgetGroups: [
              { pos: 'Pos. 1', title: 'interacTV Event Pro 80 Chassis (Ø 80cm Standfuss)', total: 561 },
              { pos: 'Pos. 2', title: 'Display-Lösung (4K Touchscreen / BYOD Montage)', total: 561 },
              { pos: 'Pos. 3', title: 'Lead PRO Software & Gamification-Lizenz', total: 490 },
              { pos: 'Pos. 4', title: 'Standplatz-Express-Logistik & 5-Minuten Aufbau', total: 450 },
              { pos: 'Pos. 5', title: 'Bexio / CRM Live-Sync Anbindung', total: 250 }
            ]
          }
        }
      ],
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  return {
    ...demoSmartProposal,
    projectId: shareToken || 'demo-1',
    shareToken: shareToken || 'demo-proposal',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}
