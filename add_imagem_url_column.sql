-- Adiciona coluna imagem_url na tabela Mensagens (se não existir)
ALTER TABLE public."Mensagens" 
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

