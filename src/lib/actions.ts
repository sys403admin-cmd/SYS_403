'use server';

import { supabaseAdmin, supabase } from './supabase';
import { Product, CustomOrder } from './store';
import { Resend } from 'resend';
import { getMatrixEmailTemplate } from './emails';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * PROTOCOLO DE ESTABILIZACIÓN TOTAL v4.1
 * Objetivo: Cero errores de RLS y fluidez máxima de datos.
 */

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) return [];
  return data as Product[];
}

export async function submitOrder(order: any) {
  try {
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

    // Notificaciones automáticas
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

    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('--- FALLA CRÍTICA BUNKER ---', error.message);
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
