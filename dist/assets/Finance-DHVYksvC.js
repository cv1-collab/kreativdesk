import { j as jsxRuntimeExports, a2 as RotateCw, X, T as Trash2, R as Plus, F as FileText, m as motion, D as DollarSign, K as Clock, a3 as FilePenLine, a4 as Receipt, a5 as Send, a1 as ChartPie, q as Calculator, a6 as ClipboardList, a7 as CalendarDays, a8 as Copy, a9 as ArrowUpRight, aa as ArrowDownRight, _ as TrendingUp, a as CircleAlert, L as LoaderCircle, e as Camera, ab as Image, A as AnimatePresence } from './vendor-ui-B7yEkTas.js';
import { u as useNavigate, h as useParams, r as reactExports, d as reactDomExports, R as React } from './vendor-core-egDwzlzP.js';
import { Q as QRCode } from './index-D-M1Przd.js';
import { a as useAuth, g as useToast, u as useLanguage, d as useTheme, b as useProject, f as db, c as cn, s as storage } from './index-CYJ5UA-3.js';
import { c as getFunctions, E as getApp, q as query, k as where, j as collection, m as onSnapshot, f as getDoc, e as doc, s as setDoc, n as deleteDoc, F as httpsCallable, B as ref, C as uploadBytes, D as getDownloadURL, z as addDoc } from './vendor-firebase-CKkb2kaw.js';
import { I as InvoiceStudio } from './InvoiceStudio-B_yWYbKw.js';
import { U as UniversalPDFStudio, D as Document, P as Page, V as View, T as Text, I as Image$1, S as StyleSheet } from './UniversalPDFStudio-_gQo83Zn.js';
import { R as ResponsiveContainer, P as PieChart, a as Pie, C as Cell, T as Tooltip, B as BarChart, b as CartesianGrid, X as XAxis, Y as YAxis, L as Legend, c as Bar } from './vendor-charts-DTz6AAsj.js';
import './vendor-3d-BeyKjty-.js';
import './browser-Q9GXpAvt.js';

