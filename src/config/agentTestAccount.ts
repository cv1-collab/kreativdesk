/**
 * Permanent AI Agent Test Account
 * Used for automated E2E tests, system audits, and verification workflows.
 * Configured in Supabase Auth and public.profiles under 'Kreativ Desk OS'.
 */
export const AGENT_TEST_ACCOUNT = {
  email: (typeof process !== 'undefined' && process.env?.AGENT_TEST_EMAIL) || 'agent.test@kreativdesk.ch',
  password: (typeof process !== 'undefined' && process.env?.AGENT_TEST_PASSWORD) || '',
  name: 'AI Test Agent',
  role: 'admin',
  companyId: 'dce2daae-e8d5-4596-a264-a3fcdb326a6c', // Kreativ Desk OS
  companyName: 'Kreativ Desk OS',
  plan: 'Enterprise'
} as const;

export type AgentTestAccount = typeof AGENT_TEST_ACCOUNT;
