-- Schema para o TaskFlow Studio
-- Esta estrutura inclui tabelas para usuários, tarefas, notificações e configurações

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.taskday_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS public.taskday_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.taskday_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS public.taskday_user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  theme TEXT CHECK (theme IN ('light', 'dark')) DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  weekly_summary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.taskday_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taskday_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taskday_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taskday_user_settings ENABLE ROW LEVEL SECURITY;

-- Política para garantir que usuários só possam acessar seus próprios dados
DROP POLICY IF EXISTS "Usuários podem ver e editar seu próprio perfil" ON public.taskday_profiles;
CREATE POLICY "Usuários podem ver e editar seu próprio perfil" ON public.taskday_profiles
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem ver e editar suas próprias tarefas" ON public.taskday_tasks;
CREATE POLICY "Usuários podem ver e editar suas próprias tarefas" ON public.taskday_tasks
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem ver e editar suas próprias notificações" ON public.taskday_notifications;
CREATE POLICY "Usuários podem ver e editar suas próprias notificações" ON public.taskday_notifications
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem ver e editar suas próprias configurações" ON public.taskday_user_settings;
CREATE POLICY "Usuários podem ver e editar suas próprias configurações" ON public.taskday_user_settings
  FOR ALL USING (user_id = auth.uid());

-- Índices para melhorar performance
DROP INDEX IF EXISTS idx_taskday_tasks_user_id;
CREATE INDEX idx_taskday_tasks_user_id ON public.taskday_tasks(user_id);
DROP INDEX IF EXISTS idx_taskday_tasks_due_date;
CREATE INDEX idx_taskday_tasks_due_date ON public.taskday_tasks(due_date);
DROP INDEX IF EXISTS idx_taskday_tasks_status;
CREATE INDEX idx_taskday_tasks_status ON public.taskday_tasks(status);
DROP INDEX IF EXISTS idx_taskday_tasks_priority;
CREATE INDEX idx_taskday_tasks_priority ON public.taskday_tasks(priority);
DROP INDEX IF EXISTS idx_taskday_notifications_user_id;
CREATE INDEX idx_taskday_notifications_user_id ON public.taskday_notifications(user_id);
DROP INDEX IF EXISTS idx_taskday_notifications_is_read;
CREATE INDEX idx_taskday_notifications_is_read ON public.taskday_notifications(is_read);
DROP INDEX IF EXISTS idx_taskday_user_settings_user_id;
CREATE INDEX idx_taskday_user_settings_user_id ON public.taskday_user_settings(user_id);

-- Função para criar automaticamente um perfil quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.taskday_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.taskday_user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funções para facilitar operações comuns

-- Função para obter estatísticas de tarefas
CREATE OR REPLACE FUNCTION public.get_task_stats(user_id_param UUID)
RETURNS TABLE(
  total BIGINT,
  completed BIGINT,
  pending BIGINT,
  overdue BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.taskday_tasks WHERE user_id = user_id_param) AS total,
    (SELECT COUNT(*) FROM public.taskday_tasks WHERE user_id = user_id_param AND status = 'done') AS completed,
    (SELECT COUNT(*) FROM public.taskday_tasks WHERE user_id = user_id_param AND status != 'done') AS pending,
    (SELECT COUNT(*) FROM public.taskday_tasks WHERE user_id = user_id_param AND due_date < NOW() AND status != 'done') AS overdue;
END;
$$ LANGUAGE plpgsql;

-- Função para obter tarefas por status
CREATE OR REPLACE FUNCTION public.get_tasks_by_status(user_id_param UUID, status_param TEXT)
RETURNS SETOF public.taskday_tasks AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.taskday_tasks 
  WHERE user_id = user_id_param AND status = status_param
  ORDER BY 
    CASE priority 
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
    END,
    due_date ASC NULLS LAST,
    created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gatilhos para atualizar o timestamp de atualização
DROP TRIGGER IF EXISTS update_taskday_profiles_updated_at ON public.taskday_profiles;
CREATE TRIGGER update_taskday_profiles_updated_at
  BEFORE UPDATE ON public.taskday_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_taskday_tasks_updated_at ON public.taskday_tasks;
CREATE TRIGGER update_taskday_tasks_updated_at
  BEFORE UPDATE ON public.taskday_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_taskday_notifications_updated_at ON public.taskday_notifications;
CREATE TRIGGER update_taskday_notifications_updated_at
  BEFORE UPDATE ON public.taskday_notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_taskday_user_settings_updated_at ON public.taskday_user_settings;
CREATE TRIGGER update_taskday_user_settings_updated_at
  BEFORE UPDATE ON public.taskday_user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Permissões para o papel anon e autenticado
GRANT ALL ON TABLE public.taskday_profiles TO authenticated;
GRANT ALL ON TABLE public.taskday_tasks TO authenticated;
GRANT ALL ON TABLE public.taskday_notifications TO authenticated;
GRANT ALL ON TABLE public.taskday_user_settings TO authenticated;

-- Permissões para funções
GRANT EXECUTE ON FUNCTION public.get_task_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tasks_by_status(UUID, TEXT) TO authenticated;