if (typeof window !== "undefined" && typeof window.Buffer === "undefined") {
  window.Buffer = { from: () => new Uint8Array(), isBuffer: () => false };
}
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
const localTranslations = {
  de: { finance_budget: "Finanzen & Budget", overview: "Übersicht", budget_plan: "Budgetplan", payment_control: "Zahlungskontrolle", cashflow: "Cashflow & Hauptbuch", all_time: "Gesamte Zeit", this_year: "Dieses Jahr", this_month: "Dieser Monat", today: "Heute", book_hours: "Stunden erfassen", quote: "Offerte", receipt: "Beleg", invoice: "Rechnung", planned: "Geplant", actual_costs: "Ist-Kosten", variance: "Abweichung", pos: "Pos", description: "Beschreibung", qty: "Menge", unit: "Einh.", unit_price: "EP", total: "Total", subtotal: "Zwischentotal", vat: "MWST", total_amount: "Bruttobetrag", budget_supplement: "Nachtrag", internal_hours_time_tracking: "Interne Stunden", date: "Datum", budget_assignment: "Budget-Zuweisung", credit_revenue: "Haben (Umsatz)", debit_costs: "Soll (Kosten)", balance_profit: "Saldo", free_booking: "Freie Buchung", status: "Status", open: "Offen", paid: "Bezahlt", draft: "Entwurf", no_bookings_period: "Keine Buchungen.", book_costs: "Kosten verbuchen", cancel: "Abbrechen", take_photo: "Foto aufnehmen", receipts_photos: "Belege / Fotos", amount_chf: "Betrag (CHF)", vendor_company: "Firma", project: "Projekt", book_receipt: "Beleg erfassen", new_project: "Neues Projekt", client: "Kunde", new_variant: "Neue Variante", duplicate_variant: "Duplizieren", delete_variant: "Löschen", approve: "Freigeben", approve_revoke: "Freigabe widerrufen", approved: "Freigegeben", add_position: "Position hinzufügen", new_phase: "Neue Phase", status_updated: "Status aktualisiert", update_error: "Fehler", delete_confirm: "Wirklich löschen?", booking_deleted: "Gelöscht", delete_error: "Fehler beim Löschen", hours_deleted: "Stunden gelöscht", new_variant_created: "Variante erstellt", variant_duplicated: "Dupliziert", min_one_variant: "Min. eine Variante", cant_delete_approved: "Freigegebene können nicht gelöscht werden", variant_deleted: "Gelöscht", revoke_confirm: "Freigabe widerrufen?", approve_confirm: "Freigeben?", approval_revoked: "Widerrufen", budget_approved: "Freigegeben", analyzing_ai: "KI analysiert...", ai_failed: "KI Fehler", receipt_live_received: "Beleg erkannt!", project_profit: "Projectgewinn", revenue: "Umsatz", costs: "Kosten", total_budget: "Gesamtbudget", budget_utilization: "Budget Auslastung", spent: "Ausgegeben", no_budget_present: "Kein Budget vorhanden", planned_vs_actual: "Soll vs Ist", payment_control_inactive: "Zahlungskontrolle Inaktiv", payment_control_inactive_desc: "Gib ein Budget frei", total_project_excl_vat: "Total Projekt (exkl. MwSt)", external_costs: "Externe Kosten", invoices_total: "Rechnungen Total", expenses_team: "Spesen", ext_costs: "Externe Kosten", open_quotes: "Offene Offerten", quotes: "Offerten", outgoing_invoices: "Rechnungen", expenses: "Spesen", no_entries: "Keine Einträge", simple_internal: "Einfach (Intern)", detailed_external: "Detailliert (Extern)", generate_pdf_book: "PDF generieren & verbuchen", rotate: "Tabelle zeigen" },
  en: { finance_budget: "Finance & Budget", overview: "Overview", budget_plan: "Budget Plan", payment_control: "Payment Control", cashflow: "Cashflow & Ledger", all_time: "All Time", this_year: "This Year", this_month: "This Month", today: "Today", book_hours: "Book Hours", quote: "Quote", receipt: "Receipt", invoice: "Invoice", planned: "Planned", actual_costs: "Actual Costs", variance: "Variance", pos: "Pos", description: "Description", qty: "Qty", unit: "Unit", unit_price: "Unit Price", total: "Total", subtotal: "Subtotal", vat: "VAT", total_amount: "Total Amount", budget_supplement: "Supplement", internal_hours_time_tracking: "Internal Hours", date: "Date", budget_assignment: "Budget Assignment", credit_revenue: "Credit (Revenue)", debit_costs: "Debit (Costs)", balance_profit: "Balance", free_booking: "Free Booking", status: "Status", open: "Open", paid: "Paid", draft: "Draft", no_bookings_period: "No bookings.", book_costs: "Book Costs", cancel: "Cancel", take_photo: "Take Photo", receipts_photos: "Receipts / Photos", amount_chf: "Amount (CHF)", vendor_company: "Company", project: "Project", book_receipt: "Book Receipt", new_project: "New Project", client: "Client", new_variant: "New Variant", duplicate_variant: "Duplicate", delete_variant: "Delete", approve: "Approve", approve_revoke: "Revoke", approved: "Approved", add_position: "Add Pos", new_phase: "New Phase", status_updated: "Status updated", update_error: "Error", delete_confirm: "Delete?", booking_deleted: "Deleted", delete_error: "Error", hours_deleted: "Hours deleted", new_variant_created: "Variant created", variant_duplicated: "Duplicated", min_one_variant: "Min 1 variant", cant_delete_approved: "Cant delete approved", variant_deleted: "Deleted", revoke_confirm: "Revoke?", approve_confirm: "Approve?", approval_revoked: "Revoked", budget_approved: "Approved", analyzing_ai: "AI analyzing...", ai_failed: "AI Failed", receipt_live_received: "Receipt recognized!", project_profit: "Project Profit", revenue: "Revenue", costs: "Costs", total_budget: "Total Budget", budget_utilization: "Budget Utilization", spent: "Spent", no_budget_present: "No budget", planned_vs_actual: "Planned vs Actual", payment_control_inactive: "Payment Control Inactive", payment_control_inactive_desc: "Approve a budget", total_project_excl_vat: "Total Project (excl. VAT)", external_costs: "External Costs", invoices_total: "Invoices Total", expenses_team: "Expenses", ext_costs: "Ext. Costs", open_quotes: "Open Quotes", quotes: "Quotes", outgoing_invoices: "Invoices", expenses: "Expenses", no_entries: "No entries", simple_internal: "Simple (Internal)", detailed_external: "Detailed (External)", generate_pdf_book: "Generate PDF & Book", rotate: "Show Table" }
};
const numberInputClass = "bg-transparent outline-none w-full text-right focus:border-b focus:border-accent-ai/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#374151", backgroundColor: "#ffffff" },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, paddingBottom: 10, marginBottom: 20 },
  headerLeft: { flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000000", textTransform: "uppercase", marginBottom: 8 },
  metaGrid: { flexDirection: "row", gap: 20 },
  metaBlock: { flexDirection: "column" },
  metaLabel: { fontSize: 8, color: "#6b7280", textTransform: "uppercase" },
  metaValue: { fontSize: 12, color: "#000000", fontWeight: "bold" },
  logo: { width: 120, height: 40, objectFit: "contain" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#d1d5db", paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 6 },
  groupRow: { flexDirection: "row", backgroundColor: "#f9fafb", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#e5e7eb", paddingVertical: 8, marginTop: 10 },
  hrRow: { flexDirection: "row", backgroundColor: "#fff7ed", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#fdba74", paddingVertical: 6, marginTop: 5 },
  col1: { width: "10%" },
  col2: { width: "40%", paddingRight: 10 },
  col3: { width: "10%", textAlign: "right" },
  col4: { width: "10%", paddingLeft: 10 },
  col5: { width: "15%", textAlign: "right" },
  col6: { width: "15%", textAlign: "right" },
  textBold: { fontWeight: "bold", color: "#000000" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 10 },
  footerText: { fontSize: 8, color: "#9ca3af" }
});
const FinancePDFDocument = ({ settings, activeTab, t, projectHeader, budgetGroups, approvedVersions, allTimeHours, allTimeHoursCost, displayLedger, getBudgetDetails, overviewTotalBudget, totalActualCostsIncludingHoursAllTime, totalBudget, vatRate, formatCHF, calculateGroupTotal, getAllTimeActualCostForGroup, getAllTimeActualCostForItem }) => {
  const title = activeTab === "budget" ? t("budget_plan") : activeTab === "control" ? t("payment_control") : t("cashflow");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Document, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page, { size: settings.format, orientation: settings.orientation, style: pdfStyles.page, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }], fixed: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.headerLeft, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.title, children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaGrid, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaBlock, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaLabel, children: "Projekt:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: projectHeader.project })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaBlock, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaLabel, children: "Version:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: projectHeader.version })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaBlock, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaLabel, children: "Datum:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: new Date(projectHeader.date).toLocaleDateString("de-CH") })
          ] })
        ] })
      ] }),
      settings.logo && /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { src: settings.logo, style: pdfStyles.logo })
    ] }),
    activeTab === "budget" && /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.tableHeader, fixed: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, pdfStyles.textBold], children: t("pos") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col2, pdfStyles.textBold], children: t("description") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col3, pdfStyles.textBold], children: t("qty") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col4, pdfStyles.textBold], children: t("unit") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col5, pdfStyles.textBold], children: t("unit_price") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col6, pdfStyles.textBold], children: t("total") })
      ] }),
      budgetGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.groupRow, wrap: false, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, pdfStyles.textBold, { color: settings.accentColor }], children: group.pos }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col2, pdfStyles.textBold, { color: settings.accentColor }], children: group.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.col3 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.col4 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.col5 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col6, pdfStyles.textBold, { color: settings.accentColor }], children: formatCHF(calculateGroupTotal(group)) })
        ] }),
        group.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.tableRow, wrap: false, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, { fontSize: 8, color: "#6b7280" }], children: item.pos }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col2, pdfStyles.textBold], children: item.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.col3, children: item.qty }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.col4, children: item.unit }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.col5, children: formatCHF(item.unitPrice) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col6, pdfStyles.textBold], children: formatCHF(item.total) })
        ] }, item.id))
      ] }, group.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { marginTop: 20, alignItems: "flex-end" }, wrap: false, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { flexDirection: "row", width: 200, justifyContent: "space-between", marginBottom: 5 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { children: t("subtotal") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.textBold, children: formatCHF(totalBudget) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { flexDirection: "row", width: 200, justifyContent: "space-between", marginBottom: 5 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { children: [
            t("vat"),
            " ",
            vatRate,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.textBold, children: formatCHF(totalBudget * (vatRate / 100)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { flexDirection: "row", width: 200, justifyContent: "space-between", borderTopWidth: 1, borderColor: "#d1d5db", paddingTop: 5, marginTop: 5 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.textBold, { color: settings.accentColor, fontSize: 12 }], children: t("total_amount").toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.textBold, { color: settings.accentColor, fontSize: 12 }], children: formatCHF(totalBudget * (1 + vatRate / 100)) })
        ] })
      ] })
    ] }),
    activeTab === "control" && /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.tableHeader, fixed: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, pdfStyles.textBold], children: t("pos") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col2, pdfStyles.textBold], children: t("description") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col5, pdfStyles.textBold], children: t("planned") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col6, pdfStyles.textBold, { color: "#ef4444" }], children: t("actual_costs") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col6, pdfStyles.textBold], children: t("variance") })
      ] }),
      approvedVersions.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: [{ backgroundColor: "#e5e7eb", paddingVertical: 5, marginTop: 5 }], wrap: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase", paddingLeft: 5 }, children: [
          t("budget_supplement"),
          " ",
          v.name
        ] }) }),
        v.groups.map((g) => {
          const plan = calculateGroupTotal(g);
          const actual = getAllTimeActualCostForGroup(g);
          const diff = plan - actual;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.groupRow, wrap: false, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, pdfStyles.textBold, { color: settings.accentColor }], children: g.pos }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col2, pdfStyles.textBold, { color: settings.accentColor }], children: g.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col5, pdfStyles.textBold], children: formatCHF(plan) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col6, pdfStyles.textBold, { color: "#ef4444" }], children: formatCHF(actual) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles.col6, pdfStyles.textBold, { color: diff < 0 ? "#ef4444" : "#10b981" }], children: [
                diff >= 0 ? "+" : "",
                formatCHF(diff)
              ] })
            ] }),
            g.items.map((i) => {
              const itemActual = getAllTimeActualCostForItem(i.id);
              const itemDiff = i.total - itemActual;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.tableRow, wrap: false, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, { fontSize: 8, color: "#6b7280" }], children: i.pos }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col2, pdfStyles.textBold], children: i.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.col5, children: formatCHF(i.total) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col6, { color: "#ef4444" }], children: itemActual > 0 ? formatCHF(itemActual) : "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles.col6, pdfStyles.textBold, { color: itemDiff < 0 ? "#ef4444" : "#10b981" }], children: [
                  itemDiff >= 0 ? "+" : "",
                  formatCHF(itemDiff)
                ] })
              ] }, i.id);
            })
          ] }, g.id);
        })
      ] }, v.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.hrRow, wrap: false, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, pdfStyles.textBold, { color: "#ea580c" }], children: "HR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles.col2, pdfStyles.textBold, { color: "#ea580c" }], children: [
          t("internal_hours_time_tracking"),
          " (",
          allTimeHours,
          " h)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.col5, children: "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col6, pdfStyles.textBold, { color: "#ef4444" }], children: formatCHF(allTimeHoursCost) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles.col6, pdfStyles.textBold, { color: "#ef4444" }], children: [
          "-",
          formatCHF(allTimeHoursCost)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: { marginTop: 20, alignItems: "flex-end" }, wrap: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { flexDirection: "row", width: 350, justifyContent: "space-between", borderTopWidth: 2, borderColor: "#9ca3af", paddingTop: 8, marginTop: 5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.textBold, { fontSize: 12 }], children: t("total_project_excl_vat") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { flexDirection: "row", gap: 15 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.textBold, { fontSize: 12 }], children: formatCHF(overviewTotalBudget) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.textBold, { fontSize: 12, color: "#ef4444" }], children: formatCHF(totalActualCostsIncludingHoursAllTime) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles.textBold, { fontSize: 12, color: overviewTotalBudget - totalActualCostsIncludingHoursAllTime < 0 ? "#ef4444" : "#10b981" }], children: [
            overviewTotalBudget - totalActualCostsIncludingHoursAllTime >= 0 ? "+" : "",
            formatCHF(overviewTotalBudget - totalActualCostsIncludingHoursAllTime)
          ] })
        ] })
      ] }) })
    ] }),
    activeTab === "cashflow" && /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.tableHeader, fixed: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, pdfStyles.textBold, { width: "15%" }], children: t("date") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col2, pdfStyles.textBold, { width: "35%" }], children: t("description") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col5, pdfStyles.textBold, { width: "20%", textAlign: "left" }], children: t("budget_assignment") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col4, pdfStyles.textBold, { textAlign: "right" }], children: "Haben" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col4, pdfStyles.textBold, { textAlign: "right" }], children: "Soll" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col4, pdfStyles.textBold, { textAlign: "right" }], children: "Saldo" })
      ] }),
      displayLedger.map((tx) => {
        const isQuote = tx.category === "Offerte" || tx.category === "Quote";
        const isTime = !!tx.isTimeEntry;
        const isRevenue = tx.category === "Debitorenrechnung" || tx.category === "Outgoing Invoice" || !isQuote && !isTime && tx.amount > 0;
        const displayAmount = tx.amount === 0 ? 0 : Math.abs(tx.amount);
        const bdDetails = getBudgetDetails(tx.budgetPosId);
        const isBalanceNegative = 0 > tx.balance;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.tableRow, wrap: false, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [{ width: "15%", color: "#6b7280" }], children: tx.date }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [{ width: "35%" }, pdfStyles.textBold], children: tx.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [{ width: "20%", color: "#6b7280" }], children: bdDetails ? `${bdDetails.phase} - ${bdDetails.item}` : t("free_booking") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [{ width: "10%", textAlign: "right" }, pdfStyles.textBold, { color: "#10b981" }], children: isQuote ? `(${formatCHF(displayAmount)})` : isRevenue && displayAmount > 0 ? `+${formatCHF(displayAmount)}` : "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [{ width: "10%", textAlign: "right" }, pdfStyles.textBold, { color: "#ef4444" }], children: !isQuote && !isRevenue && displayAmount > 0 ? `-${formatCHF(displayAmount)}` : "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [{ width: "10%", textAlign: "right" }, pdfStyles.textBold, { color: isQuote ? "#9ca3af" : isBalanceNegative ? "#ef4444" : "#10b981" }], children: isQuote ? "-" : formatCHF(tx.balance) })
        ] }, tx.id);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.footer, fixed: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.footerText, children: settings.footerText }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.footerText, render: ({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}` })
    ] })
  ] }) });
};
const ReceiptPDFDocument = ({ settings, incomingData, incomingReceipts, formatCHF, projectHeader, budgetDetails, receiptType }) => {
  const isExternal = incomingData.type === "external";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Document, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page, { size: settings.format, orientation: settings.orientation, style: pdfStyles.page, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }], fixed: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.headerLeft, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.title, { color: settings.accentColor }], children: "BUCHUNG" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: 12, fontWeight: "bold", color: "#6b7280", textTransform: "uppercase" }, children: receiptType === "external_cost" ? "EXTERNER BELEG" : "SPESEN BELEG" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { textAlign: "right", alignItems: "flex-end" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: { fontSize: 9, color: "#6b7280", marginBottom: 2 }, children: [
          "Datum: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { color: "#000", fontWeight: "bold" }, children: new Date(incomingData.date).toLocaleDateString("de-CH") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: { fontSize: 9, color: "#6b7280", marginBottom: 2 }, children: [
          "Projekt: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { color: "#000", fontWeight: "bold" }, children: projectHeader.project })
        ] }),
        budgetDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: { fontSize: 9, color: "#6b7280" }, children: [
          "Zuweisung: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { color: "#000", fontWeight: "bold" }, children: budgetDetails.phase })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", paddingBottom: 5, marginBottom: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { width: "40%", fontWeight: "bold" }, children: "Firma / Kreditor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { width: "40%", fontWeight: "bold" }, children: "Beschreibung" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { width: "20%", fontWeight: "bold", textAlign: "right" }, children: "Betrag (CHF)" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { width: "40%" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { backgroundColor: "#f3f4f6", color: "#4b5563", padding: 4, fontWeight: "bold", fontSize: 8 }, children: incomingData.vendor || incomingData.company || "Firma" }),
        isExternal && incomingData.firstName && /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: { fontSize: 8, color: "#6b7280", marginTop: 4 }, children: [
          incomingData.firstName,
          " ",
          incomingData.lastName
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { width: "40%" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontWeight: "bold" }, children: incomingData.description || "-" }),
        budgetDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: { fontSize: 8, color: "#6b7280", marginTop: 2 }, children: [
          "Pos: ",
          budgetDetails.item
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { width: "20%", textAlign: "right", fontWeight: "bold", color: settings.accentColor, fontSize: 12 }, children: formatCHF(Number(incomingData.amount)) })
    ] }),
    incomingReceipts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: { marginTop: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: 12, fontWeight: "bold", color: settings.accentColor, borderBottomWidth: 1, borderBottomColor: settings.accentColor, paddingBottom: 5, marginBottom: 10, textTransform: "uppercase" }, children: "Original Beleg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: { flexDirection: "row", flexWrap: "wrap" }, children: incomingReceipts.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { src: url, style: { width: 200, height: 200, objectFit: "contain", backgroundColor: "#f9fafb", border: "1px solid #d1d5db", padding: 5, marginRight: 10, marginBottom: 10 } }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.footer, fixed: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.footerText, children: settings.footerText }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.footerText, render: ({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}` })
    ] })
  ] }) });
};
function Finance() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  useNavigate();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const { theme } = useTheme();
  const functions = getFunctions(getApp(), "europe-west1");
  const tooltipContentStyle = { backgroundColor: theme === "dark" ? "#18181b" : "#ffffff", borderColor: theme === "dark" ? "#27272a" : "#e4e4e7", color: theme === "dark" ? "#fafafa" : "#09090b", borderRadius: "8px" };
  const { activeProjectId, projects, projectMembers, timeEntries, addTimeEntry } = useProject();
  const { projectId: urlProjectId } = useParams();
  const currentProjectId = urlProjectId || activeProjectId;
  const activeProject = projects?.find((p) => p.id === currentProjectId);
  const currentMember = projectMembers?.find((m) => m.projectId === currentProjectId && m.userId === currentUser?.uid);
  const isReadOnly = currentMember ? currentMember.projectRole === "Viewer" : false;
  const [isMounted, setIsMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setIsMounted(true), []);
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [timeFilter, setTimeFilter] = reactExports.useState("all");
  const [isLandscapeMode, setIsLandscapeMode] = reactExports.useState(false);
  const [isPortrait, setIsPortrait] = reactExports.useState(
    typeof window !== "undefined" ? window.matchMedia("(orientation: portrait)").matches : false
  );
  reactExports.useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleChange = (e) => setIsPortrait(e.matches);
    setIsPortrait(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  reactExports.useEffect(() => {
    if (isLandscapeMode) {
      const lockScreen = async () => {
        try {
          const docEl = document.documentElement;
          if (docEl.requestFullscreen) await docEl.requestFullscreen();
          else if (docEl.webkitRequestFullscreen) await docEl.webkitRequestFullscreen();
          if (window.screen.orientation && "lock" in window.screen.orientation) {
            await window.screen.orientation.lock("landscape");
          }
        } catch (e) {
        }
      };
      lockScreen();
    } else {
      const unlockScreen = async () => {
        try {
          if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
          }
          if (window.screen.orientation && "unlock" in window.screen.orientation) {
            window.screen.orientation.unlock();
          }
        } catch (e) {
        }
      };
      unlockScreen();
    }
  }, [isLandscapeMode]);
  const [transactions, setTransactions] = reactExports.useState([]);
  const [projectHeader, setProjectHeader] = reactExports.useState({ project: activeProject?.name || t("new_project"), client: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], version: "v1.0" });
  const [includeOptions, setIncludeOptions] = reactExports.useState(false);
  const [versions, setVersions] = reactExports.useState([{ id: "v1", name: "Variant 1", vatRate: 8.1, status: "draft", groups: [{ id: "g1", pos: "100", title: "Phase", items: [] }] }]);
  const [activeVersionId, setActiveVersionId] = reactExports.useState("v1");
  const activeVersion = versions.find((v) => v.id === activeVersionId) || versions[0];
  const approvedVersions = versions.filter((v) => v.status === "approved");
  const budgetGroups = activeVersion.groups;
  const vatRate = activeVersion.vatRate;
  const [showInvoiceModal, setShowInvoiceModal] = reactExports.useState(false);
  const [showQuoteModal, setShowQuoteModal] = reactExports.useState(false);
  const [showReceiptStudio, setShowReceiptStudio] = reactExports.useState(false);
  const [showTimeModal, setShowTimeModal] = reactExports.useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = reactExports.useState(false);
  const [isReceiptPdfStudioOpen, setIsReceiptPdfStudioOpen] = reactExports.useState(false);
  const [isInitialLoad, setIsInitialLoad] = reactExports.useState(true);
  const [isAnalyzingAI, setIsAnalyzingAI] = reactExports.useState(false);
  const [receiptType, setReceiptType] = reactExports.useState("expense");
  const [incomingReceipts, setIncomingReceipts] = reactExports.useState([]);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [incomingData, setIncomingData] = reactExports.useState({ type: "internal", vendor: "", company: "", firstName: "", lastName: "", contactPerson: "", address: "", zipCity: "", phone: "", email: "", description: "", amount: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], budgetPosId: "", status: "Offen" });
  const [timeData, setTimeData] = reactExports.useState({ type: "internal", userId: "", company: "", firstName: "", lastName: "", contactPerson: "", address: "", zipCity: "", phone: "", email: "", hours: 0, hourlyRate: 0, description: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] });
  const mobileCameraRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const [opCostSessionId] = reactExports.useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/extern/${opCostSessionId}`;
  reactExports.useEffect(() => {
    if (!currentUser || !currentUser.companyId || !db || !currentProjectId) return;
    const q = query(collection(db, "transactions"), where("companyId", "==", currentUser.companyId), where("projectId", "==", currentProjectId));
    const unsub = onSnapshot(q, (snap) => {
      const txs = snap.docs.map((doc2) => ({ ...doc2.data(), id: doc2.id }));
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(txs);
    }, (error) => console.log("Silent skip: Transactions fetch blocked"));
    getDoc(doc(db, "financeData", `finance_${currentProjectId}`)).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.versions) setVersions(data.versions);
        if (data.activeVersionId) setActiveVersionId(data.activeVersionId);
        if (data.projectHeader) setProjectHeader(data.projectHeader);
        if (data.includeOptions !== void 0) setIncludeOptions(data.includeOptions);
      }
      setIsInitialLoad(false);
    }).catch((e) => console.log("Silent skip: getDoc blocked"));
    return () => unsub();
  }, [currentUser, currentProjectId]);
  reactExports.useEffect(() => {
    if (isInitialLoad || !currentUser || !currentUser.companyId || !db || isReadOnly || !currentProjectId) return;
    const timeout = setTimeout(() => {
      setDoc(doc(db, "financeData", `finance_${currentProjectId}`), { versions, activeVersionId, projectHeader, includeOptions, ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: currentProjectId }, { merge: true }).catch(() => {
      });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [versions, activeVersionId, projectHeader, includeOptions, currentProjectId, currentUser, db, isReadOnly]);
  reactExports.useEffect(() => {
    if (!db || !opCostSessionId || !showReceiptStudio) return;
    const q = query(collection(db, "temp_receipts"), where("sessionId", "==", opCostSessionId));
    const unsub = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          let imgSrc = data.url || (data.base64Image ? `data:${data.mimeType || "image/jpeg"};base64,${data.base64Image}` : null);
          if (imgSrc) setIncomingReceipts((prev) => prev.includes(imgSrc) ? prev : [...prev, imgSrc]);
          const extData = data.receiptData || data.extractedData;
          if (extData && (extData.total || extData.amount || extData.vendor || extData.merchant)) {
            applyAiData(extData);
            deleteDoc(doc(db, "temp_receipts", change.doc.id)).catch(() => {
            });
            return;
          }
          if (imgSrc) {
            let base64ToProcess = data.base64Image;
            let mimeToProcess = data.mimeType || "image/jpeg";
            if (!base64ToProcess && data.url) {
              try {
                const res = await fetch(data.url);
                const blob = await res.blob();
                mimeToProcess = blob.type;
                const base64Str = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result);
                  reader.readAsDataURL(blob);
                });
                base64ToProcess = base64Str.split(",")[1];
              } catch (e) {
              }
            }
            await processImageWithAI(base64ToProcess || null, data.url || null, mimeToProcess);
          }
          deleteDoc(doc(db, "temp_receipts", change.doc.id)).catch(() => {
          });
        }
      });
    }, (error) => console.log("Silent skip: Temp Receipts fetch blocked"));
    return () => unsub();
  }, [opCostSessionId, showReceiptStudio]);
  const calculateGroupTotal = (group) => group.items.reduce((sum, item) => sum + item.total + (includeOptions ? item.option : 0), 0);
  const totalBudget = budgetGroups.reduce((sum, group) => sum + calculateGroupTotal(group), 0);
  const getFilteredTransactions = () => {
    return transactions.filter((tx) => {
      if (timeFilter === "all") return true;
      const txDate = new Date(tx.date);
      const now = /* @__PURE__ */ new Date();
      if (timeFilter === "year") return txDate.getFullYear() === now.getFullYear();
      if (timeFilter === "month") return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
      if (timeFilter === "today") return tx.date === now.toISOString().split("T")[0];
      return true;
    });
  };
  const getFilteredTimeEntries = () => {
    const currentProjectTimeEntries = (timeEntries || []).filter((e) => e.projectId === currentProjectId);
    return currentProjectTimeEntries.filter((e) => {
      if (timeFilter === "all") return true;
      const eDate = new Date(e.date);
      const now = /* @__PURE__ */ new Date();
      if (timeFilter === "year") return eDate.getFullYear() === now.getFullYear();
      if (timeFilter === "month") return eDate.getFullYear() === now.getFullYear() && eDate.getMonth() === now.getMonth();
      if (timeFilter === "today") return (e.date || "") === now.toISOString().split("T")[0];
      return true;
    });
  };
  const filteredTransactions = getFilteredTransactions();
  const filteredTimeEntries = getFilteredTimeEntries();
  const filteredHoursCost = filteredTimeEntries.reduce((sum, e) => sum + (Number(e.hours) || 0) * (e.hourlyRate || 0), 0);
  const filteredInvoiced = filteredTransactions.filter((tx) => tx.category === "Debitorenrechnung").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const filteredExtSpent = filteredTransactions.filter((tx) => tx.category === "Kreditorenrechnung").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const filteredSpent = filteredExtSpent + filteredHoursCost;
  const filteredProfit = filteredInvoiced - filteredSpent;
  const allTimeTimeEntries = (timeEntries || []).filter((e) => e.projectId === currentProjectId);
  const allTimeHoursCost = allTimeTimeEntries.reduce((sum, e) => sum + (Number(e.hours) || 0) * (e.hourlyRate || 0), 0);
  const allTimeHours = allTimeTimeEntries.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
  const getFilteredActualCostForItem = (itemId) => filteredTransactions.filter((tx) => tx.budgetPosId === itemId && tx.category === "Kreditorenrechnung").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const getFilteredActualCostForGroup = (group) => group.items.reduce((sum, item) => sum + getFilteredActualCostForItem(item.id), 0);
  const getAllTimeActualCostForItem = (itemId) => transactions.filter((tx) => tx.budgetPosId === itemId && tx.category === "Kreditorenrechnung").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const getAllTimeActualCostForGroup = (group) => group.items.reduce((sum, item) => sum + getAllTimeActualCostForItem(item.id), 0);
  const overviewTotalBudget = approvedVersions.length > 0 ? approvedVersions.reduce((sum, v) => sum + v.groups.reduce((s, g) => s + calculateGroupTotal(g), 0), 0) : totalBudget;
  transactions.filter((tx) => tx.category === "Kreditorenrechnung").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const totalActualCostsIncludingHoursAllTime = approvedVersions.reduce((sum, v) => sum + v.groups.reduce((s, g) => s + getAllTimeActualCostForGroup(g), 0), 0) + allTimeHoursCost;
  const budgetRemaining = Math.max(0, overviewTotalBudget - filteredSpent);
  const formatCHF = (val) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  const pieData = [
    { name: t("external_costs"), value: filteredExtSpent },
    { name: t("internal_hours_time_tracking"), value: filteredHoursCost },
    { name: t("remaining"), value: budgetRemaining > 0 ? budgetRemaining : 0 }
  ];
  const PIE_COLORS = ["#f87171", "#f97316", "#3b82f6"];
  const activeChartGroups = approvedVersions.length > 0 ? approvedVersions.flatMap((v) => v.groups) : budgetGroups;
  const chartData = activeChartGroups.map((g) => ({ name: g.title.length > 15 ? g.title.substring(0, 15) + "..." : g.title, [t("planned")]: calculateGroupTotal(g), [t("actual_costs")]: getFilteredActualCostForGroup(g) }));
  const rawTxs = transactions.map((t2) => ({ ...t2, isTimeEntry: false }));
  const rawTimes = allTimeTimeEntries.map((e) => ({
    id: e.id,
    date: e.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    description: e.description || "Zeiterfassung",
    category: "Interne Stunden",
    amount: -(Number(e.hours || 0) * Number(e.hourlyRate || 0)),
    status: "Gebucht",
    isTimeEntry: true,
    hours: e.hours,
    userId: e.userId,
    budgetPosId: e.budgetPosId || ""
  }));
  const combinedLedgerAsc = [...rawTxs, ...rawTimes].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBalance = 0;
  const allLedgerTransactions = combinedLedgerAsc.map((tx) => {
    if (tx.category !== "Offerte") runningBalance += tx.amount;
    return { ...tx, balance: runningBalance };
  });
  const displayLedger = [...allLedgerTransactions].reverse().filter((tx) => {
    if (timeFilter === "all") return true;
    const txDate = new Date(tx.date);
    const now = /* @__PURE__ */ new Date();
    if (timeFilter === "year") return txDate.getFullYear() === now.getFullYear();
    if (timeFilter === "month") return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
    if (timeFilter === "today") return tx.date === now.toISOString().split("T")[0];
    return true;
  });
  const getBudgetDetails = (posId) => {
    if (!posId) return null;
    for (const v of versions) {
      for (const g of v.groups) {
        const item = g.items.find((i) => i.id === posId);
        if (item) return { phase: g.title, item: `${item.pos} ${item.description}`, versionName: v.name };
      }
    }
    return null;
  };
  const handleDeleteTransaction = async (id) => {
    if (isReadOnly) return;
    if (window.confirm(t("delete_confirm"))) {
      try {
        await deleteDoc(doc(db, "transactions", id));
        addToast(t("booking_deleted"), "success");
      } catch (error) {
        addToast(t("delete_error"), "error");
      }
    }
  };
  const handleCreateNewVersion = () => {
    const newId = `v${Date.now()}`;
    setVersions([...versions, { id: newId, name: t("new_variant"), vatRate: 8.1, status: "draft", groups: [{ id: `g${Date.now()}`, pos: "100", title: t("new_phase"), items: [] }] }]);
    setActiveVersionId(newId);
    addToast(t("new_variant_created"), "success");
  };
  const handleDuplicateVersion = () => {
    const newId = `v${Date.now()}`;
    setVersions([...versions, { ...activeVersion, id: newId, status: "draft", name: `${activeVersion.name} (Kopie)` }]);
    setActiveVersionId(newId);
    addToast(t("variant_duplicated"), "success");
  };
  const handleDeleteVersion = (id) => {
    if (versions.length <= 1) return addToast(t("min_one_variant"), "error");
    if (versions.find((v) => v.id === id)?.status === "approved") return addToast(t("cant_delete_approved"), "error");
    const newVersions = versions.filter((v) => v.id !== id);
    setVersions(newVersions);
    if (activeVersionId === id) setActiveVersionId(newVersions[0].id);
    addToast(t("variant_deleted"), "info");
  };
  const handleToggleApproveVersion = () => {
    const isCurrentlyApproved = activeVersion.status === "approved";
    const msg = isCurrentlyApproved ? t("revoke_confirm") : t("approve_confirm");
    if (window.confirm(msg)) {
      setVersions((prev) => prev.map((v) => v.id === activeVersionId ? { ...v, status: isCurrentlyApproved ? "draft" : "approved" } : v));
      addToast(isCurrentlyApproved ? t("approval_revoked") : t("budget_approved"), "success");
    }
  };
  const handleDeleteGroup = (groupId) => {
    setVersions((prev) => prev.map((v) => v.id === activeVersionId ? { ...v, groups: v.groups.filter((g) => g.id !== groupId) } : v));
  };
  const handleBudgetChange = (groupId, itemId, field, value) => {
    if (isReadOnly) return;
    setVersions((prev) => prev.map((v) => v.id === activeVersionId ? {
      ...v,
      groups: v.groups.map((g) => g.id !== groupId ? g : {
        ...g,
        items: g.items.map((i) => {
          if (i.id !== itemId) return i;
          const updated = { ...i, [field]: value };
          if (["qty", "unitPrice", "unit"].includes(field)) {
            const qty = field === "qty" ? Number(value) : i.qty;
            const price = field === "unitPrice" ? Number(value) : i.unitPrice;
            const unit = field === "unit" ? String(value) : i.unit;
            if (unit === "Option") {
              updated.option = qty * price;
              updated.total = 0;
            } else {
              updated.total = qty * price;
              updated.option = 0;
            }
          }
          return updated;
        })
      })
    } : v));
  };
  const applyAiData = (aiData) => {
    const vendorName = aiData.vendor || aiData.merchant || aiData.company || aiData.description || "";
    const rawAmount = aiData.total || aiData.amount || aiData.sum || "";
    const cleanAmount = rawAmount ? String(rawAmount).replace(/[^0-9.,]/g, "").replace(",", ".") : "";
    setIncomingData((prev) => ({
      ...prev,
      amount: cleanAmount || prev.amount,
      vendor: vendorName || prev.vendor,
      company: vendorName || prev.company,
      description: vendorName ? `${vendorName} Beleg` : prev.description,
      date: aiData.date || prev.date
    }));
  };
  const processImageWithAI = async (base64Data, imageUrl, mimeType) => {
    setIsAnalyzingAI(true);
    addToast(t("analyzing_ai"), "info");
    try {
      const analyzeReceipt = httpsCallable(functions, "analyzeReceipt");
      const result = await analyzeReceipt({ base64Image: base64Data, imageUrl, mimeType });
      applyAiData(result.data);
      addToast(t("receipt_live_received"), "success");
    } catch (error) {
      addToast(t("ai_failed"), "error");
    } finally {
      setIsAnalyzingAI(false);
    }
  };
  const handleLocalImageUpload = async (e) => {
    const filesList = Array.from(e.target.files || []);
    if (!filesList.length || !currentUser) return;
    for (const file of filesList) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result;
          setIncomingReceipts((prev) => [...prev, base64String]);
          const base64Data = base64String.split(",")[1];
          await processImageWithAI(base64Data, null, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
    if (mobileCameraRef.current) mobileCameraRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const ensureFolderLocal = async (folderName, docCategory) => {
    if (!currentUser || !currentUser.companyId || !currentProjectId) return "";
    const folderQ = query(collection(db, "documents"), where("companyId", "==", currentUser.companyId), where("name", "==", folderName), where("isFolder", "==", true), where("projectId", "==", currentProjectId));
    const folderSnap = await getDocs(folderQ);
    if (!folderSnap.empty) return folderSnap.docs[0].id;
    const newFolderRef = await addDoc(collection(db, "documents"), { name: folderName, isFolder: true, category: docCategory, ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: currentProjectId, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    return newFolderRef.id;
  };
  const saveDocumentToCloud = async (fileData, category, defaultStatus = "Offen") => {
    if (!currentUser || !currentUser.companyId || !db || !currentProjectId) return false;
    try {
      let downloadUrl = fileData.url || "";
      if (fileData.file) {
        const storageRef = ref(storage, `${currentUser.companyId}/documents/${Date.now()}_${fileData.fileName}`);
        await uploadBytes(storageRef, fileData.file);
        downloadUrl = await getDownloadURL(storageRef);
      }
      const targetFolderId = await ensureFolderLocal("Finanzen", "projects");
      const documentName = fileData.fileName || fileData.name || `Dokument_${Date.now()}.pdf`;
      const documentTotal = fileData.total !== void 0 ? fileData.total : fileData.amount || 0;
      await addDoc(collection(db, "documents"), { name: documentName, size: fileData.size || "0 MB", type: "application/pdf", url: downloadUrl, fileUrl: downloadUrl, folderId: targetFolderId, isFolder: false, ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: currentProjectId, category: "projects", uploadedBy: currentUser.uid, createdAt: (/* @__PURE__ */ new Date()).toISOString(), uploadedAt: (/* @__PURE__ */ new Date()).toISOString() });
      const displayCategory = category === "Debitorenrechnung" ? t("invoice") : t("quote");
      await addDoc(collection(db, "transactions"), { date: fileData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0], description: `${displayCategory}: ${documentName}`, category: category || "Dokument", amount: documentTotal || 0, status: defaultStatus || "Offen", ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: currentProjectId, budgetPosId: fileData.budgetPosId || "", url: downloadUrl });
      return true;
    } catch (error) {
      return false;
    }
  };
  const handleSaveGeneratedInvoice = async (fileData) => {
    const success = await saveDocumentToCloud(fileData, "Debitorenrechnung", "Offen");
    if (success) {
      setShowInvoiceModal(false);
      addToast(t("invoice_saved"), "success");
    } else {
      addToast(t("save_error"), "error");
    }
  };
  const handleSaveGeneratedQuote = async (fileData) => {
    const success = await saveDocumentToCloud(fileData, "Offerte", "Draft");
    if (success) {
      setShowQuoteModal(false);
      addToast(t("quote_saved"), "success");
    } else {
      addToast(t("save_error"), "error");
    }
  };
  const handleSavePdfToCloud = async (blob) => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `Finanzbericht_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      const targetFolderId = await ensureFolderLocal("Finanzen", "projects");
      await addDoc(collection(db, "documents"), { name: fileName, url: downloadUrl, fileUrl: downloadUrl, projectId: currentProjectId, folderId: targetFolderId, category: "projects", ownerId: currentUser.uid, companyId: currentUser.companyId, uploadedBy: currentUser.uid, type: "application/pdf", size: formatBytes(blob.size), isFolder: false, createdAt: (/* @__PURE__ */ new Date()).toISOString(), uploadedAt: (/* @__PURE__ */ new Date()).toISOString(), date: (/* @__PURE__ */ new Date()).toLocaleDateString("de-CH") });
      addToast("Erfolgreich exportiert", "success");
      setIsPdfStudioOpen(false);
    } catch (e) {
      addToast("Fehler beim Speichern", "error");
    }
  };
  const handleSaveReceiptPdfToCloud = async (blob) => {
    if (!currentUser || !currentUser.companyId || !currentProjectId) return;
    setIsSubmitting(true);
    try {
      const fileName = `Buchung_${incomingData.vendor.replace(/\s/g, "_")}_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const finalPdfUrl = await getDownloadURL(storageRef);
      const uploadedUrls = [finalPdfUrl];
      for (let i = 0; i < incomingReceipts.length; i++) {
        if (incomingReceipts[i].startsWith("data:image")) {
          const fetchRes = await fetch(incomingReceipts[i]);
          const fileBlob = await fetchRes.blob();
          const imgRef = ref(storage, `${currentUser.companyId}/documents/Kreditoren_Beleg_${Date.now()}_${i}.png`);
          await uploadBytes(imgRef, fileBlob);
          const imgUrl = await getDownloadURL(imgRef);
          uploadedUrls.push(imgUrl);
        }
      }
      const isExternal = incomingData.type === "external";
      const descPrefix = isExternal && incomingData.company ? `${incomingData.company} (${incomingData.firstName} ${incomingData.lastName})` : incomingData.vendor || "Firma";
      await addDoc(collection(db, "transactions"), {
        date: incomingData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        description: `${descPrefix} - ${incomingData.description || "Beleg"}`,
        category: "Kreditorenrechnung",
        amount: -Math.abs(Number(incomingData.amount) || 0),
        status: incomingData.status || "Offen",
        projectId: currentProjectId,
        ownerId: currentUser.uid,
        companyId: currentUser.companyId,
        budgetPosId: incomingData.budgetPosId || "",
        receiptUrls: uploadedUrls
      });
      addToast(t("receipt_booked_success") || "Erfolgreich verbucht", "success");
      setIsReceiptPdfStudioOpen(false);
      setShowReceiptStudio(false);
      setIncomingReceipts([]);
    } catch (e) {
      addToast("Fehler", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleTimeSubmit = (e) => {
    e.preventDefault();
    if (timeData.hours <= 0 || !currentProjectId) return;
    setIsSubmitting(true);
    try {
      if (typeof addTimeEntry === "function") {
        const isExternal = timeData.type === "external";
        const descPrefix = isExternal && timeData.company ? `[Extern: ${timeData.company}] ` : "";
        addTimeEntry({ userId: isExternal ? "external_partner" : timeData.userId || "internal_team", projectId: currentProjectId, date: timeData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0], hours: timeData.hours || 0, description: `${descPrefix}${timeData.description || "Stunden"}`, hourlyRate: timeData.hourlyRate || 0, externalData: isExternal ? { company: timeData.company, firstName: timeData.firstName, lastName: timeData.lastName, contactPerson: timeData.contactPerson, address: timeData.address, zipCity: timeData.zipCity, phone: timeData.phone, email: timeData.email } : null });
        addToast(t("hours_booked_success") || "Erfolgreich", "success");
        setShowTimeModal(false);
        setTimeData({ type: "internal", userId: "", company: "", firstName: "", lastName: "", contactPerson: "", address: "", zipCity: "", phone: "", email: "", hours: 0, hourlyRate: 0, description: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] });
      } else {
        addToast("Fehler: Zeiterfassung noch nicht initialisiert.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLandscapeMode) {
    if (isPortrait) {
      return reactDomExports.createPortal(
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { zIndex: 999999 }, className: "fixed inset-0 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 48, className: "mb-6 text-accent-ai animate-[spin_3s_linear_infinite]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-3 text-text-primary", children: "Bitte Smartphone drehen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mb-8 font-medium", children: "Um die vollständige B2B-Tabellenansicht zu nutzen, drehe dein Gerät bitte ins Querformat (Landscape)." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsLandscapeMode(false), className: "w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold transition-colors", children: "Abbrechen" })
        ] }) }),
        document.body
      );
    }
    return reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { zIndex: 999999 }, className: "fixed inset-0 bg-background text-text-primary p-0 lg:p-6 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface lg:rounded-2xl border-0 lg:border border-border/50 p-4 lg:p-6 shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden w-full h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold flex items-center gap-2 text-accent-ai", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 20 }),
            " Tabellenansicht"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsLandscapeMode(false), className: "p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Schließen" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto custom-scrollbar -mx-4 px-4 lg:-mx-6 lg:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[1000px] pb-8", children: [
          activeTab === "budget" && /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left border-collapse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-text-muted border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-16", children: t("pos") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: t("description") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right w-24", children: t("qty") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-24", children: t("unit") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right w-24", children: t("unit_price") }),
              includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right w-24 text-accent-ai", children: "Option" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "px-4 py-3 text-right w-36 text-blue-400", children: [
                t("total"),
                " (CHF)"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/30", children: [
              budgetGroups.map((group) => {
                const groupPlanTotal = calculateGroupTotal(group);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-blue-500/10 border-y border-blue-500/20 group relative", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-blue-400", children: group.pos }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-blue-400", colSpan: includeOptions ? 5 : 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "bg-transparent text-blue-400 border-none outline-none w-full font-bold", value: group.title, onChange: (e) => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: v.groups.map((g) => g.id === group.id ? { ...g, title: e.target.value } : g) } : v)), disabled: activeVersion.status === "approved" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-bold text-right text-blue-400 relative", children: [
                      formatCHF(groupPlanTotal),
                      !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteGroup(group.id), className: "absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 no-print", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
                    ] })
                  ] }),
                  group.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/5 transition-colors group/row", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-xs text-text-muted font-medium", children: item.pos }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: item.description, onChange: (e) => handleBudgetChange(group.id, item.id, "description", e.target.value), className: "w-full bg-transparent outline-none focus:border-b focus:border-accent-ai/50 py-1 font-medium text-text-primary", disabled: activeVersion.status === "approved", placeholder: t("description") }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: item.qty || "", onChange: (e) => handleBudgetChange(group.id, item.id, "qty", e.target.value), className: cn(numberInputClass, "font-medium text-text-primary"), disabled: activeVersion.status === "approved" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: item.unit, onChange: (e) => handleBudgetChange(group.id, item.id, "unit", e.target.value), className: "bg-transparent text-text-primary outline-none w-full appearance-none cursor-pointer font-medium", disabled: activeVersion.status === "approved", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-surface", children: "Std." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-surface", children: "Stk." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-surface", children: "Pauschal" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-surface", children: "m2" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-surface font-bold text-accent-ai", children: "Option" })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: item.unitPrice || "", onChange: (e) => handleBudgetChange(group.id, item.id, "unitPrice", e.target.value), className: cn(numberInputClass, "font-medium text-text-primary"), disabled: activeVersion.status === "approved" }) }),
                    includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right bg-accent-ai/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: item.option > 0 ? "text-accent-ai font-bold" : "text-text-muted font-medium", children: item.option > 0 ? formatCHF(item.option) : "-" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right font-bold relative text-text-primary", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: item.option > 0 ? "text-accent-ai" : "", children: formatCHF(item.total + (includeOptions ? item.option : 0)) }),
                      !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: v.groups.map((g) => g.id === group.id ? { ...g, items: g.items.filter((i) => i.id !== item.id) } : g) } : v)), className: "absolute right-1 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover/row:opacity-100 p-1 no-print", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
                    ] })
                  ] }, item.id)),
                  !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "no-print", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: includeOptions ? 7 : 6, className: "px-4 py-3 bg-background/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: v.groups.map((g) => g.id === group.id ? { ...g, items: [...g.items, { id: `i${Date.now()}`, pos: `${g.pos.substring(0, 1)}0${g.items.length + 1}`, description: "", qty: 1, unit: "Stk.", unitPrice: 0, option: 0, total: 0 }] } : g) } : v)), className: "text-xs font-bold flex items-center gap-1 text-accent-ai hover:underline", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
                    " ",
                    t("add_position")
                  ] }) }) })
                ] }, group.id);
              }),
              !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "no-print", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: includeOptions ? 7 : 6, className: "px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: [...v.groups, { id: `g${Date.now()}`, pos: `${v.groups.length + 1}00`, title: t("new_phase"), items: [] }] } : v)), className: "w-full py-3 border border-dashed border-accent-ai/30 text-accent-ai rounded-lg font-bold hover:bg-accent-ai/5 flex justify-center items-center gap-2 transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 18 }),
                " ",
                t("new_phase")
              ] }) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tfoot", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-background border-t-2 border-border/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-4 py-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-right text-xs uppercase font-bold text-text-muted whitespace-nowrap", children: t("subtotal") }),
                includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-right font-bold text-sm text-accent-ai whitespace-nowrap", children: formatCHF(budgetGroups.reduce((sum, group) => sum + group.items.reduce((s, item) => s + item.option, 0), 0)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-right font-bold text-sm text-text-primary whitespace-nowrap", children: formatCHF(totalBudget) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-background border-b border-border/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-4 py-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right text-xs uppercase font-semibold text-text-muted flex justify-end items-center gap-2 whitespace-nowrap", children: [
                  t("vat"),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: vatRate, onChange: (e) => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, vatRate: Number(e.target.value) } : v)), className: cn(numberInputClass, "font-medium w-16 px-2 py-1 rounded border border-border/50 bg-surface outline-none text-text-primary"), disabled: activeVersion.status === "approved" }),
                  "%"
                ] }),
                includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsx("td", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-medium text-sm text-text-muted whitespace-nowrap", children: formatCHF(totalBudget * (vatRate / 100)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-surface border-b-2 border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-4 py-5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-5 text-right font-bold text-sm uppercase text-text-primary whitespace-nowrap", children: t("total_amount") }),
                includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsx("td", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-5 text-right font-bold text-sm text-blue-400 whitespace-nowrap", children: formatCHF(totalBudget * (1 + vatRate / 100)) })
              ] })
            ] })
          ] }),
          activeTab === "control" && /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left border-collapse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-surface border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-16 text-text-muted uppercase tracking-wider", children: t("pos") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-text-muted uppercase tracking-wider min-w-[200px]", children: t("description") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32", children: t("planned") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-red-500 uppercase tracking-wider w-32", children: t("actual_costs") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32", children: t("variance") })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/30", children: [
              approvedVersions.map((version) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-accent-ai/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 5, className: "px-4 py-2 font-bold text-xs uppercase text-accent-ai tracking-widest", children: [
                  t("budget_supplement"),
                  " ",
                  version.name
                ] }) }),
                version.groups.map((group) => {
                  const plan = calculateGroupTotal(group);
                  const actual = getAllTimeActualCostForGroup(group);
                  const diff = plan - actual;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-surface/50 border-t border-border/50", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-text-primary", children: group.pos }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-text-primary", children: group.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-right text-text-primary", children: formatCHF(plan) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-right text-red-500", children: formatCHF(actual) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: cn("px-4 py-3 font-bold text-right", diff < 0 ? "text-red-500" : "text-emerald-500"), children: [
                        diff >= 0 ? "+" : "",
                        formatCHF(diff)
                      ] })
                    ] }),
                    group.items.map((item) => {
                      const itemActual = getAllTimeActualCostForItem(item.id);
                      const itemDiff = item.total - itemActual;
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/5 transition-colors", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-xs text-text-muted font-medium", children: item.pos }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-text-primary font-medium", children: item.description }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-text-primary", children: formatCHF(item.total) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-red-500", children: itemActual > 0 ? formatCHF(itemActual) : "-" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: cn("px-4 py-2 text-right font-medium", itemDiff < 0 ? "text-red-500" : "text-emerald-500"), children: [
                          itemDiff >= 0 ? "+" : "",
                          formatCHF(itemDiff)
                        ] })
                      ] }, item.id);
                    })
                  ] }, group.id);
                })
              ] }, version.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-orange-500/10 border-y-2 border-orange-500/20", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-orange-500", children: "HR" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-bold text-orange-500", children: [
                  t("internal_hours_time_tracking"),
                  " (",
                  allTimeHours,
                  " h)"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-right text-orange-500", children: "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-right text-red-500", children: formatCHF(allTimeHoursCost) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-bold text-right text-red-500", children: [
                  "-",
                  formatCHF(allTimeHoursCost)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-surface border-t-2 border-border/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "px-4 py-5 text-right font-black uppercase tracking-wider text-text-primary", children: t("total_project_excl_vat") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-5 text-right font-black text-text-primary", children: formatCHF(overviewTotalBudget) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-5 text-right font-black text-red-500", children: formatCHF(totalActualCostsIncludingHoursAllTime) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: cn("px-4 py-5 text-right font-black", overviewTotalBudget - totalActualCostsIncludingHoursAllTime < 0 ? "text-red-500" : "text-emerald-500"), children: [
                overviewTotalBudget - totalActualCostsIncludingHoursAllTime >= 0 ? "+" : "",
                formatCHF(overviewTotalBudget - totalActualCostsIncludingHoursAllTime)
              ] })
            ] }) })
          ] }),
          activeTab === "cashflow" && /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left border-collapse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-surface border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-text-muted uppercase tracking-wider w-32", children: t("date") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-text-muted uppercase tracking-wider min-w-[200px]", children: t("description") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-text-muted uppercase tracking-wider w-48", children: t("budget_assignment") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32", children: t("credit_revenue") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32", children: t("debit_costs") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32", children: t("balance_profit") })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/30", children: [
              displayLedger.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-4 py-8 text-center text-text-muted italic", children: t("no_bookings_period") }) }),
              displayLedger.map((tx) => {
                const isQuote = tx.category === "Offerte" || tx.category === "Quote";
                const isTime = !!tx.isTimeEntry;
                const isRevenue = tx.category === "Debitorenrechnung" || tx.category === "Outgoing Invoice" || !isQuote && !isTime && tx.amount > 0;
                const displayAmount = tx.amount === 0 ? 0 : Math.abs(tx.amount);
                const bdDetails = getBudgetDetails(tx.budgetPosId);
                const isBalanceNegative = 0 > tx.balance;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/5 transition-colors group", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-text-muted font-medium flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteTransaction(tx.id), className: "opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }),
                    tx.date
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-text-primary", children: tx.description }),
                    tx.url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: tx.url, target: "_blank", rel: "noopener noreferrer", className: "text-accent-ai hover:underline p-1 bg-accent-ai/10 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14 }) })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-text-muted font-medium", children: bdDetails ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: bdDetails.phase }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary font-bold truncate max-w-[150px]", children: bdDetails.item })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic opacity-50", children: t("free_booking") }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-bold text-emerald-500", children: isQuote ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-muted italic", children: [
                    "(",
                    formatCHF(displayAmount),
                    ")"
                  ] }) : isRevenue && displayAmount > 0 ? `+ ${formatCHF(displayAmount)}` : "" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-bold text-red-500", children: !isQuote && !isRevenue && displayAmount > 0 ? `- ${formatCHF(displayAmount)}` : "" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: cn("px-4 py-3 text-right font-bold", isQuote ? "text-text-muted" : isBalanceNegative ? "text-red-500" : "text-emerald-500"), children: isQuote ? "-" : formatCHF(tx.balance) })
                ] }, tx.id);
              })
            ] })
          ] })
        ] }) })
      ] }) }),
      document.body
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "flex-1 flex flex-col min-h-0 bg-background text-text-primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 shrink-0 z-40 px-4 sm:px-0 pt-4 sm:pt-0 pb-4 border-b border-border/50 sm:border-none bg-surface/50 sm:bg-transparent", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col xl:flex-row xl:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between w-full xl:w-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-semibold tracking-tight flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "text-accent-ai", size: 24 }),
              " ",
              t("finance_budget")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mt-1 font-medium", children: projectHeader.project })
          ] }),
          (activeTab === "budget" || activeTab === "cashflow" || activeTab === "control") && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsLandscapeMode(true), className: "lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg font-bold shadow-sm active:scale-95 transition-transform", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 14 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: t("rotate") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 w-full xl:w-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 sm:flex gap-2 w-full sm:w-auto shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowTimeModal(true), className: "flex-1 sm:flex-none flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-white/5 hover:text-orange-400 transition-colors shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 16 }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline ml-2", children: t("book_hours") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowQuoteModal(true), className: "flex-1 sm:flex-none flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-white/5 hover:text-accent-ai transition-colors shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FilePenLine, { size: 16 }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline ml-2", children: t("quote") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
              setReceiptType("expense");
              setShowReceiptStudio(true);
            }, className: "flex-1 sm:flex-none flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold hover:bg-white/5 hover:text-red-400 transition-colors shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { size: 16 }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline ml-2", children: t("book_receipt") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowInvoiceModal(true), className: "flex-1 sm:flex-none flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-bold hover:bg-emerald-500/20 transition-colors shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 16 }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline ml-2", children: t("invoice") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block w-px h-6 bg-border/50 mx-1" }),
          activeTab !== "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsPdfStudioOpen(true), className: "hidden lg:flex px-4 py-2 bg-surface border border-border/50 text-text-primary rounded-lg text-sm font-bold hover:bg-white/5 transition-colors shadow-sm items-center gap-2 h-[42px] cursor-pointer shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 16 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "PDF Studio" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center gap-3 w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-surface border border-border/50 rounded-lg p-1 shadow-sm overflow-x-auto hide-scrollbar w-full lg:w-auto h-[42px] shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("overview"), className: cn("flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", activeTab === "overview" ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPie, { size: 16 }),
            t("overview")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("budget"), className: cn("flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", activeTab === "budget" ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 16 }),
            t("budget_plan")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("control"), className: cn("flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 relative whitespace-nowrap", activeTab === "control" ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 16 }),
            " ",
            t("payment_control"),
            approvedVersions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("cashflow"), className: cn("flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", activeTab === "cashflow" ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { size: 16 }),
            t("cashflow")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar pb-1 lg:pb-0", children: [
          (activeTab === "overview" || activeTab === "cashflow") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center bg-surface border border-border/50 rounded-lg px-3 h-[42px] shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { size: 16, className: "text-text-muted mr-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: timeFilter, onChange: (e) => setTimeFilter(e.target.value), className: "bg-transparent text-sm font-bold text-text-primary focus:outline-none cursor-pointer appearance-none outline-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", className: "bg-surface", children: t("all_time") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "year", className: "bg-surface", children: t("this_year") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "month", className: "bg-surface", children: t("this_month") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "today", className: "bg-surface", children: t("today") })
            ] })
          ] }),
          activeTab === "budget" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center bg-surface border border-border/50 rounded-lg px-2 h-[42px] shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: activeVersionId, onChange: (e) => setActiveVersionId(e.target.value), className: "bg-transparent text-sm font-bold focus:outline-none px-2 py-1 cursor-pointer outline-none w-28 sm:w-32 truncate shrink-0 appearance-none", children: versions.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: v.id, className: cn("bg-surface text-text-primary", v.status === "approved" ? "font-bold text-emerald-400" : ""), children: [
              v.name,
              " ",
              v.status === "approved" ? ` (${t("approved")})` : ""
            ] }, v.id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-4 bg-border mx-1" }),
            !isReadOnly && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleToggleApproveVersion, className: cn("p-1 px-2 rounded text-xs font-bold transition-colors border mr-1 whitespace-nowrap", activeVersion.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "hover:bg-white/5 text-text-muted border-border/50"), title: t("approve_revoke"), children: activeVersion.status === "approved" ? t("approved") : t("approve") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCreateNewVersion, className: "p-1 hover:text-emerald-400 text-text-muted transition-colors shrink-0", title: t("new_variant"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleDuplicateVersion, className: "p-1 hover:text-accent-ai text-text-muted transition-colors shrink-0", title: t("duplicate_variant"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteVersion(activeVersionId), className: "p-1 hover:text-red-500 text-text-muted transition-colors shrink-0", title: t("delete_variant"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-0 pb-24 lg:pb-0 relative z-10", children: [
      activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 pt-4 lg:pt-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-5 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1", children: t("total_budget") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-text-primary font-medium", children: [
              "CHF ",
              formatCHF(overviewTotalBudget)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-5 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "text-emerald-400", size: 14 }),
              " ",
              t("revenue")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-emerald-400 font-medium", children: [
              "CHF ",
              formatCHF(filteredInvoiced)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-5 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "text-red-400", size: 14 }),
              " ",
              t("costs")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-red-400 font-medium", children: [
              "CHF ",
              formatCHF(filteredSpent)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-surface to-accent-ai/5 border border-border rounded-xl p-5 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1", children: t("project_profit") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-2xl font-bold font-medium", 0 > filteredProfit ? "text-red-500" : "text-emerald-400"), children: [
              "CHF ",
              formatCHF(filteredProfit)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-6 flex flex-col items-center justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold w-full text-left mb-2", children: t("budget_utilization") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-64 w-full relative", children: [
              overviewTotalBudget > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: pieData, cx: "50%", cy: "50%", innerRadius: 70, outerRadius: 90, paddingAngle: 5, dataKey: "value", stroke: "none", children: pieData.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLORS[index % PIE_COLORS.length] }, `cell-${index}`)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: tooltipContentStyle, formatter: (value) => `CHF ${formatCHF(value)}` })
              ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center text-text-muted text-sm", children: t("no_budget_present") }),
              overviewTotalBudget > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-text-primary", children: [
                  Math.round(filteredSpent / overviewTotalBudget * 100),
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-widest text-text-muted", children: t("spent") })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 bg-surface border border-border rounded-xl p-6 flex flex-col min-h-[380px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-6 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "text-accent-ai", size: 18 }),
              " ",
              t("planned_vs_actual")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, margin: { top: 10, right: 10, left: 0, bottom: 20 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: theme === "dark" ? "#27272a" : "#e4e4e7", vertical: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", stroke: "#a1a1aa", fontSize: 10, tickMargin: 10 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "#a1a1aa", fontSize: 10, tickFormatter: (value) => `CHF ${value.toLocaleString()}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { cursor: { fill: theme === "dark" ? "#27272a" : "#f4f4f5" }, contentStyle: tooltipContentStyle }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: { fontSize: "12px", paddingTop: "10px" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: t("planned"), fill: "#3b82f6", radius: [4, 4, 0, 0], maxBarSize: 40 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: t("actual_costs"), fill: "#f87171", radius: [4, 4, 0, 0], maxBarSize: 40 })
            ] }) }) })
          ] })
        ] })
      ] }),
      activeTab === "budget" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:hidden space-y-6 pb-6 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-xl p-4 space-y-4 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "text-xl font-extrabold bg-transparent outline-none w-full border-b border-border/50 focus:border-accent-ai/50 text-text-primary pb-2", value: projectHeader.project, onChange: (e) => setProjectHeader({ ...projectHeader, project: e.target.value }), placeholder: t("project"), disabled: activeVersion.status === "approved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-border/30 pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("date") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: projectHeader.date, onChange: (e) => setProjectHeader({ ...projectHeader, date: e.target.value }), className: "bg-transparent text-sm font-medium outline-none text-right text-text-primary", disabled: activeVersion.status === "approved" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-border/30 pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("client") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: projectHeader.client, onChange: (e) => setProjectHeader({ ...projectHeader, client: e.target.value }), className: "bg-transparent text-sm font-medium outline-none text-right text-text-primary w-1/2", placeholder: "Kunde", disabled: activeVersion.status === "approved" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-border/30 pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: "Version" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: projectHeader.version, onChange: (e) => setProjectHeader({ ...projectHeader, version: e.target.value }), className: "bg-transparent text-sm font-medium outline-none text-right text-text-primary w-1/4", disabled: activeVersion.status === "approved" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between text-sm font-bold text-text-primary cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-muted uppercase tracking-widest", children: "Optionen einrechnen" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: includeOptions, onChange: (e) => setIncludeOptions(e.target.checked), className: "rounded border-border text-accent-ai w-5 h-5 cursor-pointer" })
            ] }) })
          ] })
        ] }),
        budgetGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 shadow-sm relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-blue-500 text-sm", children: group.pos }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-blue-500 text-sm", children: formatCHF(calculateGroupTotal(group)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "bg-transparent text-blue-400 font-bold text-lg outline-none w-full pr-8", value: group.title, onChange: (e) => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: v.groups.map((g) => g.id === group.id ? { ...g, title: e.target.value } : g) } : v)), disabled: activeVersion.status === "approved", placeholder: "Titel der Phase" }),
            !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteGroup(group.id), className: "absolute right-4 bottom-4 text-red-500 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pl-3 border-l-2 border-border/30", children: [
            group.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-xl p-4 shadow-sm relative space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-text-muted bg-background px-2 py-1 rounded border border-border/50", children: item.pos }),
                !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: v.groups.map((g) => g.id === group.id ? { ...g, items: g.items.filter((i) => i.id !== item.id) } : g) } : v)), className: "text-text-muted hover:text-red-500 p-1 bg-background rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: item.description, onChange: (e) => handleBudgetChange(group.id, item.id, "description", e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-text-primary outline-none focus:border-accent-ai/50", disabled: activeVersion.status === "approved", placeholder: t("description") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-text-muted font-bold uppercase block mb-1", children: t("qty") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: item.qty || "", onChange: (e) => handleBudgetChange(group.id, item.id, "qty", e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium outline-none text-right", disabled: activeVersion.status === "approved" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-text-muted font-bold uppercase block mb-1", children: t("unit") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: item.unit, onChange: (e) => handleBudgetChange(group.id, item.id, "unit", e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium outline-none cursor-pointer", disabled: activeVersion.status === "approved", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Std.", children: "Std." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Stk.", children: "Stk." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pauschal", children: "Pauschal" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "m2", children: "m2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Option", className: "font-bold text-accent-ai", children: "Option" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 items-end border-b border-border/30 pb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-text-muted font-bold uppercase block mb-1", children: t("unit_price") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: item.unitPrice || "", onChange: (e) => handleBudgetChange(group.id, item.id, "unitPrice", e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium outline-none text-right", disabled: activeVersion.status === "approved" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-text-muted font-bold uppercase block mb-1", children: "Total (CHF)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-lg font-bold", item.option > 0 ? "text-accent-ai" : "text-text-primary"), children: formatCHF(item.total + (includeOptions ? item.option : 0)) })
                ] })
              ] })
            ] }, item.id)),
            !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: v.groups.map((g) => g.id === group.id ? { ...g, items: [...g.items, { id: `i${Date.now()}`, pos: `${g.pos.substring(0, 1)}0${g.items.length + 1}`, description: "", qty: 1, unit: "Stk.", unitPrice: 0, option: 0, total: 0 }] } : g) } : v)), className: "w-full py-2.5 bg-background border border-dashed border-accent-ai/30 text-accent-ai rounded-xl text-xs font-bold hover:bg-accent-ai/10 flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
              " ",
              t("add_position")
            ] })
          ] })
        ] }, group.id)),
        !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: [...v.groups, { id: `g${Date.now()}`, pos: `${v.groups.length + 1}00`, title: t("new_phase"), items: [] }] } : v)), className: "w-full py-4 bg-surface border border-dashed border-accent-ai/50 text-accent-ai rounded-xl font-bold hover:bg-accent-ai/10 flex items-center justify-center gap-2 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 18 }),
          " ",
          t("new_phase")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-xl p-5 shadow-sm space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-sm font-bold text-text-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("subtotal") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCHF(totalBudget) })
          ] }),
          includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-sm font-bold text-accent-ai border-t border-border/30 pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Optionen Gesamt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCHF(budgetGroups.reduce((sum, group) => sum + group.items.reduce((s, item) => s + item.option, 0), 0)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-sm font-bold text-text-muted border-t border-border/30 pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              t("vat"),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: vatRate, onChange: (e) => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, vatRate: Number(e.target.value) } : v)), className: "w-14 bg-background border border-border/50 rounded p-1 outline-none text-text-primary text-center", disabled: activeVersion.status === "approved" }),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCHF(totalBudget * (vatRate / 100)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-lg font-bold text-blue-400 border-t-2 border-border pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase", children: t("total_amount") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCHF(totalBudget * (1 + vatRate / 100)) })
          ] })
        ] })
      ] }),
      activeTab === "budget" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:flex flex-col w-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface border border-border rounded-xl shadow-lg mt-0 w-full flex-col overflow-x-auto custom-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[800px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 bg-surface border-b border-border/50 w-full flex justify-between items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "text-3xl font-extrabold bg-transparent outline-none w-[600px] border-b border-transparent focus:border-accent-ai/50 text-text-primary mb-2", value: projectHeader.project, onChange: (e) => setProjectHeader({ ...projectHeader, project: e.target.value }), placeholder: t("project"), disabled: activeVersion.status === "approved" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: [
                  t("date"),
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: projectHeader.date, onChange: (e) => setProjectHeader({ ...projectHeader, date: e.target.value }), className: "bg-transparent text-sm font-medium outline-none text-text-primary cursor-pointer border-b border-transparent focus:border-accent-ai/50 py-1", disabled: activeVersion.status === "approved" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: [
                  t("client"),
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: projectHeader.client, onChange: (e) => setProjectHeader({ ...projectHeader, client: e.target.value }), className: "bg-transparent text-sm font-medium outline-none text-text-primary border-b border-transparent focus:border-accent-ai/50 py-1 w-48", placeholder: "Kunde / Bauherr", disabled: activeVersion.status === "approved" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: "Version:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: projectHeader.version, onChange: (e) => setProjectHeader({ ...projectHeader, version: e.target.value }), className: "bg-transparent text-sm font-medium outline-none text-text-primary border-b border-transparent focus:border-accent-ai/50 py-1 w-16", placeholder: "v1.0", disabled: activeVersion.status === "approved" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm font-bold text-text-muted cursor-pointer hover:text-text-primary transition-colors bg-background border border-border/50 px-3 py-2 rounded-lg shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: includeOptions, onChange: (e) => setIncludeOptions(e.target.checked), className: "rounded border-border text-accent-ai focus:ring-accent-ai w-4 h-4 cursor-pointer" }),
            "Optionen einrechnen"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left border-collapse bg-surface", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-text-muted bg-background border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-16", children: t("pos") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: t("description") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right w-24", children: t("qty") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-24", children: t("unit") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right w-24", children: t("unit_price") }),
            includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right w-24 text-accent-ai", children: "Option" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "px-4 py-3 text-right w-36 text-blue-400", children: [
              t("total"),
              " (CHF)"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/30", children: [
            budgetGroups.map((group) => {
              const groupPlanTotal = calculateGroupTotal(group);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-blue-500/10 border-y border-blue-500/20 group relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-blue-400", children: group.pos }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-blue-400", colSpan: includeOptions ? 5 : 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "bg-transparent text-blue-400 border-none outline-none w-full font-bold", value: group.title, onChange: (e) => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: v.groups.map((g) => g.id === group.id ? { ...g, title: e.target.value } : g) } : v)), disabled: activeVersion.status === "approved" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-bold text-right text-blue-400 relative", children: [
                    formatCHF(groupPlanTotal),
                    !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteGroup(group.id), className: "absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 no-print", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
                  ] })
                ] }),
                group.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/5 transition-colors group/row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-xs text-text-muted font-medium", children: item.pos }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: item.description, onChange: (e) => handleBudgetChange(group.id, item.id, "description", e.target.value), className: "w-full bg-transparent outline-none focus:border-b focus:border-accent-ai/50 py-1 font-medium text-text-primary", disabled: activeVersion.status === "approved", placeholder: t("description") }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: item.qty || "", onChange: (e) => handleBudgetChange(group.id, item.id, "qty", e.target.value), className: cn(numberInputClass, "font-medium text-text-primary"), disabled: activeVersion.status === "approved" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: item.unit, onChange: (e) => handleBudgetChange(group.id, item.id, "unit", e.target.value), className: "bg-transparent text-text-primary outline-none w-full appearance-none cursor-pointer font-medium", disabled: activeVersion.status === "approved", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-surface", children: "Std." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-surface", children: "Stk." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-surface", children: "Pauschal" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-surface", children: "m2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-surface font-bold text-accent-ai", children: "Option" })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: item.unitPrice || "", onChange: (e) => handleBudgetChange(group.id, item.id, "unitPrice", e.target.value), className: cn(numberInputClass, "font-medium text-text-primary"), disabled: activeVersion.status === "approved" }) }),
                  includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right bg-accent-ai/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: item.option > 0 ? "text-accent-ai font-bold" : "text-text-muted font-medium", children: item.option > 0 ? formatCHF(item.option) : "-" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right font-bold relative text-text-primary", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: item.option > 0 ? "text-accent-ai" : "", children: formatCHF(item.total + (includeOptions ? item.option : 0)) }),
                    !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: v.groups.map((g) => g.id === group.id ? { ...g, items: g.items.filter((i) => i.id !== item.id) } : g) } : v)), className: "absolute right-1 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover/row:opacity-100 p-1 no-print", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
                  ] })
                ] }, item.id)),
                !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "no-print", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: includeOptions ? 7 : 6, className: "px-4 py-3 bg-background/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: v.groups.map((g) => g.id === group.id ? { ...g, items: [...g.items, { id: `i${Date.now()}`, pos: `${g.pos.substring(0, 1)}0${g.items.length + 1}`, description: "", qty: 1, unit: "Stk.", unitPrice: 0, option: 0, total: 0 }] } : g) } : v)), className: "text-xs font-bold flex items-center gap-1 text-accent-ai hover:underline", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
                  " ",
                  t("add_position")
                ] }) }) })
              ] }, group.id);
            }),
            !isReadOnly && activeVersion.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "no-print", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: includeOptions ? 7 : 6, className: "px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, groups: [...v.groups, { id: `g${Date.now()}`, pos: `${v.groups.length + 1}00`, title: t("new_phase"), items: [] }] } : v)), className: "w-full py-3 border border-dashed border-accent-ai/30 text-accent-ai rounded-lg font-bold hover:bg-accent-ai/5 flex justify-center items-center gap-2 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 18 }),
              " ",
              t("new_phase")
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tfoot", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-background border-t-2 border-border/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-4 py-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-right text-xs uppercase font-bold text-text-muted whitespace-nowrap", children: t("subtotal") }),
              includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-right font-bold text-sm text-accent-ai whitespace-nowrap", children: formatCHF(budgetGroups.reduce((sum, group) => sum + group.items.reduce((s, item) => s + item.option, 0), 0)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-right font-bold text-sm text-text-primary whitespace-nowrap", children: formatCHF(totalBudget) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-background border-b border-border/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-4 py-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right text-xs uppercase font-semibold text-text-muted flex justify-end items-center gap-2 whitespace-nowrap", children: [
                t("vat"),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: vatRate, onChange: (e) => setVersions(versions.map((v) => v.id === activeVersionId ? { ...v, vatRate: Number(e.target.value) } : v)), className: cn(numberInputClass, "font-medium w-16 px-2 py-1 rounded border border-border/50 bg-surface outline-none text-text-primary"), disabled: activeVersion.status === "approved" }),
                "%"
              ] }),
              includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsx("td", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-medium text-sm text-text-muted whitespace-nowrap", children: formatCHF(totalBudget * (vatRate / 100)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-surface border-b-2 border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-4 py-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-5 text-right font-bold text-sm uppercase text-text-primary whitespace-nowrap", children: t("total_amount") }),
              includeOptions && /* @__PURE__ */ jsxRuntimeExports.jsx("td", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-5 text-right font-bold text-sm text-blue-400 whitespace-nowrap", children: formatCHF(totalBudget * (1 + vatRate / 100)) })
            ] })
          ] })
        ] }) })
      ] }) }) }),
      activeTab === "control" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl shadow-lg mt-4 lg:mt-0 w-full overflow-hidden flex flex-col p-4 lg:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-6", children: t("payment_control") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full overflow-x-auto custom-scrollbar pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-[800px] lg:min-w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left border-collapse", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-surface border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-16 text-text-muted uppercase tracking-wider", children: t("pos") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-text-muted uppercase tracking-wider min-w-[200px]", children: t("description") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32", children: t("planned") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-red-500 uppercase tracking-wider w-32", children: t("actual_costs") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32", children: t("variance") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/30", children: [
            approvedVersions.map((version) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-accent-ai/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 5, className: "px-4 py-2 font-bold text-xs uppercase text-accent-ai tracking-widest", children: [
                t("budget_supplement"),
                " ",
                version.name
              ] }) }),
              version.groups.map((group) => {
                const plan = calculateGroupTotal(group);
                const actual = getAllTimeActualCostForGroup(group);
                const diff = plan - actual;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-surface/50 border-t border-border/50", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-text-primary", children: group.pos }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-text-primary", children: group.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-right text-text-primary", children: formatCHF(plan) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-right text-red-500", children: formatCHF(actual) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: cn("px-4 py-3 font-bold text-right", diff < 0 ? "text-red-500" : "text-emerald-500"), children: [
                      diff >= 0 ? "+" : "",
                      formatCHF(diff)
                    ] })
                  ] }),
                  group.items.map((item) => {
                    const itemActual = getAllTimeActualCostForItem(item.id);
                    const itemDiff = item.total - itemActual;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/5 transition-colors", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-xs text-text-muted font-medium", children: item.pos }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-text-primary font-medium", children: item.description }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-text-primary", children: formatCHF(item.total) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-red-500", children: itemActual > 0 ? formatCHF(itemActual) : "-" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: cn("px-4 py-2 text-right font-medium", itemDiff < 0 ? "text-red-500" : "text-emerald-500"), children: [
                        itemDiff >= 0 ? "+" : "",
                        formatCHF(itemDiff)
                      ] })
                    ] }, item.id);
                  })
                ] }, group.id);
              })
            ] }, version.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-orange-500/10 border-y-2 border-orange-500/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-orange-500", children: "HR" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-bold text-orange-500", children: [
                t("internal_hours_time_tracking"),
                " (",
                allTimeHours,
                " h)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-right text-orange-500", children: "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-right text-red-500", children: formatCHF(allTimeHoursCost) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-bold text-right text-red-500", children: [
                "-",
                formatCHF(allTimeHoursCost)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-surface border-t-2 border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "px-4 py-5 text-right font-black uppercase tracking-wider text-text-primary", children: t("total_project_excl_vat") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-5 text-right font-black text-text-primary", children: formatCHF(overviewTotalBudget) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-5 text-right font-black text-red-500", children: formatCHF(totalActualCostsIncludingHoursAllTime) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: cn("px-4 py-5 text-right font-black", overviewTotalBudget - totalActualCostsIncludingHoursAllTime < 0 ? "text-red-500" : "text-emerald-500"), children: [
              overviewTotalBudget - totalActualCostsIncludingHoursAllTime >= 0 ? "+" : "",
              formatCHF(overviewTotalBudget - totalActualCostsIncludingHoursAllTime)
            ] })
          ] }) })
        ] }) }) }),
        approvedVersions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-2xl bg-surface/30 text-text-muted sticky left-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 48, className: "mb-4 opacity-50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold mb-2 text-text-primary", children: t("payment_control_inactive") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: t("payment_control_inactive_desc") })
        ] })
      ] }),
      activeTab === "cashflow" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl shadow-lg mt-4 lg:mt-0 w-full overflow-hidden flex flex-col p-4 lg:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-6", children: t("cashflow") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full overflow-x-auto custom-scrollbar pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-[800px] lg:min-w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left border-collapse", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-surface border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-text-muted uppercase tracking-wider w-32", children: t("date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-text-muted uppercase tracking-wider min-w-[200px]", children: t("description") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-text-muted uppercase tracking-wider w-48", children: t("budget_assignment") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32", children: t("credit_revenue") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32", children: t("debit_costs") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-text-muted uppercase tracking-wider w-32", children: t("balance_profit") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/30", children: [
            displayLedger.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-4 py-8 text-center text-text-muted italic", children: t("no_bookings_period") }) }),
            displayLedger.map((tx) => {
              const isQuote = tx.category === "Offerte" || tx.category === "Quote";
              const isTime = !!tx.isTimeEntry;
              const isRevenue = tx.category === "Debitorenrechnung" || tx.category === "Outgoing Invoice" || !isQuote && !isTime && tx.amount > 0;
              const displayAmount = tx.amount === 0 ? 0 : Math.abs(tx.amount);
              const bdDetails = getBudgetDetails(tx.budgetPosId);
              const isBalanceNegative = 0 > tx.balance;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/5 transition-colors group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-text-muted font-medium flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteTransaction(tx.id), className: "opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }),
                  tx.date
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-text-primary", children: tx.description }),
                  tx.url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: tx.url, target: "_blank", rel: "noopener noreferrer", className: "text-accent-ai hover:underline p-1 bg-accent-ai/10 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14 }) })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-text-muted font-medium", children: bdDetails ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: bdDetails.phase }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary font-bold truncate max-w-[150px]", children: bdDetails.item })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic opacity-50", children: t("free_booking") }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-bold text-emerald-500", children: isQuote ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-muted italic", children: [
                  "(",
                  formatCHF(displayAmount),
                  ")"
                ] }) : isRevenue && displayAmount > 0 ? `+ ${formatCHF(displayAmount)}` : "" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-bold text-red-500", children: !isQuote && !isRevenue && displayAmount > 0 ? `- ${formatCHF(displayAmount)}` : "" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: cn("px-4 py-3 text-right font-bold", isQuote ? "text-text-muted" : isBalanceNegative ? "text-red-500" : "text-emerald-500"), children: isQuote ? "-" : formatCHF(tx.balance) })
              ] }, tx.id);
            })
          ] })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UniversalPDFStudio,
      {
        isOpen: isPdfStudioOpen,
        onClose: () => setIsPdfStudioOpen(false),
        title: t("finance_budget"),
        fileName: `Finanzen_${activeTab}_${Date.now()}`,
        onSaveCloud: handleSavePdfToCloud,
        children: (settings) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          FinancePDFDocument,
          {
            settings,
            activeTab,
            t,
            projectHeader,
            budgetGroups,
            approvedVersions,
            allTimeHours,
            allTimeHoursCost,
            displayLedger,
            getBudgetDetails,
            overviewTotalBudget,
            totalActualCostsIncludingHoursAllTime,
            totalBudget,
            vatRate,
            formatCHF,
            calculateGroupTotal,
            getAllTimeActualCostForGroup,
            getAllTimeActualCostForItem
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UniversalPDFStudio,
      {
        isOpen: isReceiptPdfStudioOpen,
        onClose: () => setIsReceiptPdfStudioOpen(false),
        title: "Buchungsbeleg",
        fileName: `Buchung_${incomingData.vendor.replace(/\s/g, "_")}_${Date.now()}`,
        onSaveCloud: handleSaveReceiptPdfToCloud,
        children: (settings) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReceiptPDFDocument,
          {
            settings,
            incomingData,
            incomingReceipts,
            formatCHF,
            projectHeader,
            budgetDetails: getBudgetDetails(incomingData.budgetPosId),
            receiptType
          }
        )
      }
    ),
    isMounted && showTimeModal && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 flex justify-between items-center bg-surface/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2 text-text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "text-orange-400", size: 18 }),
            " ",
            t("book_hours")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowTimeModal(false), className: "text-text-muted hover:text-text-primary p-1 rounded-md bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "time-form", onSubmit: handleTimeSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-background border border-border/50 rounded-lg p-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTimeData({ ...timeData, type: "internal" }), className: cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", timeData.type === "internal" ? "bg-orange-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary"), children: t("simple_internal") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTimeData({ ...timeData, type: "external" }), className: cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", timeData.type === "external" ? "bg-orange-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary"), children: t("detailed_external") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block", children: "Ressource" }),
              timeData.type === "internal" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: timeData.userId, onChange: (e) => setTimeData({ ...timeData, userId: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, className: "bg-surface", children: "Mitarbeiter wählen..." }),
                projectMembers?.filter((m) => m.projectId === currentProjectId).map((member) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: member.userId, className: "bg-surface", children: member.userEmail || member.userId }, member.userId))
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, placeholder: "Partner Firma", value: timeData.company, onChange: (e) => setTimeData({ ...timeData, company: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block", children: "Datum" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", required: true, value: timeData.date, onChange: (e) => setTimeData({ ...timeData, date: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block", children: "Stunden (h)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.25", min: "0.25", required: true, value: timeData.hours || "", onChange: (e) => setTimeData({ ...timeData, hours: Number(e.target.value) }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none", placeholder: "z.B. 4.5" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block", children: "Stundensatz (CHF)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", required: true, value: timeData.hourlyRate || "", onChange: (e) => setTimeData({ ...timeData, hourlyRate: Number(e.target.value) }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none", placeholder: "z.B. 120" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block", children: "Beschreibung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { required: true, value: timeData.description, onChange: (e) => setTimeData({ ...timeData, description: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-text-primary outline-none resize-none h-20", placeholder: "Was wurde gemacht..." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border bg-surface flex justify-end gap-3 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowTimeModal(false), className: "px-5 py-2 text-sm font-bold text-text-muted border border-border rounded-lg hover:text-text-primary transition-colors", children: t("cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { form: "time-form", type: "submit", disabled: isSubmitting, className: "px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50", children: [
            isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }),
            " Buchen"
          ] })
        ] })
      ] }) }),
      document.body
    ),
    isMounted && showReceiptStudio && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "bg-surface border border-border rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col lg:flex-row overflow-hidden max-h-[95vh] h-full lg:h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full lg:w-5/12 p-6 border-b lg:border-b-0 lg:border-r border-border bg-background/50 flex flex-col overflow-y-auto custom-scrollbar", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-lg mb-6 flex items-center gap-2 text-text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "text-red-500" }),
            " ",
            t("receipts_photos")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-6 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col items-center justify-center bg-surface border border-border rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-colors shadow-sm relative overflow-hidden group", children: [
              isAnalyzingAI && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "text-red-500 animate-spin mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-red-500 uppercase tracking-widest text-center", children: t("analyzing_ai") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 24, className: "text-blue-500 mb-2 group-hover:scale-110 transition-transform" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-center", children: t("take_photo") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", capture: "environment", className: "hidden", onChange: handleLocalImageUpload })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col items-center justify-center bg-surface border border-border rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-colors shadow-sm relative overflow-hidden group", children: [
              isAnalyzingAI && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "text-red-500 animate-spin mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-red-500 uppercase tracking-widest text-center", children: t("analyzing_ai") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 24, className: "text-emerald-500 mb-2 group-hover:scale-110 transition-transform" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-center", children: "Datei wählen" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,application/pdf", className: "hidden", onChange: handleLocalImageUpload, multiple: true })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center shrink-0 mb-6 relative overflow-hidden", children: [
            isAnalyzingAI && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 32, className: "text-red-500 animate-spin mb-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-red-500 uppercase tracking-widest text-center", children: t("analyzing_ai") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-3 rounded-xl shadow-lg mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, { value: mobileUploadUrl, size: 120 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-text-primary mb-1", children: "Smartphone Scanner" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-text-muted leading-relaxed max-w-[200px]", children: "QR Code scannen, um Belege per Handy-Kamera direkt hierher zu senden." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-h-0 flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-bold text-text-muted uppercase tracking-widest mb-3 shrink-0", children: "Gescannte Belege" }),
            incomingReceipts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-text-muted text-xs p-6 text-center", children: "Noch keine Belege hochgeladen." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 pb-4", children: incomingReceipts.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square rounded-xl overflow-hidden border border-border shadow-sm group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, className: "w-full h-full object-cover", alt: "Beleg" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIncomingReceipts(incomingReceipts.filter((_, idx) => idx !== i)), className: "absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }, i)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full lg:w-7/12 flex flex-col h-full bg-surface", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-border/50 flex justify-between items-center shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-text-primary", children: "Buchungsdetails" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowReceiptStudio(false), className: "p-2 bg-background border border-border rounded-lg hover:text-red-500 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-6 custom-scrollbar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-background border border-border/50 rounded-lg p-1 mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                setReceiptType("expense");
                setIncomingData({ ...incomingData, type: "internal" });
              }, className: cn("flex-1 py-2 text-xs font-bold rounded-md transition-all", receiptType === "expense" ? "bg-red-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary"), children: "Intern (Spesen)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                setReceiptType("external_cost");
                setIncomingData({ ...incomingData, type: "external" });
              }, className: cn("flex-1 py-2 text-xs font-bold rounded-md transition-all", receiptType === "external_cost" ? "bg-red-500 text-white shadow-sm" : "text-text-muted hover:text-text-primary"), children: "Externer Kreditor" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block", children: t("vendor_company") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: incomingData.vendor, onChange: (e) => setIncomingData({ ...incomingData, vendor: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-red-500/50 transition-colors", placeholder: "Name des Lieferanten / Shops" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block", children: t("date") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: incomingData.date, onChange: (e) => setIncomingData({ ...incomingData, date: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-red-500/50 transition-colors" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block text-red-500", children: t("amount_chf") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.05", value: incomingData.amount, onChange: (e) => setIncomingData({ ...incomingData, amount: e.target.value }), className: "w-full bg-red-500/5 border border-red-500/30 rounded-lg px-4 py-2.5 text-sm font-bold text-red-500 outline-none focus:border-red-500 transition-colors placeholder:text-red-500/30", placeholder: "0.00" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block", children: t("description") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: incomingData.description, onChange: (e) => setIncomingData({ ...incomingData, description: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm font-medium text-text-primary outline-none resize-none h-20 focus:border-red-500/50 transition-colors", placeholder: "Wofür war diese Ausgabe?" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block", children: t("budget_assignment") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: incomingData.budgetPosId, onChange: (e) => setIncomingData({ ...incomingData, budgetPosId: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", className: "bg-surface", children: t("free_booking") }),
                    approvedVersions.flatMap((v) => v.groups).flatMap((g) => g.items).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: item.id, className: "bg-surface", children: [
                      item.pos,
                      " ",
                      item.description
                    ] }, item.id))
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block", children: t("status") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: incomingData.status, onChange: (e) => setIncomingData({ ...incomingData, status: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm font-bold text-text-primary outline-none cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Offen", className: "bg-surface", children: t("open") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Bezahlt", className: "bg-surface", children: t("paid") })
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 border-t border-border/50 bg-background/30 flex justify-end shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsReceiptPdfStudioOpen(true), disabled: !incomingData.vendor || !incomingData.amount || isSubmitting, className: "w-full sm:w-auto px-8 py-3.5 bg-red-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50", children: [
            isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 18 }),
            " ",
            t("generate_pdf_book")
          ] }) })
        ] })
      ] }) }),
      document.body
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
      showInvoiceModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
        InvoiceStudio,
        {
          type: "invoice",
          onClose: () => setShowInvoiceModal(false),
          onSave: handleSaveGeneratedInvoice,
          budgetData: versions.find((v) => v.id === activeVersionId)
        }
      ),
      showQuoteModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
        InvoiceStudio,
        {
          type: "quote",
          onClose: () => setShowQuoteModal(false),
          onSave: handleSaveGeneratedQuote,
          budgetData: versions.find((v) => v.id === activeVersionId)
        }
      )
    ] })
  ] });
}

export { Finance as default };
