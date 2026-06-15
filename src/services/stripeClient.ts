export type PlanType = 'Starter' | 'Pro' | 'Expert' | 'Studio' | 'Agency' | 'Enterprise';
export type BillingInterval = 'month' | 'year';

const PRICING_MATRIX: Record<PlanType, Record<BillingInterval, string>> = {
  // 1. AUTOMATISIERT: Diese drei nutzen Stripe (Trage hier deine echten Stripe-IDs ein)
  Starter: { month: 'price_1TdyXhQTfAtOGrggdoSEPjWr', year: 'price_1TdyYYQTfAtOGrggNecH3ItP' },
  Pro: { month: 'price_1TcizpQTfAtOGrggKGYLMG4c', year: 'price_1TdyU4QTfAtOGrggIvnyXe2j' },
  Expert: { month: 'price_1TdyaEQTfAtOGrggpbWcVles', year: 'price_1TdyaxQTfAtOGrggbeJBPDFY' },
  
  // 2. MANUELL: Diese drei werden manuell verwaltet und gehen über das Lead-Formular (Bleiben LEER!)
  Studio: { month: '', year: '' },
  Agency: { month: '', year: '' },
  Enterprise: { month: '', year: '' }
};

export const initiateSubscriptionCheckout = async (planName: PlanType, interval: BillingInterval, uid: string, email: string) => {
  // Wenn es ein manueller High-Ticket-Plan ist, navigiere direkt zum Lead-Formular!
  if (['Studio', 'Agency', 'Enterprise'].includes(planName)) {
    window.location.href = '/lead-form'; 
    return;
  }

  // Automatisierter Stripe-Workflow (nur für Starter, Pro, Expert)
  const priceId = PRICING_MATRIX[planName][interval];
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, planName, uid, priceId, interval })
    });
    
    if (!response.ok) throw new Error('Checkout API Fehler');
    
    const session = await response.json();
    if (session.url) window.location.assign(session.url);
  } catch (error) {
    console.error('Fehler:', error);
    throw error;
  }
};

export const openCustomerPortal = async (stripeCustomerId: string) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: stripeCustomerId })
    });
    if (!response.ok) throw new Error('Portal API Fehler');
    const session = await response.json();
    if (session.url) window.location.assign(session.url);
  } catch (error) {
    console.error('Fehler:', error);
    throw error;
  }
};