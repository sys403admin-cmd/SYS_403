import { CustomOrder } from './store';

export const getMatrixEmailTemplate = (order: Omit<CustomOrder, 'id' | 'date' | 'status'>, isInternal: boolean) => {
  const primaryColor = '#FF0000';
  const accentColor = '#00FF00';
  const bgColor = '#050505';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
          body { background-color: ${bgColor}; color: #ffffff; font-family: 'Courier Prime', monospace; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px; border-left: 10px solid ${primaryColor}; background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%); }
          .header { text-align: left; margin-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
          .logo { color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: -2px; }
          .glitch-underscore { color: ${accentColor}; }
          .status-tag { display: inline-block; background-color: ${primaryColor}; color: white; font-size: 10px; padding: 5px 15px; text-transform: uppercase; font-weight: bold; letter-spacing: 3px; margin-bottom: 20px; }
          .content { line-height: 1.6; font-size: 14px; }
          .highlight { color: ${accentColor}; }
          .data-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 25px; margin: 30px 0; }
          .label { color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 5px; }
          .value { color: #ffffff; font-size: 18px; font-weight: bold; margin-bottom: 20px; display: block; }
          .footer { margin-top: 50px; font-size: 10px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 3px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
          .design-preview { width: 100px; height: 100px; border: 2px solid ${primaryColor}; margin-right: 10px; display: inline-block; object-fit: contain; background: black; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">>SYS<span class="glitch-underscore">_</span>403</div>
            <p style="font-size: 10px; color: ${primaryColor}; opacity: 0.6; margin-top: 5px;">ARCHITECTURE_BREACH_V4.0.3</p>
          </div>
          
          <div class="content">
            <span class="status-tag">${isInternal ? 'INCOMING_ADN_ALERT' : 'BREACH_CONFIRMED'}</span>
            
            <p style="font-size: 20px; font-weight: bold; font-style: italic;">
              ${isInternal 
                ? `CAPO_TERMINAL: Nueva inyección de ADN detectada en el sistema.` 
                : `Tu ADN ha sido inyectado con éxito en nuestro bunker.`}
            </p>

            <div class="data-box">
              <span class="label">ID_FORJADOR</span>
              <span class="value">${order.name}</span>
              
              <span class="label">WHATSAPP_COMMS</span>
              <span class="value">${order.whatsapp}</span>
              
              <span class="label">ARQUITECTURA_TEXTIL</span>
              <span class="value">${order.garmentType} // ${order.size} // ${order.garmentColor}</span>

              <span class="label">MAPEO_VISUAL</span>
              <div style="margin-top: 10px;">
                ${order.designs.map(d => `<img src="${d.url}" class="design-preview" />`).join('')}
              </div>
            </div>

            <p style="opacity: 0.6;">
              ${isInternal 
                ? `El pedido está listo para ser procesado en el Bunker Admin. No se permiten réplicas.` 
                : `Nuestro equipo técnico está procesando la forja. Serás contactado por el canal de WhatsApp una vez que el sistema sea sellado.`}
            </p>
          </div>

          <div class="footer">
            SISTEMA_OPERATIVO // MEDELLIN_NODE // RESTRICTED_ACCESS
          </div>
        </div>
      </body>
    </html>
  `;
};
