-- Habilitar a extensão para UUIDs se necessário
create extension if not exists "uuid-ossp";

-- 1. TABELA DE GRUPOS (CASAS)
create table if not exists groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  join_code text unique not null, -- Código para outros entrarem na casa
  created_at timestamp with time zone default now()
);

-- 2. TABELA DE PERFIS DE USUÁRIO (Link com Auth do Supabase)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  current_group_id uuid references groups(id),
  total_points integer default 0,
  level integer default 1,
  title text default 'Iniciante',
  updated_at timestamp with time zone default now()
);

-- 3. TABELA DE TAREFAS
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete cascade,
  name text not null,
  description text,
  points integer not null,
  status text check (status in ('active', 'pending_approval', 'rejected', 'archived')) default 'active',
  proposed_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- 4. TABELA DE VALIDAÇÃO DE TAREFAS (APROVAÇÕES)
create table if not exists task_approvals (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references profiles(id),
  decision text check (decision in ('approve', 'reject')),
  comment text,
  created_at timestamp with time zone default now(),
  unique(task_id, user_id)
);

-- 5. TABELA DE HISTÓRICO DE TAREFAS CONCLUÍDAS
create table if not exists completed_tasks (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id),
  user_id uuid references profiles(id),
  task_id uuid references tasks(id) on delete set null,
  task_name text, -- Guardar o nome caso a tarefa seja deletada
  points_earned integer not null,
  photo_url text, -- Mural de Fotos
  timestamp timestamp with time zone default now()
);

-- 6. TABELA DE CONQUISTAS (ACHIEVEMENTS)
create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  icon text,
  points_required integer
);

-- 7. TABELA DE CONQUISTAS DO USUÁRIO
create table if not exists user_achievements (
  user_id uuid references profiles(id),
  achievement_id uuid references achievements(id),
  earned_at timestamp with time zone default now(),
  primary key (user_id, achievement_id)
);

-- Triggers para atualizar pontos automaticamente podem ser adicionados depois.

-- 8. FUNÇÃO PARA INCREMENTAR PONTOS (RPC)
create or replace function increment_user_points(user_id uuid, points int)
returns void as $$
begin
  update profiles
  set total_points = total_points + points
  where id = user_id;
end;
$$ language plpgsql;

-- 9. LOGICA DE NIVEIS E TITULOS (TRIGGER)
create or replace function update_user_level_title()
returns trigger as $$
begin
  -- Definir nível (cada nível requer 500 XP extras)
  new.level := floor(new.total_points / 500) + 1;
  
  -- Definir títulos baseados em pontos
  if new.total_points < 500 then
    new.title := 'Novato da Limpeza';
  elsif new.total_points < 1500 then
    new.title := 'Guerreiro do Pano';
  elsif new.total_points < 3000 then
    new.title := 'Mestre da Louça';
  elsif new.total_points < 6000 then
    new.title := 'Guardião da Ordem';
  else
    new.title := 'Lendário da Faxina';
  end if;
  
  return new;
end;
$$ language plpgsql;

create trigger profile_updates_gamification
before update of total_points on profiles
for each row
execute function update_user_level_title();
