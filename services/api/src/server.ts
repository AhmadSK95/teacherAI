import path from 'node:path';
import { createApp } from './app.js';
import { createDatabase, runMigrations, createServices, initTemplates } from '@teachassist/core';
import { InMemoryQueue, createGeneratePackageHandler } from '@teachassist/worker';

const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'teachassist.db');

// Initialize database
import fs from 'node:fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = createDatabase(DB_PATH);
runMigrations(db);

// Initialize services
const services = createServices(db);

// Initialize prompt templates
initTemplates();

// Seed demo teacher if none exists
if (services.repos.teachers.findAll().length === 0) {
  services.repos.teachers.create({
    teacher_id: crypto.randomUUID(),
    email: 'demo@school.edu',
    display_name: 'Demo Teacher',
    grade_bands: [6, 7, 8, 9, 10, 11, 12],
    subjects: ['Math', 'Science', 'English', 'History'],
    preferred_languages: ['en'],
    output_defaults: { medium: 'google_doc', include_tiers: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log('[API] Demo teacher profile created');
}

// Initialize queue and register handler
const queue = new InMemoryQueue();
queue.registerHandler('generate-package', createGeneratePackageHandler(services) as any);

const app = createApp({ services, queue });

app.listen(PORT, () => {
  console.log(`[API] TeachAssist API running on http://localhost:${PORT}`);
  console.log(`[API] Health check: http://localhost:${PORT}/v1/health`);
});
