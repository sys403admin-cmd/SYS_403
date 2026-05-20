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
      <div style="border-left: 2px solid ${accentColor}; padding-left: 15px; margin-bottom: 15px;">
        <span style="color: ${accentColor}; font-size: 10px; display: block;">ITEM_CAPTURADO</span>
        <span style="color: #ffffff; font-weight: bold; font-size: 14px;">${item.product.name}</span><br/>
        <span style="color: rgba(255,255,255,0.5); font-size: 11px;">TALLA: ${item.selectedSize} // COLOR: ${item.selectedColor}</span>
      </div>
    `).join('');
    orderDetails = `
      <div style="margin: 20px 0;">
        <span style="color: ${primaryColor}; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">ARCHIVOS_EXTRAIDOS:</span>
        <div style="margin-top: 10px;">${itemsHtml}</div>
        <div style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10px; margin-top: 10px;">
          <span style="color: #ffffff; font-size: 18px; font-weight: 900;">VALOR_TOTAL: $${data.total.toFixed(2)}</span>
        </div>
      </div>
    `;
  } else {
    orderDetails = `
      <div style="margin: 20px 0;">
        <span style="color: ${primaryColor}; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">ESPECIFICACIONES_ADN:</span>
        <div style="background: rgba(255,255,255,0.03); padding: 15px; border: 1px solid rgba(255,255,255,0.05); margin-top: 10px;">
          <span style="color: #ffffff; font-size: 13px; font-weight: bold; display: block;">PRENDA: ${data.garmentType}</span>
          <span style="color: #ffffff; font-size: 13px; font-weight: bold; display: block;">TALLA: ${data.size}</span>
          <span style="color: #ffffff; font-size: 13px; font-weight: bold; display: block;">COLOR_BASE: ${data.garmentColor}</span>
        </div>
        <div style="margin-top: 15px;">
          <span style="color: ${accentColor}; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 10px;">FRAGMENTOS_INYECTADOS:</span>
          ${data.designs.map((d: any) => `<img src="${d.url}" style="width: 70px; height: 70px; border: 1px solid ${primaryColor}; margin-right: 5px; background: black; object-fit: contain;" />`).join('')}
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
          .header { border-bottom: 1px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; }
          .glitch { color: ${accentColor}; }
          .tag { display: inline-block; background: ${primaryColor}; color: white; font-size: 10px; padding: 3px 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
          .message { font-size: 14px; line-height: 1.6; color: #dddddd; margin-bottom: 30px; }
          .footer { border-top: 1px solid rgba(255,255,255,0.1); margin-top: 40px; padding-top: 20px; font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 3px; }
          .btn { display: inline-block; border: 1px solid ${accentColor}; color: ${accentColor}; padding: 12px 25px; text-decoration: none; font-size: 12px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="scanline"></div>
            <div class="header">
              <div class="logo">>SYS_403 // <span class="glitch">REPORT_ID_${reportId}</span></div>
              <div style="font-size: 9px; color: #666; margin-top: 5px; letter-spacing: 2px;">ARCHITECTURE_STREETWEAR_SYSTEM // NODE_MEDELLIN</div>
            </div>

            <div class="tag">${isInternal ? 'INTRUSION_DETECTED' : 'BREACH_LOGGED'}</div>
            
            <div class="message">
              <p style="color: #ffffff; font-size: 16px; font-weight: bold; font-style: italic;">${mainMessage}</p>
              
              <div style="background: rgba(255,0,0,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px; margin: 30px 0;">
                <span style="color: ${primaryColor}; font-size: 9px; font-weight: bold; letter-spacing: 2px; display: block; margin-bottom: 10px;">DATOS_DEL_SUJETO:</span>
                <span style="font-size: 15px; font-weight: 900; color: #ffffff; display: block; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px;">${(data.customer?.name || data.name).toUpperCase()}</span>
                <span style="font-size: 12px; color: ${accentColor}; display: block; margin-top: 5px;">COMM_WA: ${data.customer?.whatsapp || data.whatsapp}</span>
              </div>

              ${orderDetails}

              <p style="font-size: 13px; opacity: 0.8; margin-top: 30px; border-left: 2px solid ${primaryColor}; padding-left: 15px;">
                ${subMessage}
              </p>
            </div>

            <div class="footer">
              ESTADO: SÓLIDO // ACCESO_DENEGADO // SYS_403_BUNKER
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
