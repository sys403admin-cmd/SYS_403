'use server';

import { supabaseAdmin, supabase } from './supabase';
import { Product, CustomOrder } from './store';
import { Resend } from 'resend';
import { getMatrixEmailTemplate } from './emails';

const RESEND_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

/**
 * PROTOCOLO DE ESTABILIZACIÓN TOTAL v4.1
 * Objetivo: Cero errores de RLS y fluidez máxima de datos.
 */

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn("getProducts Error:", error.message);
      return [];
    }
    return data as Product[];
  } catch (e) {
    return [];
  }
}

export async function submitOrder(order: any) {
  try {
    // Blindaje de Seguridad: Validación de Honeypot en el Servidor
    if (order.honeypot && order.honeypot.length > 0) {
      console.warn("INTENTO_BOT_BLOQUEADO:", order.email);
      throw new Error("ACCESO_DENEGADO_SISTEMA_DETECTO_BOT");
    }

    // Plan Candado: Mapeo EXPLICITO a minúsculas para PostgreSQL
    const dbOrder = {
      name: order.name,
      email: order.email,
      whatsapp: order.whatsapp,
      garmenttype: order.garmentType,
      garmentcolor: order.garmentColor,
      size: order.size,
      designs: JSON.stringify(order.designs),
      status: 'Pendiente',
      date: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([dbOrder])
      .select();

    if (error) throw error;

    // Notificaciones automáticas (Diseño Matrix v2.0)
    if (resend) {
      await resend.emails.send({
        from: 'SYS_403 <onboarding@resend.dev>',
        to: order.email,
        subject: `> BREACH_CONFIRMED // ${order.name}`,
        html: getMatrixEmailTemplate(order, false),
      }).catch(e => console.error("Error email cliente:", e));

      await resend.emails.send({
        from: 'BUNKER_ALERT <onboarding@resend.dev>',
        to: 'sys.403admin@gmail.com',
        subject: `> INCOMING_ADN // ${order.name}`,
        html: getMatrixEmailTemplate(order, true),
      }).catch(e => console.error("Error email admin:", e));
    }

    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('--- FALLA CRÍTICA BUNKER ---', error.message);
    throw new Error(error.message);
  }
}

export async function submitCatalogOrder(orderData: { 
  customer: any, 
  items: any[], 
  total: number 
}) {
  try {
    const { customer, items, total } = orderData;

    // 1. Descontar Stock y Registrar Pedido
    for (const item of items) {
      const { data: product, error: fetchError } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.product.id)
        .single();

      if (fetchError || !product) throw new Error(`PRODUCTO_NO_ENCONTRADO: ${item.product.name}`);
      if (product.stock < item.quantity) throw new Error(`STOCK_INSUFICIENTE: ${item.product.name}`);

      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ stock: product.stock - item.quantity })
        .eq('id', item.product.id);

      if (updateError) throw updateError;
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

    if (orderError) throw orderError;

    // 3. Notificaciones Unificadas (Diseño Matrix)
    if (resend) {
      await resend.emails.send({
        from: 'SYS_403 <onboarding@resend.dev>',
        to: customer.email,
        subject: `> PEDIDO_RECIBIDO // ${customer.name}`,
        html: getMatrixEmailTemplate(orderData, false, true),
      }).catch(e => console.error("Error email cliente:", e));

      await resend.emails.send({
        from: 'BUNKER_ALERT <onboarding@resend.dev>',
        to: 'sys.403admin@gmail.com',
        subject: `> INCOMING_CATALOG_ADN // ${customer.name}`,
        html: getMatrixEmailTemplate(orderData, true, true),
      }).catch(e => console.error("Error email admin:", e));
    }

    return { success: true, orderId: data[0].id };
  } catch (error: any) {
    console.error('--- FALLA CRÍTICA PEDIDO CATALOGO ---', error.message);
    throw new Error(error.message);
  }
}

export async function uploadDNA(formData: FormData) {
  try {
    const fileBase64 = formData.get('file') as string;
    const fileName = formData.get('fileName') as string;
    
    if (!fileBase64) throw new Error('ADN_VACIO');

    const cleanName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filePath = `injections/${Date.now()}_${cleanName}`;
    const base64Data = fileBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Usamos supabaseAdmin para ignorar políticas de RLS en el storage
    const { data, error } = await supabaseAdmin.storage
      .from('dna-vault')
      .upload(filePath, buffer, { 
        contentType: 'image/png', 
        upsert: true 
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('dna-vault')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err: any) {
    console.error('--- ERROR PROTOCOLO CARGA ---', err.message);
    throw new Error(err.message);
  }
}
