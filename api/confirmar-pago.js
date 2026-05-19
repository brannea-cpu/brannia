import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);
const CALENDLY_LINK = process.env.CALENDLY_LINK || 'https://calendly.com/brannia-pe/30min';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { nombre, email, whatsapp, pais, plan, plan_name, monto } = req.body;

  if (!email) return res.status(400).json({ error: 'Email requerido' });

  /* Insertar en Supabase */
  const { error: dbError } = await supabase.from('clientes').insert({
    nombre:     nombre    || null,
    email:      email,
    whatsapp:   whatsapp  || null,
    pais:       pais      || null,
    plan:       plan      || null,
    plan_name:  plan_name || null,
    monto:      monto     || null,
    fecha_pago: new Date().toISOString(),
  });

  if (dbError) console.error('Supabase error:', dbError);

  /* Enviar email de confirmación */
  const { error: emailError } = await resend.emails.send({
    from:    'BrannIA <hola@brannea.com>', // dominio brannea.com verificado en Resend
    reply_to: 'brannia.pe@gmail.com',
    to:      email,
    subject: `¡Tu acceso a BrannIA está activo, ${nombre || 'hola'}!`,
    html:    buildEmail({ nombre, plan_name, monto }),
  });

  if (emailError) console.error('Resend error:', emailError);

  return res.status(200).json({ success: true });
}

function buildEmail({ nombre, plan_name, monto }) {
  const planLabel  = plan_name === 'Closer' ? 'Closer · $150 por 3 meses' : 'Starter · $67/mes';
  const greeting   = nombre ? `Hola ${nombre}` : 'Hola';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F4FC;font-family:'Outfit',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(147,51,234,0.1)">

        <!-- Header gradient -->
        <tr><td style="background:linear-gradient(135deg,#9333EA,#D946EF);padding:32px 40px;text-align:center">
          <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.03em">BrannIA</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px">Sistema de prospección con IA</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px">
          <p style="font-size:22px;font-weight:800;color:#1A1530;margin:0 0 8px;letter-spacing:-0.02em">${greeting} 🎉</p>
          <p style="font-size:15px;color:#4B4469;margin:0 0 28px;line-height:1.65">
            Tu pago fue recibido. En menos de 24 horas tu sistema ya estará activo y podrás empezar a enviar perfiles de LinkedIn para analizarlos por WhatsApp.
          </p>

          <!-- Plan pill -->
          <div style="background:rgba(147,51,234,0.07);border:1px solid rgba(147,51,234,0.2);border-radius:100px;padding:10px 20px;display:inline-block;margin-bottom:28px">
            <span style="font-size:13px;font-weight:700;color:#9333EA">Plan ${planLabel}</span>
          </div>

          <!-- Steps -->
          <p style="font-size:14px;font-weight:800;color:#1A1530;margin:0 0 16px;letter-spacing:0.02em;text-transform:uppercase">¿Qué sigue?</p>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:32px;vertical-align:top;padding-top:1px">
                <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#9333EA,#D946EF);text-align:center;line-height:24px;font-size:11px;font-weight:800;color:#fff">1</div>
              </td>
              <td style="padding:0 0 16px 10px;font-size:14px;color:#4B4469;line-height:1.5">
                <strong style="color:#1A1530;display:block">Agenda tu reunión de setup</strong>
                El primer paso es reservar los 30 minutos de configuración para dejar el sistema activo.
              </td>
            </tr>
            <tr>
              <td style="width:32px;vertical-align:top;padding-top:1px">
                <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#9333EA,#D946EF);text-align:center;line-height:24px;font-size:11px;font-weight:800;color:#fff">2</div>
              </td>
              <td style="padding:0 0 16px 10px;font-size:14px;color:#4B4469;line-height:1.5">
                <strong style="color:#1A1530;display:block">Setup en 24 horas</strong>
                En la reunión lo configuramos todo. Después ya puedes pegar perfiles de LinkedIn en WhatsApp y recibir tu dashboard.
              </td>
            </tr>
          </table>

          <!-- Calendly CTA -->
          <div style="text-align:center;margin:24px 0 32px">
            <a href="${CALENDLY_LINK}" style="display:inline-block;padding:16px 36px;border-radius:12px;background:linear-gradient(135deg,#9333EA,#D946EF);color:#fff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.01em">
              Agendar mi reunión de setup →
            </a>
          </div>

          <hr style="border:none;border-top:1px solid rgba(147,51,234,0.1);margin:0 0 24px">

          <p style="font-size:13px;color:#7C7499;margin:0;line-height:1.6">
            ¿Alguna duda? Escríbenos por WhatsApp: <a href="https://wa.me/51992124889" style="color:#9333EA;font-weight:600">wa.me/51992124889</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F5F4FC;padding:20px 40px;text-align:center">
          <p style="font-size:11px;color:#7C7499;margin:0">BrannIA · Sistema de prospección con IA</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
