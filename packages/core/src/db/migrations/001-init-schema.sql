-- TeachAssist AI: Initial schema — 12 core entities

CREATE TABLE IF NOT EXISTS teacher_profile (
  teacher_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  grade_bands TEXT NOT NULL DEFAULT '[]',      -- JSON array
  subjects TEXT NOT NULL DEFAULT '[]',          -- JSON array
  preferred_languages TEXT NOT NULL DEFAULT '["en"]', -- JSON array
  output_defaults TEXT NOT NULL DEFAULT '{}',   -- JSON object
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS class_profile (
  class_id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teacher_profile(teacher_id),
  name TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 6 AND 12),
  subject TEXT NOT NULL,
  period_length_minutes INTEGER NOT NULL CHECK (period_length_minutes > 0),
  roster_count INTEGER NOT NULL DEFAULT 0 CHECK (roster_count >= 0),
  support_flags TEXT NOT NULL DEFAULT '[]',     -- JSON array
  routine_blocks TEXT NOT NULL DEFAULT '[]',    -- JSON array
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS request_event (
  request_id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teacher_profile(teacher_id),
  class_id TEXT REFERENCES class_profile(class_id),
  prompt_text TEXT NOT NULL,
  attachment_ids TEXT NOT NULL DEFAULT '[]',    -- JSON array
  inferred_intent TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attachment_meta (
  attachment_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES request_event(request_id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes >= 0),
  parse_success INTEGER NOT NULL DEFAULT 0,
  extracted_topics TEXT NOT NULL DEFAULT '[]',  -- JSON array
  confidence REAL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plan_graph (
  plan_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES request_event(request_id),
  task_nodes TEXT NOT NULL DEFAULT '[]',        -- JSON array
  dependency_edges TEXT NOT NULL DEFAULT '[]',  -- JSON array
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS artifact_output (
  artifact_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES request_event(request_id),
  plan_id TEXT NOT NULL REFERENCES plan_graph(plan_id),
  medium_type TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  tier TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',          -- JSON object
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS edit_event (
  edit_id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES artifact_output(artifact_id),
  teacher_id TEXT NOT NULL REFERENCES teacher_profile(teacher_id),
  edit_type TEXT NOT NULL,
  before_snippet TEXT,
  after_snippet TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS approval_event (
  approval_id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES artifact_output(artifact_id),
  risk_level TEXT NOT NULL,
  status TEXT NOT NULL,
  approved_by TEXT NOT NULL REFERENCES teacher_profile(teacher_id),
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS export_event (
  export_id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES artifact_output(artifact_id),
  medium TEXT NOT NULL,
  destination TEXT NOT NULL,
  success INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outcome_feedback (
  feedback_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES request_event(request_id),
  teacher_id TEXT NOT NULL REFERENCES teacher_profile(teacher_id),
  usefulness_score INTEGER NOT NULL CHECK (usefulness_score BETWEEN 1 AND 5),
  minutes_saved REAL,
  comments TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS district_policy (
  district_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  retention_days INTEGER NOT NULL CHECK (retention_days > 0),
  allowed_models TEXT NOT NULL DEFAULT '[]',    -- JSON array
  redaction_rules TEXT NOT NULL DEFAULT '{}',   -- JSON object
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS language_profile (
  class_id TEXT PRIMARY KEY REFERENCES class_profile(class_id),
  home_languages TEXT NOT NULL DEFAULT '[]',    -- JSON array
  translation_defaults TEXT NOT NULL DEFAULT '[]', -- JSON array
  scaffolding_level TEXT NOT NULL DEFAULT 'intermediate',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
