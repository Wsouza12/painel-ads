CREATE TABLE ml_ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES ml_products(id) ON DELETE CASCADE,
  
  -- Variante A (Geralmente a original/promoção)
  variant_a_title varchar,
  variant_a_image varchar,
  variant_a_desc text,
  
  -- Variante B (Premium / Alto Valor / Exclusividade)
  variant_b_title varchar,
  variant_b_image varchar,
  variant_b_desc text,
  
  status varchar DEFAULT 'running', -- 'running', 'completed'
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Ativar RLS (Opcional)
ALTER TABLE ml_ab_tests ENABLE ROW LEVEL SECURITY;
