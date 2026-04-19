// ─── CJ Dropshipping API ──────────────────────────────────────────────────────
// Docs : https://developers.cjdropshipping.com/

const CJ_BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';

let _accessToken: string | null = null;
let _tokenExpiry: number = 0;

// Auth : obtenir un token d'accès
async function getAccessToken(): Promise<string> {
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;

  const res = await fetch(`${CJ_BASE_URL}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.CJ_EMAIL,
      password: process.env.CJ_API_KEY,
    }),
  });

  const data = await res.json();
  if (!data.result) throw new Error(`CJ Auth failed: ${data.message}`);

  _accessToken = data.data.accessToken;
  _tokenExpiry = Date.now() + (data.data.accessTokenExpiryDate - 60) * 1000;
  return _accessToken!;
}

export interface CJOrderItem {
  vid: string;           // CJ variant ID
  quantity: number;
  shippingName: string;
}

export interface CJShippingAddress {
  firstName: string;
  lastName: string;
  country: string;       // ex: "FR"
  province: string;
  city: string;
  address: string;
  zip: string;
  phone: string;
  email: string;
}

// Passer une commande chez CJ Dropshipping
export async function createCJOrder({
  orderNumber,
  items,
  shippingAddress,
}: {
  orderNumber: string;
  items: CJOrderItem[];
  shippingAddress: CJShippingAddress;
}): Promise<{ cjOrderId: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${CJ_BASE_URL}/shopping/order/createOrderV2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CJ-Access-Token': token,
    },
    body: JSON.stringify({
      orderNumber,
      shippingAddress,
      products: items,
    }),
  });

  const data = await res.json();
  if (!data.result) {
    throw new Error(`CJ Order failed: ${data.message}`);
  }

  return { cjOrderId: data.data.orderId };
}

// Récupérer les infos de suivi d'une commande
export async function getCJOrderTracking(cjOrderId: string) {
  const token = await getAccessToken();

  const res = await fetch(
    `${CJ_BASE_URL}/shopping/order/getOrderDetail?orderId=${cjOrderId}`,
    {
      headers: { 'CJ-Access-Token': token },
    }
  );

  const data = await res.json();
  if (!data.result) throw new Error(`CJ Tracking failed: ${data.message}`);

  return data.data;
}
