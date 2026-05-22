'use server';

import { supabase, getSupabaseAdmin } from './supabase';
import { Product, CustomOrder } from './store';
import { Resend } from 'resend';
import { getMatrixEmailTemplate } from './emails';

// Helper para inicializar Resend de forma segura
const initResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("ALERTA_CRITICA: RESEND_API_KEY no encontrada en process.env");
  }
  return key ? new Resend(key) : null;
};

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('DB_FETCH_PRODUCTS_ERROR:', error.message);
      return [];
    }
    return data as Product[];
  } catch (e: any) {
    console.error('FETCH_PRODUCTS_EXCEPTION:', e.message);
    return [];
  }
}

export async function createProduct(product: Partial<Product>) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Mapeo explícito a minúsculas
    const dbProduct = {
      name: product.name,
      price: product.price,
      category: product.category,
      images: product.images,
      description: product.description,
      colors: product.colors,
      stock: product.stock || 0,
      soldout: product.soldOut || false
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([dbProduct])
      .select();

    if (error) throw new Error(`DB_INSERT_ERROR: ${error.message}`);
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('CREATE_PRODUCT_FAILURE:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: number, updates: Partial<Product>) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Mapeo de soldOut -> soldout para Postgres
    const dbUpdates: any = { ...updates };
    if ('soldOut' in updates) {
      dbUpdates.soldout = updates.soldOut;
      delete dbUpdates.soldOut;
    }

    const { error } = await supabaseAdmin
      .from('products')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw new Error(`DB_UPDATE_ERROR: ${error.message}`);
    return { success: true };
  } catch (error: any) {
    console.error('UPDATE_PRODUCT_FAILURE:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: number) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`DB_DELETE_ERROR: ${error.message}`);
    return { success: true };
  } catch (error: any) {
    console.error('DELETE_PRODUCT_FAILURE:', error.message);
    return { success: false, error: error.message };
  }
}

export async function submitOrder(order: any) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const resend = initResend();

    if (!process.env.RESEND_API_KEY) {
      console.warn("ALERTA_BUNKER: RESEND_API_KEY no detectada. Notificaciones desactivadas.");
    }

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

    // Notificaciones
    if (resend && order.email) {
      try {
        const fromAddress = 'SYS_403 // CENTRAL <bunker@sys403.online>';
        
        // 1. Email para el Cliente (Cualquier correo que él escriba)
        console.log(`> ENVIANDO_RECIBO_CLIENTE: ${order.email}`);
        const clientRes = await resend.emails.send({
          from: fromAddress,
          to: order.email,
          subject: `> BREACH_CONFIRMED // ${order.name}`,
          html: getMatrixEmailTemplate(order, false),
        });
        
        if (clientRes.error) console.error("FALLO_EMAIL_CLIENTE:", clientRes.error);
        else console.log("EXITO_EMAIL_CLIENTE_ID:", clientRes.data?.id);

        // 2. Email para el Bunker (Admin)
        const adminEmail = 'sys.403admin@gmail.com';
        console.log(`> ENVIANDO_ALERTA_BUNKER: ${adminEmail}`);
        const adminRes = await resend.emails.send({
          from: fromAddress,
          to: adminEmail,
          subject: `> INCOMING_ADN // ${order.name}`,
          html: getMatrixEmailTemplate(order, true),
        });

        if (adminRes.error) console.error("FALLO_EMAIL_ADMIN:", adminRes.error);
        else console.log("EXITO_EMAIL_ADMIN_ID:", adminRes.data?.id);

      } catch (emailErr: any) {
        console.error("EXCEPCION_CRITICA_NOTIFICACIONES:", emailErr.message);
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

    // 1. Descontar Stock con Validación de Servidor
    for (const item of items) {
      const { data: currentProduct, error: fetchErr } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.product.id)
        .single();

      if (fetchErr) {
        console.error(`ERROR_FETCH_STOCK [ID:${item.product.id}]:`, fetchErr.message);
        continue;
      }

      if (currentProduct) {
        const newStock = Math.max(0, currentProduct.stock - item.quantity);
        const { error: updateErr } = await supabaseAdmin
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product.id);
        
        if (updateErr) {
          console.error(`ERROR_UPDATE_STOCK [ID:${item.product.id}]:`, updateErr.message);
        }
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
        const fromAddress = 'SYS_403 // CENTRAL <bunker@sys403.online>';
        
        // Cliente
        console.log(`> ENVIANDO_RECIBO_CATALOGO: ${customer.email}`);
        const clientRes = await resend.emails.send({
          from: fromAddress,
          to: customer.email,
          subject: `> PEDIDO_RECIBIDO // ${customer.name}`,
          html: getMatrixEmailTemplate(orderData, false, true),
        });
        
        if (clientRes.error) console.error("FALLO_EMAIL_CATALOGO_CLIENTE:", clientRes.error);
        else console.log("EXITO_EMAIL_CATALOGO_CLIENTE_ID:", clientRes.data?.id);

        // Admin
        const adminEmail = 'sys.403admin@gmail.com';
        console.log(`> ENVIANDO_ALERTA_CATALOGO_BUNKER: ${adminEmail}`);
        const adminRes = await resend.emails.send({
          from: fromAddress,
          to: adminEmail,
          subject: `> INCOMING_CATALOG_ADN // ${customer.name}`,
          html: getMatrixEmailTemplate(orderData, true, true),
        });

        if (adminRes.error) console.error("FALLO_EMAIL_CATALOGO_ADMIN:", adminRes.error);
        else console.log("EXITO_EMAIL_CATALOGO_ADMIN_ID:", adminRes.data?.id);

      } catch (emailErr: any) {
        console.error("EXCEPCION_CRITICA_NOTIFICACIONES_CATALOGO:", emailErr.message);
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

