import { CustomOrder } from './store';

/**
 * PROTOCOLO DE COMUNICACIÓN SYS_403
 * Genera plantillas inmersivas con estética Matrix/Glitch
 */

export const getMatrixEmailTemplate = (data: any, isInternal: boolean, isCatalog: boolean = false) => {
  const primaryColor = '#FF0000'; // Urban Red
  const accentColor = '#00FF00';  // System Green
  const bgColor = '#000000';

  const reportId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  // Contenido dinámico según el tipo de pedido
  let orderDetails = '';
  if (isCatalog) {
    const itemsHtml = data.items.map((item: any) => `
      <div style="border-left: 2px solid ${accentColor}; padding-left: 15px; margin-bottom: 25px; display: table; width: 100%;">
        <div style="display: table-cell; width: 80px; vertical-align: top;">
           <img src="${item.product.images[0]}" width="70" height="90" style="object-fit: cover; border: 1px solid rgba(255,255,255,0.1); background: #000;" />
        </div>
        <div style="display: table-cell; vertical-align: top; padding-left: 15px;">
           <span style="color: ${accentColor}; font-size: 10px; display: block; font-weight: bold; letter-spacing: 2px;">ITEM_CAPTURADO</span>
           <span style="color: #ffffff; font-weight: 900; font-size: 16px; text-transform: uppercase;">${item.product.name}</span><br/>
           <span style="color: rgba(255,255,255,0.6); font-size: 11px; font-weight: bold; letter-spacing: 1px;">DIMENSIÓN: ${item.selectedSize} // CROMA: ${item.selectedColor}</span><br/>
           <span style="color: #ffffff; font-size: 12px; font-weight: bold; margin-top: 5px; display: block;">CANTIDAD: ${item.quantity} UDS</span>
        </div>
      </div>
    `).join('');
    orderDetails = `
      <div style="margin: 30px 0;">
        <span style="color: ${primaryColor}; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; font-weight: 900;">ARCHIVOS_EXTRAÍDOS_DE_LA_BÓVEDA:</span>
        <div style="margin-top: 20px;">${itemsHtml}</div>
        <div style="border-top: 2px solid rgba(255,255,255,0.05); padding-top: 20px; margin-top: 20px;">
          <span style="color: #ffffff; font-size: 24px; font-weight: 900; font-style: italic;">VALOR_TOTAL: $${data.total.toFixed(2)}</span>
        </div>
      </div>
    `;
  } else {
    orderDetails = `
      <div style="margin: 20px 0;">
        <span style="color: ${primaryColor}; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">ESPECIFICACIONES_ADN:</span>
        <div style="background: rgba(255,255,255,0.03); padding: 15px; border: 1px solid rgba(255,255,255,0.05); margin-top: 10px;">
          <span style="color: #ffffff; font-size: 13px; font-weight: bold; display: block;">PRENDA: ${data.garmenttype || data.garmentType}</span>
          <span style="color: #ffffff; font-size: 13px; font-weight: bold; display: block;">TALLA: ${data.size}</span>
          <span style="color: #ffffff; font-size: 13px; font-weight: bold; display: block;">COLOR_BASE: ${data.garmentcolor || data.garmentColor}</span>
        </div>
        <div style="margin-top: 15px;">
          <span style="color: ${accentColor}; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 10px;">FRAGMENTOS_INYECTADOS:</span>
          ${Array.isArray(data.designs) ? data.designs.map((d: any) => `
            <div style="display: inline-block; margin-right: 10px; margin-bottom: 10px; text-align: center;">
              <img src="${d.url}" style="width: 70px; height: 70px; border: 1px solid ${primaryColor}; background: black; object-fit: contain; display: block;" />
              <span style="color: ${accentColor}; font-size: 7px; font-weight: bold; text-transform: uppercase;">${d.zone}</span>
            </div>
          `).join('') : '<span style="color: #555; font-size: 10px;">SIN_DISEÑOS_DETECTADOS</span>'}
        </div>
      </div>
    `;
  }

  const mainMessage = isInternal 
    ? `BLOQUE_TOTAL_DETECTADO: Se ha registrado una nueva inyección de datos en el servidor central. La estructura es sólida. El sujeto ${data.customer?.name || data.name} ha comprometido el sistema.`
    : `ACCESO_CONCEDIDO: Tu ADN ha sido interceptado con éxito. Lo que el sistema te niega, nosotros lo convertimos en estética. Tu pedido ahora es un bloque sólido en nuestro bunker.`;

  const subMessage = isInternal
    ? `PROCEDER_CON_ANALISIS: Validar integridad del ADN y preparar despacho. El glitch debe ser entregado.`
    : `ESTADO_DEL_GLITCH: Nuestro equipo está procesando la información. Serás contactado vía WhatsApp para el sellado final y la entrega del bloque. No respondas a este mensaje, el sistema es unidireccional.`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { background-color: ${bgColor}; color: #ffffff; font-family: 'Courier New', Courier, monospace; margin: 0; padding: 0; }
          .wrapper { background-color: ${bgColor}; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; border: 1px solid ${primaryColor}; background: #080808; padding: 40px; position: relative; }
          .scanline { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(255,0,0,0.1); }
          .header { border-bottom: 2px solid ${primaryColor}; padding-bottom: 30px; margin-bottom: 40px; display: table; width: 100%; }
          .logo-container { display: table-cell; vertical-align: middle; width: 80px; }
          .logo-box { width: 70px; height: 70px; background: #ffffff; border-radius: 12px; border: 3px solid ${primaryColor}; display: flex; align-items: center; justify-content: center; overflow: hidden; }
          .logo-text-container { display: table-cell; vertical-align: middle; padding-left: 20px; }
          .logo-text { font-size: 28px; font-weight: 900; letter-spacing: -1.5px; color: #ffffff; margin: 0; }
          .glitch { color: ${accentColor}; }
          .tag { display: inline-block; background: ${primaryColor}; color: white; font-size: 11px; padding: 4px 14px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 25px; border-radius: 2px; }
          .message { font-size: 15px; line-height: 1.7; color: #eeeeee; margin-bottom: 35px; }
          .footer { border-top: 1px solid rgba(255,255,255,0.1); margin-top: 50px; padding-top: 25px; font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 4px; text-align: center; }
          .signature-box { margin-top: 40px; padding: 25px; border: 1px dashed ${accentColor}; background: rgba(0,255,0,0.02); }
          .signature { font-weight: 900; font-style: italic; color: #ffffff; font-size: 16px; letter-spacing: 1px; }
          .signature-sub { color: ${accentColor}; font-size: 10px; font-weight: bold; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="scanline"></div>
            <div class="header">
               <div class="logo-container">
                  <div class="logo-box">
                    <img src="https://sys403.online/sys_403.png" width="60" height="60" style="display: block; margin: auto;" />
                  </div>
               </div>
               <div class="logo-text-container">
                  <h1 class="logo-text">>SYS_403 // <span class="glitch">ID_${reportId}</span></h1>
                  <div style="font-size: 10px; color: #888; margin-top: 4px; letter-spacing: 2px; font-weight: bold;">STREETWEAR_ARCHITECTURE // [CO]</div>
               </div>
            </div>

            <div class="tag">${isInternal ? 'INTRUSION_DETECTED' : 'BREACH_LOGGED'}</div>
            
            <div class="message">
              <p style="color: #ffffff; font-size: 18px; font-weight: 900; font-style: italic; border-left: 4px solid ${primaryColor}; padding-left: 20px; margin-bottom: 30px;">${mainMessage}</p>
              
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 25px; margin: 35px 0; border-radius: 4px;">
                <span style="color: ${primaryColor}; font-size: 10px; font-weight: 900; letter-spacing: 3px; display: block; margin-bottom: 12px; text-transform: uppercase;">FORJADOR_IDENTIFICADO:</span>
                <span style="font-size: 18px; font-weight: 900; color: #ffffff; display: block; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">${(data.customer?.name || data.name).toUpperCase()}</span>
                <span style="font-size: 13px; color: ${accentColor}; display: block; margin-top: 8px; font-weight: bold;">ENLACE_WHATSAPP: ${data.customer?.whatsapp || data.whatsapp}</span>
              </div>

              ${orderDetails}

              <p style="font-size: 14px; opacity: 0.9; margin-top: 35px; color: #ccc;">
                ${subMessage}
              </p>

              <div class="signature-box">
                <div class="signature">-- EL_NÚCLEO_SYS403</div>
                <div class="signature-sub">DIRECCIÓN GENERAL DE ESTÉTICA URBANA</div>
                <div style="margin-top: 15px; font-size: 9px; opacity: 0.4;">© 2026 // ACCESO_RESTRINGIDO</div>
              </div>
            </div>

            <div class="footer">
              STATUS: TOTAL_SÓLIDO // BARRIO_PROTOCOL_v4.0
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
