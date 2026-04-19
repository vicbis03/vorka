import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client public (côté navigateur)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

// Client admin (côté serveur uniquement — webhooks, API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  type: 'digital' | 'physical';
  download_url?: string;
  cj_product_id?: string;
  cj_variant_id?: string;
  stock: number;
  active: boolean;
}

export interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  customer_name?: string;
  shipping_address?: Record<string, string>;
  total_amount: number;
  status: 'pending' | 'paid' | 'fulfilled' | 'error';
  fulfillment_ref?: string;
}