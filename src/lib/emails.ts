import { CustomOrder } from './store';

export const getMatrixEmailTemplate = (order: Omit<CustomOrder, 'id' | 'date' | 'status'>, isInternal: boolean) => {
  const primaryColor = '#FF0000';
  const accentColor = '#00FF00';
  const bgColor = '#000000';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
          body { background-color: ${bgColor}; color: #ffffff; font-family: 'Courier Prime', monospace; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid ${primaryColor}; background: #050505; }
          .header { text-align: left; margin-bottom: 40px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; }
          .logo { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -1px; }
          .status-tag { display: inline-block; background-color: ${primaryColor}; color: white; font-size: 9px; padding: 4px 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; margin-bottom: 20px; }
          .content { line-height: 1.4; font-size: 13px; color: #cccccc; }
          .data-box { background: rgba(255,0,0,0.05); border: 1px solid rgba(255,255,255,0.05); padding: 20px; margin: 25px 0; position: relative; }
          .label { color: ${primaryColor}; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px; font-weight: bold; }
          .value { color: #ffffff; font-size: 16px; font-weight: bold; margin-bottom: 15px; display: block; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px; }
          .design-preview { width: 80px; height: 80px; border: 1px solid ${primaryColor}; margin-right: 8px; display: inline-block; object-fit: contain; background: black; }
          .footer { margin-top: 40px; font-size: 9px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 2px; }
          .glitch { color: ${accentColor}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">>SYS_403 // <span class="glitch">REPORT_ID_${Math.floor(Math.random() * 1000000)}</span></div>
            <p style="font-size: 9px; color: #444; margin-top: 5px;">ARCHITECTURE_STREETWEAR_SYSTEM // NODE_MEDELLIN</p>
          </div>
          
          <div class="content">
            <span class="status-tag">${isInternal ? 'INTRUSION_DETECTED' : 'BREACH_LOGGED'}</span>
            
            <p style="font-size: 16px; font-weight: bold; color: #fff;">
              ${isInternal 
                ? `CAPO_TERMINAL: Se ha detectado una nueva inyección de ADN. El bloque es total sólido.` 
                : `Tu ADN ha sido interceptado. El registro es total sólido en nuestro bunker.`}
            </p>

            <div className="data-box">
              <span className="label">SUJETO_IDENTIFICADO</span>
              <span className="value">${order.name}</span>

              <span className="label">CANAL_COMUNICACION</span>
              <span className="value">${order.whatsapp}</span>

              <span className="label">ESPECIFICACIONES_SOLIDAS</span>
              <span className="value">${order.garmentType} / TALLA ${order.size} / HEX ${order.garmentColor}</span>

              <span className="label">FRAGMENTOS_INYECTADOS</span>
              <div style="margin-top: 10px;">
                ${order.designs.map(d => `<img src="${d.url}" class="design-preview" />`).join('')}
              </div>
            </div>

            <p style="opacity: 0.8; font-style: italic;">
              ${isInternal 
                ? `Proceder con el análisis. El sistema no permite filtraciones. Estructura total sólida.` 
                : `Nuestro equipo está analizando el glitch. Estructura total sólida. Serás contactado vía WhatsApp para el sellado final.`}
            </p>
          </div>

          <div class="footer">
            SISTEMA_OPERATIVO // ACCESO_RESTRINGIDO // 2026 // [CO]
          </div>
        </div>
      </body>
    </html>
  `;
};
