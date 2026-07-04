export const SUPER_ADMIN_EMAILS = [
  'cv1@gmx.ch',
  'carlo@vesciodesign.ch'
];

export const checkIsSuperAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
};
