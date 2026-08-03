import { supabase } from '../lib/supabase';

export type PlanType = 'Starter' | 'Pro' | 'Expert' | 'Studio' | 'Agency' | 'Enterprise';
export type BillingInterval = 'month' | 'year';

const PRICING_MATRIX: Record<PlanType, Record<BillingInterval, string>> = {
  Starter: { month: 'price_1TdyXhQTfAtOGrggdoSEPjWr', year: 'price_1TdyYYQTfAtOGrggNecH3ItP' },
  Pro: { month: 'price_1TcizpQTfAtOGrggKGYLMG4c', year: 'price_1TdyU4QTfAtOGrggIvnyXe2j' },
  Expert: { month: 'price_1TdyaEQTfAtOGrggpbWcVles', year: 'price_1TdyaxQTfAtOGrggbeJBPDFY' },
  Studio: { month: '', year: '' },
  Agency: { month: '', year: '' },
  Enterprise: { month: '', year: '' }
};

export const initiateSubscriptionCheckout = async (planName: PlanType, interval: BillingInterval, uid: string, email: string) => {
  if (['Studio', 'Agency', 'Enterprise'].includes(planName)) {
    window.location.href = '/lead-form'; 
    return;
  }

  const priceId = PRICING_MATRIX[planName][interval];
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || '';

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planName, priceId })
    });
    
    if (!response.ok) throw new Error('Checkout API Fehler');
    
    const resData = await response.json();
    if (resData.url) window.location.assign(resData.url);
  } catch (error) {
    console.error('Fehler:', error);
    throw error;
  }
};

export const openCustomerPortal = async (stripeCustomerId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || '';

    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ customerId: stripeCustomerId })
    });
    if (!response.ok) throw new Error('Portal API Fehler');
    const resData = await response.json();
    if (resData.url) window.location.assign(resData.url);
  } catch (error) {
    console.error('Fehler:', error);
    throw error;
  }
};