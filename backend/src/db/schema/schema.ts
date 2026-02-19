import { pgTable, uuid, text, integer, numeric, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender').notNull(),
  height: integer('height').notNull(),
  weight: text('weight').notNull(),
  experience: text('experience').notNull(),
  goals: text('goals').notNull(),
  trainingFrequency: integer('training_frequency').notNull(),
  equipment: text('equipment').notNull(),
  injuries: text('injuries'),
  preferredExercises: text('preferred_exercises'),
  sessionDuration: integer('session_duration').notNull(),
  bodyFatPercentage: text('body_fat_percentage'),
  squat1rm: text('squat_1rm'),
  bench1rm: text('bench_1rm'),
  deadlift1rm: text('deadlift_1rm'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const workoutPrograms = pgTable('workout_programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  programName: text('program_name').notNull(),
  durationWeeks: integer('duration_weeks').notNull(),
  splitType: text('split_type').notNull(),
  programData: jsonb('program_data'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const workoutSessions = pgTable('workout_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').notNull().references(() => workoutPrograms.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  dayNumber: integer('day_number').notNull(),
  sessionName: text('session_name'),
  focusArea: text('focus_area'),
  exercises: jsonb('exercises'),
  notes: text('notes'),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  sessionData: jsonb('session_data'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const exerciseLogs = pgTable('exercise_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => workoutSessions.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  exerciseName: text('exercise_name').notNull(),
  setsCompleted: integer('sets_completed'),
  repsCompleted: integer('reps_completed'),
  weightUsed: text('weight_used'),
  rpe: integer('rpe'),
  notes: text('notes'),
  loggedAt: timestamp('logged_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});
