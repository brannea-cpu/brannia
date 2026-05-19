-- Ejecutar en Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS clientes (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre     text,
  email      text        NOT NULL,
  whatsapp   text,
  pais       text,
  plan       text,
  plan_name  text,
  monto      text,
  fecha_pago timestamptz DEFAULT now()
);

-- Permitir inserciones desde la clave anon (sin RLS)
-- Opción A: deshabilitar RLS (más simple para empezar)
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;

-- Opción B: habilitar RLS y permitir solo inserts
-- ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "allow_insert" ON clientes FOR INSERT WITH CHECK (true);
