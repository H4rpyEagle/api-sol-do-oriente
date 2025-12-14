-- Adiciona colunas na tabela logs se não existirem
-- Execute este SQL no Supabase SQL Editor

-- Adiciona coluna method se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'logs' 
        AND column_name = 'method'
    ) THEN
        ALTER TABLE public.logs ADD COLUMN method text;
    END IF;
END $$;

-- Adiciona coluna path se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'logs' 
        AND column_name = 'path'
    ) THEN
        ALTER TABLE public.logs ADD COLUMN path text;
    END IF;
END $$;

-- Adiciona coluna body se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'logs' 
        AND column_name = 'body'
    ) THEN
        ALTER TABLE public.logs ADD COLUMN body text;
    END IF;
END $$;

-- Adiciona coluna response se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'logs' 
        AND column_name = 'response'
    ) THEN
        ALTER TABLE public.logs ADD COLUMN response text;
    END IF;
END $$;

-- Adiciona coluna query_params se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'logs' 
        AND column_name = 'query_params'
    ) THEN
        ALTER TABLE public.logs ADD COLUMN query_params jsonb;
    END IF;
END $$;

