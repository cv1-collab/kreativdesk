import { j as jsxRuntimeExports, a5 as Send, a3 as FilePenLine, X, q as Calculator, aR as Cloud, T as Trash2, R as Plus, F as FileText, A as AnimatePresence, m as motion, bq as SquareCheckBig } from './vendor-ui-B7yEkTas.js';
import { r as reactExports, d as reactDomExports } from './vendor-core-egDwzlzP.js';
import { b as useProject, u as useLanguage, c as cn } from './index-CYJ5UA-3.js';
import { U as UniversalPDFStudio, D as Document, P as Page, V as View, T as Text, I as Image, S as StyleSheet } from './UniversalPDFStudio-_gQo83Zn.js';

const localTranslations = {
  de: {
    new_invoice: "Neue Rechnung",
    new_quote: "Neue Offerte",
    project_assignment: "Projekt-Zuweisung",
    invoice_no: "Rechnungs-Nr.",
    quote_no: "Offerten-Nr.",
    date: "Datum",
    location: "Ort",
    project_name: "Projektname",
    sender_studio: "Absender (Studio)",
    recipient_client: "Empfänger (Kunde)",
    invoice_positions: "Positionen",
    no_positions: "Keine Positionen erfasst.",
    payment_info: "Zahlungsinformationen / Schlusstext",
    subtotal: "Zwischentotal",
    vat: "MWST",
    total: "Total",
    import_budget: "Aus Budget importieren",
    budget_not_found: "Kein freigegebenes Budget für dieses Projekt gefunden.",
    select_all: "Alle auswählen",
    take_over_as_flat_rate: "Übernehmen",
    generate_pdf: "PDF Generieren & Vorschau",
    cancel: "Abbrechen",
    add_position: "Position hinzufügen"
  },
  en: {
    new_invoice: "New Invoice",
    new_quote: "New Quote",
    project_assignment: "Project Assignment",
    invoice_no: "Invoice No.",
    quote_no: "Quote No.",
    date: "Date",
    location: "Location",
    project_name: "Project Name",
    sender_studio: "Sender (Studio)",
    recipient_client: "Recipient (Client)",
    invoice_positions: "Positions",
    no_positions: "No positions added.",
    payment_info: "Payment Information / Footer Text",
    subtotal: "Subtotal",
    vat: "VAT",
    total: "Total",
    import_budget: "Import from Budget",
    budget_not_found: "No approved budget found for this project.",
    select_all: "Select All",
    take_over_as_flat_rate: "Take Over",
    generate_pdf: "Generate PDF & Preview",
    cancel: "Cancel",
    add_position: "Add Position"
  }
};
const formatCHF = (val) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
const pdfStyles = StyleSheet.create({
  page: { padding: "15mm", fontFamily: "Helvetica", fontSize: 10, color: "#374151", backgroundColor: "#ffffff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  senderText: { fontSize: 8, color: "#6b7280", borderBottomWidth: 1, borderBottomColor: "#d1d5db", paddingBottom: 4, marginBottom: 8, width: 250 },
  recipientText: { fontSize: 11, color: "#000000", lineHeight: 1.4 },
  metaTable: { width: 200 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  metaLabel: { fontSize: 9, color: "#6b7280", marginRight: 10 },
  metaValue: { fontSize: 9, color: "#000000", fontWeight: "bold", width: 120, textAlign: "right" },
  title: { fontSize: 24, fontWeight: "bold", textTransform: "uppercase", marginBottom: 20, letterSpacing: 2 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#000000", paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 8 },
  col1: { width: "10%" },
  // Pos
  col2: { width: "45%", paddingRight: 10 },
  // Bezeichnung
  col3: { width: "15%", textAlign: "right" },
  // Menge
  col4: { width: "15%", textAlign: "right" },
  // Preis
  col5: { width: "15%", textAlign: "right" },
  // Total
  textBold: { fontWeight: "bold", color: "#000000" },
  textMuted: { color: "#6b7280", fontSize: 9, marginTop: 3 },
  totalsContainer: { alignItems: "flex-end", marginTop: 15 },
  totalsRow: { flexDirection: "row", width: 220, justifyContent: "space-between", paddingVertical: 4 },
  totalsTotalRow: { flexDirection: "row", width: 220, justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 2, borderTopColor: "#000000", marginTop: 4 },
  totalsText: { color: "#4b5563", fontSize: 10 },
  paymentInfo: { marginTop: 40, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 15, fontSize: 9, color: "#4b5563", lineHeight: 1.5 },
  logo: { width: 120, height: 40, objectFit: "contain", position: "absolute", top: 0, right: 0 }
});
const InvoicePDFDocument = ({ settings, type, formData, positions, subtotal, vatAmount, total, formatCHF: formatCHF2, t }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Document, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page, { size: settings.format, orientation: settings.orientation, style: pdfStyles.page, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.headerRow, fixed: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.senderText, children: formData.sender.replace(/\n/g, " • ") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.recipientText, children: formData.recipient })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaTable, children: [
      settings.logo && /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { src: settings.logo, style: [pdfStyles.logo, { position: "relative", marginBottom: 15, alignSelf: "flex-end" }] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaLabel, children: type === "invoice" ? "Rechnungs-Nr:" : "Offerten-Nr:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: formData.invoiceNumber })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaLabel, children: "Datum:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: new Date(formData.date).toLocaleDateString("de-CH") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaLabel, children: "Ort:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: formData.location })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaLabel, children: "Projekt:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: formData.projectName })
      ] })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.title, { color: settings.accentColor }], children: type === "invoice" ? "RECHNUNG" : "OFFERTE" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.tableHeader, fixed: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, pdfStyles.textBold], children: "Pos" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col2, pdfStyles.textBold], children: "Bezeichnung" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col3, pdfStyles.textBold], children: "Menge" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col4, pdfStyles.textBold], children: "Preis" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col5, pdfStyles.textBold], children: "Total (CHF)" })
  ] }),
  positions.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.tableRow, wrap: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, pdfStyles.textBold, { color: settings.accentColor }], children: item.pos }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.col2, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.textBold, children: item.title }),
      item.description && /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.textMuted, children: item.description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles.col3, { color: "#000000" }], children: [
      item.qty,
      " ",
      item.unit
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col4, { color: "#000000" }], children: formatCHF2(item.unitPrice) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col5, pdfStyles.textBold], children: formatCHF2(item.qty * item.unitPrice) })
  ] }, idx)),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.totalsContainer, wrap: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.totalsRow, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.totalsText, children: t("subtotal") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.textBold, children: formatCHF2(subtotal) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.totalsRow, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles.totalsText, children: [
        t("vat"),
        " ",
        formData.vatRate,
        "%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.textBold, children: formatCHF2(vatAmount) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.totalsTotalRow, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.textBold, { fontSize: 12 }], children: t("total").toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.textBold, { fontSize: 12, color: settings.accentColor }], children: formatCHF2(total) })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: pdfStyles.paymentInfo, wrap: false, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: formData.paymentInfo }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: { position: "absolute", bottom: "10mm", left: "15mm", right: "15mm", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 5 }, fixed: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: 7, color: "#9ca3af" }, children: settings.footerText }) })
] }) });
function InvoiceStudio({ onClose, onSave, budgetGroups = [], type = "invoice" }) {
  const { projects = [] } = useProject();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const [isMounted, setIsMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setIsMounted(true);
  }, []);
  const [activeProjectId, setActiveProjectId] = reactExports.useState("global");
  const [formData, setFormData] = reactExports.useState({
    invoiceNumber: type === "invoice" ? `RE-${Date.now().toString().slice(-6)}` : `OFF-${Date.now().toString().slice(-6)}`,
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    location: "Zürich",
    projectName: "Neues Projekt",
    sender: "Kreativ-Desk Studio\nBahnhofstrasse 1\n8001 Zürich",
    recipient: "Kunden Name\nMusterstrasse 12\n8000 Zürich",
    paymentInfo: type === "invoice" ? "Bitte überweisen Sie den Betrag innerhalb von 30 Tagen auf folgendes Konto:\nIBAN: CH00 0000 0000 0000 0000 0\nBank: Musterbank AG" : "Wir freuen uns auf Ihre Auftragserteilung.\nGültigkeit der Offerte: 30 Tage",
    vatRate: 8.1
  });
  const [positions, setPositions] = reactExports.useState([{ id: "pos1", pos: "1.0", title: "Planungshonorar", description: "Pauschal gemäss Absprache", qty: 1, unit: "Pauschal", unitPrice: 0, total: 0 }]);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = reactExports.useState(false);
  const [showBudgetImport, setShowBudgetImport] = reactExports.useState(false);
  const [selectedBudgetIds, setSelectedBudgetIds] = reactExports.useState([]);
  const calculateSubtotal = () => positions.reduce((sum, p) => sum + p.qty * p.unitPrice, 0);
  const subtotal = calculateSubtotal();
  const vatAmount = subtotal * (formData.vatRate / 100);
  const total = subtotal + vatAmount;
  const executeBudgetImport = () => {
    if (!budgetGroups || budgetGroups.length === 0) return;
    const importedPositions = budgetGroups.filter((g) => selectedBudgetIds.includes(g.id)).map((g) => ({
      id: `pos_${Date.now()}_${g.id}`,
      pos: g.pos,
      title: g.title,
      description: "Pauschal gemäss freigegebenem Budget",
      qty: 1,
      unit: "Pauschal",
      unitPrice: g.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0,
      total: g.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0
    }));
    setPositions([...positions.filter((p) => p.unitPrice > 0), ...importedPositions]);
    setShowBudgetImport(false);
  };
  const handleSaveToCloud = async (blob) => {
    const fileName = `${type === "invoice" ? "RE" : "OFF"}_${formData.invoiceNumber}_${Date.now()}.pdf`;
    const fileData = {
      file: blob,
      fileName,
      total,
      clientName: formData.recipient.split("\n")[0] || "Kunde",
      invoiceNumber: formData.invoiceNumber,
      budgetPosId: "",
      type
    };
    onSave(fileData);
  };
  if (!isMounted) return null;
  return reactDomExports.createPortal(
    /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[90000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background w-full h-[100dvh] md:h-[95vh] md:max-h-[900px] md:rounded-2xl shadow-2xl max-w-4xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-b border-border/50 bg-surface/90 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold tracking-tight text-text-primary flex items-center gap-2", children: [
            type === "invoice" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FilePenLine, { className: "text-blue-500" }),
            type === "invoice" ? t("new_invoice") : t("new_quote")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar pb-32", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-xl p-4 space-y-4 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: t("project_assignment") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: activeProjectId, onChange: (e) => setActiveProjectId(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 outline-none text-sm font-bold text-text-primary cursor-pointer transition-colors focus:border-accent-ai", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "global", children: "Kein Projekt (Global)" }),
                projects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.name }, p.id))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: type === "invoice" ? t("invoice_no") : t("quote_no") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: formData.invoiceNumber, onChange: (e) => setFormData({ ...formData, invoiceNumber: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 outline-none text-sm font-bold text-text-primary focus:border-accent-ai transition-colors" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: t("date") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: formData.date, onChange: (e) => setFormData({ ...formData, date: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 outline-none text-sm font-bold text-text-primary focus:border-accent-ai transition-colors" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: t("location") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 outline-none text-sm font-medium text-text-primary focus:border-accent-ai transition-colors" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: t("project_name") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: formData.projectName, onChange: (e) => setFormData({ ...formData, projectName: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 outline-none text-sm font-bold text-text-primary focus:border-accent-ai transition-colors" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted tracking-widest", children: t("sender_studio") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: formData.sender, onChange: (e) => setFormData({ ...formData, sender: e.target.value }), rows: 4, className: "w-full bg-surface border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent-ai transition-colors text-sm font-medium text-text-primary resize-none shadow-sm custom-scrollbar" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted tracking-widest", children: t("recipient_client") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: formData.recipient, onChange: (e) => setFormData({ ...formData, recipient: e.target.value }), rows: 4, className: "w-full bg-surface border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent-ai transition-colors text-sm font-bold text-text-primary resize-none shadow-sm custom-scrollbar" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 14 }),
                " ",
                t("invoice_positions")
              ] }),
              budgetGroups && budgetGroups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowBudgetImport(true), className: "text-[10px] font-bold bg-accent-ai/10 text-accent-ai px-3 py-1.5 rounded-full border border-accent-ai/20 hover:bg-accent-ai/20 transition-colors flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { size: 12 }),
                " ",
                t("import_budget")
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              positions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 border border-dashed border-border/50 rounded-xl text-text-muted text-sm", children: t("no_positions") }),
              positions.map((pos, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface p-4 rounded-xl border border-border/50 shadow-sm relative flex flex-col gap-3 group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPositions(positions.filter((_, i) => i !== index)), className: "absolute top-3 right-3 text-text-muted hover:text-red-500 bg-background p-1.5 rounded border border-border/50 transition-colors opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 md:grid-cols-12 gap-3 pr-8", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-1 md:col-span-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: "Pos" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: pos.pos, onChange: (e) => {
                      const newP = [...positions];
                      newP[index].pos = e.target.value;
                      setPositions(newP);
                    }, className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-bold text-text-primary focus:border-accent-ai transition-colors" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 md:col-span-10", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: "Titel" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: pos.title, onChange: (e) => {
                      const newP = [...positions];
                      newP[index].title = e.target.value;
                      setPositions(newP);
                    }, className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-bold text-text-primary focus:border-accent-ai transition-colors" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: "Beschreibung" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: pos.description, onChange: (e) => {
                    const newP = [...positions];
                    newP[index].description = e.target.value;
                    setPositions(newP);
                  }, className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-medium text-text-primary focus:border-accent-ai transition-colors" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 border-t border-border/50 pt-3 mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: "Menge" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: pos.qty || "", onChange: (e) => {
                      const newP = [...positions];
                      newP[index].qty = parseFloat(e.target.value);
                      setPositions(newP);
                    }, className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-bold text-text-primary text-center focus:border-accent-ai transition-colors" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: "Einh." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: pos.unit, onChange: (e) => {
                      const newP = [...positions];
                      newP[index].unit = e.target.value;
                      setPositions(newP);
                    }, className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-bold text-text-primary text-center focus:border-accent-ai transition-colors" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted block mb-1", children: "Preis (CHF)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: pos.unitPrice || "", onChange: (e) => {
                      const newP = [...positions];
                      newP[index].unitPrice = parseFloat(e.target.value);
                      setPositions(newP);
                    }, className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-bold text-blue-500 text-right focus:border-accent-ai transition-colors" })
                  ] })
                ] })
              ] }, pos.id))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPositions([...positions, { id: `pos_${Date.now()}`, pos: `${positions.length + 1}.0`, title: "", description: "", qty: 1, unit: "Stk.", unitPrice: 0, total: 0 }]), className: "w-full py-3 bg-blue-500/5 text-blue-500 border border-dashed border-blue-500/30 rounded-xl text-sm font-bold hover:bg-blue-500/10 flex items-center justify-center gap-2 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
              " ",
              t("add_position")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-px bg-border/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase font-bold text-text-muted tracking-widest", children: t("payment_info") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: formData.paymentInfo, onChange: (e) => setFormData({ ...formData, paymentInfo: e.target.value }), rows: 3, className: "w-full bg-surface border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent-ai transition-colors text-sm font-medium text-text-primary resize-none shadow-sm custom-scrollbar" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-xl p-4 space-y-3 shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted font-bold uppercase", children: t("subtotal") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-text-primary", children: [
                  "CHF ",
                  formatCHF(subtotal)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-sm border-t border-border/50 pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-muted font-bold uppercase flex items-center gap-2", children: [
                  t("vat"),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: formData.vatRate, onChange: (e) => setFormData({ ...formData, vatRate: Number(e.target.value) }), className: "w-16 bg-background border border-border/50 rounded px-2 py-1 text-center outline-none text-text-primary focus:border-accent-ai transition-colors" }),
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-text-muted", children: [
                  "CHF ",
                  formatCHF(vatAmount)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-lg border-t-2 border-border pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold uppercase text-text-primary", children: t("total") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-blue-500", children: [
                  "CHF ",
                  formatCHF(total)
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-t border-border bg-surface/90 backdrop-blur-md flex flex-col md:flex-row justify-end gap-3 sticky bottom-0 z-30 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "px-6 py-3 text-sm font-bold text-text-muted hover:text-text-primary transition-colors border border-border md:border-transparent rounded-lg w-full md:w-auto", children: t("cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsPdfStudioOpen(true), className: "w-full md:w-auto px-8 py-3 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-all flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 18 }),
            " ",
            t("generate_pdf")
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showBudgetImport && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[90010] flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-b border-border/50 flex justify-between items-center bg-surface/90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-lg text-text-primary flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { className: "text-blue-500" }),
            " ",
            t("import_budget")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowBudgetImport(false), className: "text-text-muted hover:text-text-primary bg-background p-2 rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 overflow-y-auto space-y-3 custom-scrollbar", children: budgetGroups.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-text-muted font-medium", children: t("budget_not_found") }) : budgetGroups.map((g) => {
          const groupTotal = g.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: cn("flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors", selectedBudgetIds.includes(g.id) ? "bg-blue-500/10 border-blue-500/30" : "bg-background border-border/50 hover:border-blue-500/30"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: selectedBudgetIds.includes(g.id), onChange: (e) => {
              if (e.target.checked) setSelectedBudgetIds([...selectedBudgetIds, g.id]);
              else setSelectedBudgetIds(selectedBudgetIds.filter((id) => id !== g.id));
            }, className: "w-5 h-5 rounded border-border text-blue-500 focus:ring-blue-500 bg-background cursor-pointer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-text-primary text-sm", children: [
                g.pos,
                " ",
                g.title
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-blue-500 text-lg", children: [
                "CHF ",
                formatCHF(groupTotal)
              ] })
            ] })
          ] }, g.id);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-t border-border/50 flex justify-between items-center bg-surface/80", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedBudgetIds(budgetGroups.map((g) => g.id)), className: "text-sm font-bold text-blue-500 flex items-center gap-2 hover:underline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { size: 18 }),
            " ",
            t("select_all")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: executeBudgetImport, disabled: selectedBudgetIds.length === 0, className: "px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50", children: t("take_over_as_flat_rate") })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        UniversalPDFStudio,
        {
          isOpen: isPdfStudioOpen,
          onClose: () => setIsPdfStudioOpen(false),
          title: type === "invoice" ? "Rechnung" : "Offerte",
          fileName: formData.invoiceNumber,
          onSaveCloud: handleSaveToCloud,
          children: (settings) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            InvoicePDFDocument,
            {
              settings,
              type,
              formData,
              positions,
              subtotal,
              vatAmount,
              total,
              formatCHF,
              t
            }
          )
        }
      )
    ] }),
    document.body
  );
}

export { InvoiceStudio as I };
