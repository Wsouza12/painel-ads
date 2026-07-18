-- 1. Vincular conexões ao usuário
ALTER TABLE ml_connections
  ADD CONSTRAINT fk_ml_connections_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Habilitar RLS em ml_connections
ALTER TABLE ml_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias conexões"
  ON ml_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir/atualizar conexões"
  ON ml_connections FOR ALL
  USING (auth.uid() = user_id);

-- 3. Adicionar user_id aos produtos (para não precisarmos de join sempre)
ALTER TABLE ml_products 
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Habilitar RLS em ml_products
ALTER TABLE ml_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus próprios produtos"
  ON ml_products FOR ALL
  USING (auth.uid() = user_id);

-- 5. Habilitar RLS nas tabelas secundárias usando o product_id ou connection_id
ALTER TABLE ml_ab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gerenciar testes AB do próprio usuário"
  ON ml_ab_tests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ml_products p 
      WHERE p.id = ml_ab_tests.product_id AND p.user_id = auth.uid()
    )
  );

ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gerenciar logs do próprio usuário"
  ON sync_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ml_connections c 
      WHERE c.id = sync_logs.connection_id AND c.user_id = auth.uid()
    )
  );
