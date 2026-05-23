export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, email, nombre, monto } = req.body;

  if (!token || !email || !monto) {
    return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
  }

  const amount = parseInt(monto) * 100; // Culqi usa centavos

  try {
    const response = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CULQI_SECRET_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        amount,
        currency_code: 'USD',
        email,
        source_id:   token,
        description: `BrannIA — ${nombre || email}`,
        metadata:    { nombre, plan_monto: monto },
      }),
    });

    const data = await response.json();

    if (data.object === 'charge' && data.outcome?.type === 'venta_exitosa') {
      return res.status(200).json({ success: true, charge_id: data.id });
    } else {
      const msg = data.user_message || data.merchant_message || 'Pago no autorizado.';
      return res.status(400).json({ success: false, message: msg });
    }
  } catch (err) {
    console.error('Culqi error:', err);
    return res.status(500).json({ success: false, message: 'Error interno al procesar el pago.' });
  }
}
