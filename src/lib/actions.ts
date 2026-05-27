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

import { revalidatePath } from 'next/cache';

export async function getProducts() {
  try {
    // Forzar lectura fresca de la DB ignorando el caché de Next.js
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('DB_FETCH_PRODUCTS_ERROR:', error.message);
      return [];
    }

    // Mapeo de soldout (DB) a soldOut (Frontend)
    return (data || []).map((p: any) => ({
      ...p,
      soldOut: p.soldout // Normalizamos para el frontend
    })) as Product[];
  } catch (e: any) {
    console.error('FETCH_PRODUCTS_EXCEPTION:', e.message);
    return [];
  }
}

export async function createProduct(product: Partial<Product>) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error('ERROR_DE_CONFIGURACION: Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.');

    const supabaseAdmin = getSupabaseAdmin();
    // Mapeo estricto para asegurar compatibilidad con PostgreSQL
    const dbProduct = {
      name: product.name,
      price: product.price,
      category: product.category,
      images: product.images,
      description: product.description,
      colors: product.colors,
      soldout: product.soldOut || false
    };

    console.log(`> INTENTANDO_INSERTAR_DB: ${product.name}`);
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([dbProduct])
      .select();

    if (error) {
      console.error('DB_INSERT_FAILURE:', error.message);
      throw new Error(`FALLA_BASE_DE_DATOS: ${error.message}`);
    }
    
    revalidatePath('/revista');
    revalidatePath('/bunker-403');
    revalidatePath('/');
    
    console.log(`> INSERCION_EXITOSA: ID_${data?.[0]?.id}`);
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('--- ERROR_CREACION_PRODUCTO ---', error.message);
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
    
    revalidatePath('/revista');
    revalidatePath('/bunker-403');

    return { success: true };
  } catch (error: any) {
    console.error('UPDATE_PRODUCT_FAILURE:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: number) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error('CONFIG_ERROR: No se puede purgar sin llave maestra.');

    const supabaseAdmin = getSupabaseAdmin();
    console.log(`> INICIANDO_PURGA_PRODUCTO: ID_${id}`);
    
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('DB_DELETE_FAILURE:', error.message);
      throw new Error(`FALLA_ELIMINACION_DB: ${error.message}`);
    }
    
    revalidatePath('/revista');
    revalidatePath('/bunker-403');
    revalidatePath('/');

    console.log(`> PURGA_COMPLETA: ID_${id}`);
    return { success: true };
  } catch (error: any) {
    console.error('--- ERROR_PURGA_SISTEMA ---', error.message);
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

    revalidatePath('/bunker-403');

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
    const { customer, items } = orderData;

    // 1. Registrar en tabla orders
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

    revalidatePath('/bunker-403');

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
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return { success: false, error: 'CONFIG_ERROR: Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.' };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const file = formData.get('file');
    const fileName = formData.get('fileName') as string;
    
    if (!file) return { success: false, error: 'ARCHIVO_VACIO' };

    let buffer: Buffer;
    let contentType = 'image/png';

    if (typeof file === 'string' && file.startsWith('data:')) {
      const base64Data = file.split(',')[1];
      if (!base64Data) return { success: false, error: 'DATA_DE_IMAGEN_CORRUPTA' };
      buffer = Buffer.from(base64Data, 'base64');
    } else if (file instanceof Blob) {
      buffer = Buffer.from(await file.arrayBuffer());
      contentType = file.type;
    } else {
      return { success: false, error: 'TIPO_DE_ARCHIVO_NO_SOPORTADO' };
    }

    // Limpiar nombre de archivo para evitar problemas en Storage
    const cleanName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filePath = `catalog/${Date.now()}_${cleanName}`;

    console.log(`> INICIANDO_SUBIDA_STORAGE: ${filePath}`);
    const { error: uploadError } = await supabaseAdmin.storage
      .from('dna-vault')
      .upload(filePath, buffer, { 
        contentType, 
        upsert: true 
      });

    if (uploadError) {
      console.error('ERROR_STORAGE_UPLOAD:', uploadError.message);
      return { success: false, error: `FALLA_STORAGE: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('dna-vault')
      .getPublicUrl(filePath);

    console.log(`> SUBIDA_EXITOSA: ${publicUrl}`);
    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error('--- ERROR_PROTOCOLO_CARGA ---', err.message);
    return { success: false, error: err.message };
  }
}

export async function purgeAllOrders() {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.error("ERROR_CRITICO: No se puede purgar sin SUPABASE_SERVICE_ROLE_KEY");
      return { success: false, error: "CONFIG_ERROR: No se detectó llave maestra en el servidor." };
    }

    const supabaseAdmin = getSupabaseAdmin();
    console.log("> INICIANDO_PROTOCOLO_DE_PURGA_TOTAL");
    
    // Usamos un filtro que siempre sea verdadero para borrar todo
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .not('id', 'is', null); // Borra cualquier registro que tenga un ID (todos)

    if (error) {
      console.error("DB_PURGE_ERROR:", error.message);
      return { success: false, error: `DB_ERROR: ${error.message}` };
    }
    
    revalidatePath('/bunker-403');
    console.log("> PURGA_TOTAL_COMPLETA_EXITOSAMENTE");
    return { success: true };
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : "Error desconocido en purga";
    console.error("--- FALLA_SISTEMA_EN_PURGA ---", msg);
    return { success: false, error: msg };
  }
}

