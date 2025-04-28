
-- Table des opérateurs
create table operators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  productivity int not null, -- Boîtes par heure moyennes
  total_boxes_processed int not null default 0,
  total_time_spent int not null default 0 -- en minutes
);

-- Table des lots
create table batches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  medication_name text not null,
  total_boxes int not null,
  processed_boxes int not null default 0,
  received_date date not null,
  expected_completion_date date not null,
  status text not null check (status in ('pending', 'in-progress', 'completed', 'delayed'))
);

-- Table des affectations (assignments)
create table assignments (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references batches(id) on delete cascade,
  operator_id uuid not null references operators(id),
  operator_name text not null, -- Dénormalisé, peut évoluer : pour garder un historique
  assigned_boxes int not null,
  processed_boxes int not null default 0,
  start_time timestamptz not null,
  end_time timestamptz, -- null = en cours
  expected_end_time timestamptz not null,
  status text not null check (status in ('pending', 'in-progress', 'completed'))
);

-- Table des performances (optionnel : peut être vue matérialisée/calcul)
create table performances (
  operator_id uuid primary key references operators(id),
  operator_name text not null,
  average_speed int not null, -- Boîtes par heure
  total_boxes_processed int not null,
  total_assignments int not null,
  completed_on_time int not null,
  efficiency int not null -- pourcentage
);

-- Table des anomalies
create table anomalies (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  batch_id uuid not null references batches(id) on delete cascade,
  operator_id uuid not null references operators(id),
  type text not null check (type in ('damaged_box', 'empty_case', 'missing_from_original', 'other')),
  quantity int not null,
  description text,
  detection_date timestamptz not null default now(),
  deviation_number text
);

-- Table pour la planification
create table planning (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references batches(id) on delete cascade,
  planned_start_date date not null,
  planned_end_date date not null,
  required_operators int not null,
  priority int not null default 1,
  notes text
);

