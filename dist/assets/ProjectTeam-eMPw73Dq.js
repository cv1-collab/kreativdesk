import { j as jsxRuntimeExports, aP as UserPlus, w as Shield, T as Trash2, X, L as LoaderCircle } from './vendor-ui-B7yEkTas.js';
import { h as useParams, r as reactExports, d as reactDomExports } from './vendor-core-egDwzlzP.js';
import { b as useProject, a as useAuth, g as useToast, u as useLanguage, c as cn, f as db } from './index-CYJ5UA-3.js';
import { s as setDoc, e as doc } from './vendor-firebase-CKkb2kaw.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';

const localTranslations = {
  en: {
    project_team: "Project Team",
    team_desc: "Manage project access and roles.",
    add_person: "Add Person",
    name: "Name",
    company_role: "Company Role",
    project_role: "Project Role",
    actions: "Actions",
    viewer_role: "Viewer (Read-only)",
    editor_role: "Editor (Can edit data)",
    admin_role: "Admin (Can manage team)",
    owner_role: "Owner (Full control)",
    no_team_members: "No team members yet.",
    remove: "Remove",
    existing_user: "Select existing",
    new_user: "Invite new",
    search_contacts: "Search contacts...",
    select_person: "-- Select Person --",
    email: "Email",
    company_role_label: "Company Role",
    cancel: "Cancel",
    processing: "Processing...",
    invite_and_add: "Invite & Add",
    save: "Save",
    upload_success: "Successfully added!",
    upload_failed: "Action failed.",
    delete_confirm: "Are you sure?",
    completed: "completed",
    role_external: "External Partner",
    role_client: "Client / Owner",
    role_internal: "Internal Employee"
  },
  de: {
    project_team: "Projekt Team",
    team_desc: "Verwalte Projektzugriffe und Rollen.",
    add_person: "Person hinzufügen",
    name: "Name",
    company_role: "Rolle (Firma)",
    project_role: "Projekt-Rolle",
    actions: "Aktionen",
    viewer_role: "Viewer (Nur Lesezugriff)",
    editor_role: "Editor (Darf Daten ändern)",
    admin_role: "Admin (Darf Team verwalten)",
    owner_role: "Owner (Volle Kontrolle)",
    no_team_members: "Noch keine Teammitglieder.",
    remove: "Entfernen",
    existing_user: "Bestehenden wählen",
    new_user: "Neuen einladen",
    search_contacts: "Kontakte suchen...",
    select_person: "-- Person auswählen --",
    email: "E-Mail",
    company_role_label: "Firma Rolle",
    cancel: "Abbrechen",
    processing: "Verarbeite...",
    invite_and_add: "Einladen & Hinzufügen",
    save: "Speichern",
    upload_success: "Erfolgreich hinzugefügt!",
    upload_failed: "Aktion fehlgeschlagen.",
    delete_confirm: "Bist du sicher?",
    completed: "abgeschlossen",
    role_external: "Externer Partner",
    role_client: "Bauherr / Kunde",
    role_internal: "Interner Mitarbeiter"
  }
};
function ProjectTeam({ projectId: propProjectId }) {
  const { projectId } = useParams();
  const { companyUsers = [], projectMembers = [], activeProjectId, addProjectMember, removeProjectMember } = useProject();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || (typeof globalT === "function" ? globalT(key) : key);
  const currentProjectId = propProjectId || projectId || activeProjectId;
  const currentMembers = (projectMembers || []).filter((m) => m.projectId === currentProjectId);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = reactExports.useState(false);
  const [addMode, setAddMode] = reactExports.useState("existing");
  const [selectedUserId, setSelectedUserId] = reactExports.useState("");
  const [newUserName, setNewUserName] = reactExports.useState("");
  const [newUserEmail, setNewUserEmail] = reactExports.useState("");
  const [newUserCompanyRole, setNewUserCompanyRole] = reactExports.useState("External Planner");
  const [selectedRole, setSelectedRole] = reactExports.useState("Viewer");
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const availableCompanyUsers = (companyUsers || []).filter((cu) => !currentMembers.some((cm) => cm.userId === cu.id));
  const handleAddExistingUser = async () => {
    if (!selectedUserId || !currentProjectId || !currentUser?.companyId) return;
    setIsProcessing(true);
    try {
      const selectedUser = companyUsers.find((u) => u.id === selectedUserId);
      await addProjectMember(currentProjectId, {
        userId: selectedUserId,
        userEmail: selectedUser?.email || "",
        projectRole: selectedRole,
        companyRole: selectedUser?.role || "External Partner"
      });
      addToast(t("upload_success"), "success");
      setIsAddMemberModalOpen(false);
      setSelectedUserId("");
    } catch (e) {
      console.error(e);
      addToast(t("upload_failed"), "error");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleAddNewUser = async () => {
    if (!newUserName || !newUserEmail || !currentProjectId || !currentUser?.companyId) return;
    setIsProcessing(true);
    try {
      const newUserId = `user-${Date.now()}`;
      await setDoc(doc(db, "companyUsers", newUserId), {
        id: newUserId,
        name: newUserName,
        email: newUserEmail,
        role: newUserCompanyRole,
        ownerId: currentUser.uid,
        companyId: currentUser.companyId
      });
      await addProjectMember(currentProjectId, {
        userId: newUserId,
        userEmail: newUserEmail,
        projectRole: selectedRole,
        companyRole: newUserCompanyRole
      });
      addToast(t("upload_success"), "success");
      setIsAddMemberModalOpen(false);
      setNewUserName("");
      setNewUserEmail("");
    } catch (e) {
      console.error(e);
      addToast(t("upload_failed"), "error");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (addMode === "existing") handleAddExistingUser();
    else handleAddNewUser();
  };
  const handleRemoveMember = async (userId) => {
    if (!window.confirm(t("delete_confirm"))) return;
    try {
      await removeProjectMember(currentProjectId, userId);
      addToast(t("remove") + " " + t("completed"), "success");
    } catch (e) {
      addToast(t("upload_failed"), "error");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col h-full bg-background text-text-primary min-h-0 relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col p-4 md:p-6 space-y-6 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: t("project_team") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm mt-1", children: t("team_desc") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsAddMemberModalOpen(true), className: "w-full md:w-auto px-5 py-3 md:py-2 bg-accent-ai text-white rounded-xl md:rounded-lg text-sm font-bold hover:bg-accent-ai/90 transition-all shadow-lg shadow-accent-ai/20 flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 18 }),
          " ",
          t("add_person")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-auto bg-surface border border-border rounded-2xl shadow-lg custom-scrollbar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hidden md:table w-full text-sm text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("company_role") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("project_role") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right font-semibold", children: t("actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
            currentMembers.map((member) => {
              const user = companyUsers.find((u) => u.id === member.userId);
              if (!user) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-background transition-colors group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-accent-ai/10 text-accent-ai flex items-center justify-center font-bold text-xs border border-accent-ai/20 shrink-0", children: user.name?.charAt(0).toUpperCase() || "U" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-text-primary", children: user.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-text-muted font-medium", children: user.email })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 14, className: "text-text-muted" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2 py-0.5 rounded text-xs font-bold border tracking-wide uppercase", user.role === "Internal" ? "bg-accent-ai/10 text-accent-ai border-accent-ai/20" : user.role === "Client" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"), children: user.role === "Internal" ? t("role_internal") : user.role === "Client" ? t("role_client") : t("role_external") })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: member.projectRole, onChange: (e) => setDoc(doc(db, "projectMembers", member.id), { projectRole: e.target.value }, { merge: true }), className: "bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-ai cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Viewer", children: t("viewer_role") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Editor", children: t("editor_role") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Admin", children: t("admin_role") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Owner", children: t("owner_role") })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRemoveMember(member.userId), className: "text-text-muted hover:text-red-500 p-2 rounded-md hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100", title: t("remove"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) }) })
              ] }, member.id);
            }),
            currentMembers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-6 py-12 text-center text-text-muted font-medium", children: t("no_team_members") }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden flex flex-col gap-4 p-4 pb-24", children: [
          currentMembers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-text-muted py-12 text-sm font-medium border-2 border-dashed border-border/50 rounded-2xl bg-surface/30", children: t("no_team_members") }),
          currentMembers.map((member) => {
            const user = companyUsers.find((u) => u.id === member.userId);
            if (!user) return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-accent-ai/10 text-accent-ai flex items-center justify-center font-bold text-lg border border-accent-ai/20", children: user.name?.charAt(0).toUpperCase() || "U" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-text-primary truncate text-base", children: user.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-text-muted truncate font-medium", children: user.email })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRemoveMember(member.userId), className: "text-text-muted hover:text-red-500 p-2 bg-background rounded-xl border border-border/50 transition-colors shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 18 }) })
            ] }) }, member.id);
          })
        ] })
      ] })
    ] }),
    isAddMemberModalOpen && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border-t sm:border border-border sm:rounded-3xl rounded-t-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-b border-border flex justify-between items-center bg-surface/50 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-text-primary flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 20, className: "text-accent-ai" }),
            " ",
            t("add_person")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsAddMemberModalOpen(false), className: "text-text-muted hover:text-text-primary transition-colors bg-background p-2 rounded-xl border border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex p-1.5 gap-1 bg-background border-b border-border shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAddMode("existing"), className: cn("flex-1 py-2.5 text-xs font-bold transition-all rounded-xl", addMode === "existing" ? "bg-surface text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary"), children: t("existing_user") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAddMode("new"), className: cn("flex-1 py-2.5 text-xs font-bold transition-all rounded-xl", addMode === "new" ? "bg-surface text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary"), children: t("new_user") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleFormSubmit, className: "p-6 space-y-6 bg-background/50 overflow-y-auto max-h-[60vh] custom-scrollbar", children: [
          addMode === "existing" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("search_contacts") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: selectedUserId, onChange: (e) => setSelectedUserId(e.target.value), className: "w-full bg-background border border-border/50 rounded-xl px-4 py-3.5 text-sm focus:border-accent-ai text-text-primary font-bold appearance-none cursor-pointer shadow-inner", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", className: "text-text-muted", children: t("select_person") }),
              availableCompanyUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: u.id, children: [
                u.name,
                " (",
                u.email,
                ")"
              ] }, u.id))
            ] }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: newUserName, onChange: (e) => setNewUserName(e.target.value), className: "w-full bg-background border border-border/50 rounded-xl py-3.5 px-4 text-sm font-bold focus:border-accent-ai text-text-primary shadow-inner" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("email") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, value: newUserEmail, onChange: (e) => setNewUserEmail(e.target.value), className: "w-full bg-background border border-border/50 rounded-xl py-3.5 px-4 text-sm font-bold focus:border-accent-ai text-text-primary shadow-inner" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("company_role_label") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: newUserCompanyRole, onChange: (e) => setNewUserCompanyRole(e.target.value), className: "w-full bg-background border border-border/50 rounded-xl py-3.5 px-4 text-sm font-bold focus:border-accent-ai text-text-primary appearance-none shadow-inner", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "External Planner", children: t("role_external") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Client", children: t("role_client") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Internal", children: t("role_internal") })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 mt-4", children: t("project_role") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: selectedRole, onChange: (e) => setSelectedRole(e.target.value), className: "w-full bg-background text-text-primary font-bold border border-border/50 rounded-xl px-4 py-3.5 text-sm focus:border-accent-ai appearance-none cursor-pointer shadow-inner", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Viewer", children: t("viewer_role") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Editor", children: t("editor_role") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Admin", children: t("admin_role") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Owner", children: t("owner_role") })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 pt-2 border-t border-border/50 bg-surface flex flex-col sm:flex-row justify-end gap-3 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsAddMemberModalOpen(false), className: "w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors border border-border sm:border-transparent rounded-xl", children: t("cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleFormSubmit,
              disabled: isProcessing || addMode === "existing" && !selectedUserId,
              className: "w-full sm:w-auto px-8 py-3.5 bg-accent-ai text-white rounded-xl text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg shadow-accent-ai/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              children: [
                isProcessing && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin" }),
                " ",
                isProcessing ? t("processing") : addMode === "new" ? t("invite_and_add") : t("save")
              ]
            }
          )
        ] })
      ] }) }),
      document.body
    )
  ] });
}

export { ProjectTeam as default };
