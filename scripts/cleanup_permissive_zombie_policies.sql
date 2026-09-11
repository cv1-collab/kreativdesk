-- ============================================================================
-- MANDANTEN-SICHERHEIT: ALTE OFFENE POLICIES BEREINIGEN
-- ============================================================================
-- Entfernt verwaiste 'Allow ... for authenticated' Policies, welche die
-- 'Strict company isolation' Richtlinien unbemerkt ausgehebelt hatten.
-- ============================================================================

-- A) API Keys
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.api_keys;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.api_keys;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.api_keys;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.api_keys;

-- B) Audio Notes
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.audio_notes;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.audio_notes;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.audio_notes;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.audio_notes;

-- C) Audit Logs
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.audit_logs;

-- D) CAD Pläne
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.cad_plans;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.cad_plans;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.cad_plans;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.cad_plans;

-- E) Kalenderevents
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.calendar_events;

-- F) Chat Nachrichten
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.chat_messages;

-- G) Firmen (Companies)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.companies;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.companies;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.companies;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.companies;

-- H) Firmeneinstellungen
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.company_settings;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.company_settings;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.company_settings;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.company_settings;

-- I) Firmenbenutzer (Company Users)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.company_users;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.company_users;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.company_users;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.company_users;

-- J) Mängel (Defects)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.defects;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.defects;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.defects;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.defects;

-- K) Dokumente
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.documents;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.documents;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.documents;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.documents;

-- L) Embeddings
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.embeddings;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.embeddings;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.embeddings;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.embeddings;

-- M) Ziele (Goals)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.goals;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.goals;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.goals;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.goals;

-- N) Einladungen (Invites)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.invites;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.invites;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.invites;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.invites;

-- O) Knowledge Docs
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.knowledge_docs;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.knowledge_docs;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.knowledge_docs;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.knowledge_docs;

-- P) Leads
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.leads;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.leads;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.leads;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.leads;

-- Q) Benachrichtigungen (Notifications)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.notifications;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.notifications;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.notifications;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.notifications;
DROP POLICY IF EXISTS "Allow public select" ON public.notifications;

-- R) Profile (Profiles)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.profiles;

-- S) Projektmitglieder (Project Members)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.project_members;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.project_members;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.project_members;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.project_members;

-- T) Bauzeitenpläne (Project Schedules)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.project_schedules;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.project_schedules;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.project_schedules;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.project_schedules;

-- U) Projekte (Projects)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.projects;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.projects;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.projects;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.projects;
DROP POLICY IF EXISTS "Projects viewable by company members" ON public.projects;

-- V) Site Data
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.site_data;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.site_data;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.site_data;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.site_data;

-- W) Slides
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.slides;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.slides;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.slides;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.slides;

-- X) Support Tickets
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.support_tickets;

-- Y) Zeiteinträge (Time Entries)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.time_entries;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.time_entries;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.time_entries;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.time_entries;

-- Z) Finanzen & Buchhaltung (Transactions)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.transactions;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.transactions;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.transactions;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.transactions;

-- AA) Video Calls
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.video_calls;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.video_calls;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.video_calls;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.video_calls;

-- AB) Whiteboard Exports
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.whiteboard_exports;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.whiteboard_exports;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.whiteboard_exports;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.whiteboard_exports;
