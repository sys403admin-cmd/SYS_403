'use server';

import { supabase, getSupabaseAdmin } from './supabase';
import { Product, CustomOrder } from './store';
import { Resend } from 'resend';
import { getMatrixEmailTemplate } from './emails';

// Helper para inicializar Resend de forma segura
const initResend = () => {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
};

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) return [];
    return data as Product[];
  } catch (e) {
    return [];
  }
}

export async function submitOrder(order: any) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const resend = initResend();

    // Plan Candado: Mapeo EXPLICITO a minúsculas para PostgreSQL
    const dbOrder = {
      name: order.name || 'ANÓNIMO',
      email: order.email || 'N/A',
      whatsapp: order.whatsapp || 'N/A',
      garmenttype: order.garmentType || 'CAMISA',
      garmentcolor: order.garmentColor || '#FFFFFF',
      size: order.size || 'L',
      designs: JSON.stringify(order.designs || []),
      status: 'Pendiente',
      date: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([dbOrder])
      .select();

    if (error) throw new Error(`DB_ERROR: ${error.message}`);

    // Notificaciones (Solo si Resend está configurado)
    if (resend && order.email) {
      try {
        const html = getMatrixEmailTemplate(order, false);
        await resend.emails.send({
          from: 'SYS_403 <onboarding@resend.dev>',
          to: order.email,
          subject: `> BREACH_CONFIRMED // ${order.name}`,
          html: html,
        });

        const htmlAdmin = getMatrixEmailTemplate(order, true);
        await resend.emails.send({
          from: 'BUNKER_ALERT <onboarding@resend.dev>',
          to: 'sys.403admin@gmail.com',
          subject: `> INCOMING_ADN // ${order.name}`,
          html: htmlAdmin,
        });
      } catch (emailErr) {
        console.warn("Email Error:", emailErr);
      }
    }

    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('--- FALLA CRÍTICA BUNKER ---', error.message);
    return { success: false, error: error.message };
  }
}

export async function submitCatalogOrder(orderData: { 
  customer: any, 
  items: any[], 
  total: number 
}) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const resend = initResend();
    const { customer, items, total } = orderData;

    // 1. Descontar Stock y Registrar Pedido
    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.product.id)
        .single();

      if (product && product.stock >= item.quantity) {
        await supabaseAdmin
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product.id);
      }
    }

    // 2. Registrar en tabla orders
    const dbOrder = {
      name: customer.name,
      email: customer.email,
      whatsapp: customer.whatsapp,
      garmenttype: 'CATALOGO',
      garmentcolor: 'VARIOUS',
      size: 'VARIOUS',
      designs: JSON.stringify(items),
      status: 'Pendiente',
      date: new Date().toISOString()
    };

    const { data, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([dbOrder])
      .select();

    if (orderError) throw new Error(`ORDER_ERROR: ${orderError.message}`);

    // 3. Notificaciones
    if (resend && customer.email) {
      try {
        await resend.emails.send({
          from: 'SYS_403 <onboarding@resend.dev>',
          to: customer.email,
          subject: `> PEDIDO_RECIBIDO // ${customer.name}`,
          html: getMatrixEmailTemplate(orderData, false, true),
        });

        await resend.emails.send({
          from: 'BUNKER_ALERT <onboarding@resend.dev>',
          to: 'sys.403admin@gmail.com',
          subject: `> INCOMING_CATALOG_ADN // ${customer.name}`,
          html: getMatrixEmailTemplate(orderData, true, true),
        });
      } catch (emailErr) {
        console.warn("Email Error:", emailErr);
      }
    }

    return { success: true, orderId: data?.[0]?.id };
  } catch (error: any) {
    console.error('--- FALLA CRÍTICA PEDIDO CATALOGO ---', error.message);
    return { success: false, error: error.message };
  }
}

export async function uploadDNA(formData: FormData) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const fileBase64 = formData.get('file') as string;
    const fileName = formData.get('fileName') as string;
    
    if (!fileBase64) throw new Error('ADN_VACIO');

    const cleanName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filePath = `injections/${Date.now()}_${cleanName}`;
    const base64Data = fileBase64.split(',')[1];
    if (!base64Data) throw new Error('DATA_CORRUPTA');
    
    const buffer = Buffer.from(base64Data, 'base64');

    const { error } = await supabaseAdmin.storage
      .from('dna-vault')
      .upload(filePath, buffer, { 
        contentType: 'image/png', 
        upsert: true 
      });

    if (error) throw new Error(`UPLOAD_ERROR: ${error.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('dna-vault')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err: any) {
    console.error('--- ERROR PROTOCOLO CARGA ---', err.message);
    return null;
  }
}

