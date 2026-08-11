import { sendNotification } from '../lib/notifications';

/**
 * Triggers an app notification and sets the red badge on the Documents menu
 * whenever a new document (Invoice, Quote, Expense, Operating Cost, etc.) is created.
 */
export const notifyNewDocument = async (
  companyId: string, 
  docName: string, 
  category: string, 
  projectId?: string
) => {
  if (!companyId) return;

  // 1. Send app notification
  try {
    const categoryLabel = category === 'Debitorenrechnung' ? 'Rechnung' :
                         category === 'Offerte' ? 'Offerte' :
                         category === 'Spesen' ? 'Spesenabrechnung' :
                         category === 'operating_cost' || category === 'Kreditorenrechnung' ? 'Externe Kosten' : 'Dokument';
    
    await sendNotification({
      companyId,
      title: `Neues Dokument: ${docName}`,
      message: `${categoryLabel} wurde im Datenraum abgelegt.`,
      type: 'info',
      link: projectId && projectId !== 'global' ? `/project/${projectId}/documents` : '/app'
    });
  } catch (err) {
    console.warn("Error sending document notification:", err);
  }

  // 2. Set red badge in localStorage and dispatch CustomEvent for real-time sidebar badge
  try {
    localStorage.setItem('has_new_document', 'true');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('doc_created', { detail: { docName, category, companyId } }));
    }
  } catch (err) {
    console.warn("Error setting doc badge:", err);
  }
};
