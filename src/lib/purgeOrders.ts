'use server';

import { getSupabaseAdmin } from './supabase';
import { revalidatePath } from 'next/cache';

export async function purgeAllOrders() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    console.log("> INICIANDO_PURGA_TOTAL_DE_PEDIDOS");
    
    // Eliminar todos los registros de la tabla 'orders'
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .neq('id', 0); // Truco para borrar todo si el ID es autoincremental > 0

    if (error) throw error;
    
    revalidatePath('/bunker-403');
    console.log("> PURGA_TOTAL_COMPLETA");
    return { success: true };
  } catch (error: any) {
    console.error("--- ERROR_PURGA_MASIVA ---", error.message);
    return { success: false, error: error.message };
  }
}
