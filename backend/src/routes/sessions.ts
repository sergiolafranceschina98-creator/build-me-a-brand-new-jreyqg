import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';
import type { App } from '../index.js';

interface CompleteSessionBody {
  exercises: Array<{
    exercise_name: string;
    weight_used: number;
    reps_completed: number;
    rpe?: number;
    notes?: string;
  }>;
}

interface LogExerciseBody {
  exercise_name: string;
  weight_used: number;
  reps_completed: number;
  rpe?: number;
  notes?: string;
}

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/sessions/program/:program_id - Get all sessions for a program
  fastify.get(
    '/api/sessions/program/:program_id',
    {
      schema: {
        description: 'Get all sessions for a specific program',
        tags: ['sessions'],
        params: {
          type: 'object',
          required: ['program_id'],
          properties: {
            program_id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                program_id: { type: 'string', format: 'uuid' },
                client_id: { type: 'string', format: 'uuid' },
                week_number: { type: 'number' },
                day_number: { type: 'number' },
                session_name: { type: 'string' },
                exercises: { type: 'array' },
                completed: { type: 'boolean' },
                completed_at: { type: ['string', 'null'], format: 'date-time' },
                notes: { type: ['string', 'null'] },
                created_at: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { program_id: string } }>,
      reply
    ) => {
      app.logger.info(
        { programId: request.params.program_id },
        'Fetching program sessions'
      );

      try {
        const sessions = await app.db
          .select()
          .from(schema.workoutSessions)
          .where(
            eq(schema.workoutSessions.programId, request.params.program_id)
          );

        app.logger.info(
          { programId: request.params.program_id, count: sessions.length },
          'Sessions fetched'
        );
        return sessions.map(s => ({
          id: s.id,
          program_id: s.programId,
          client_id: s.clientId,
          week_number: s.weekNumber,
          day_number: s.dayNumber,
          session_name: s.sessionName,
          exercises: s.exercises,
          completed: s.completed,
          completed_at: s.completedAt,
          notes: s.notes,
          created_at: s.createdAt,
        }));
      } catch (error) {
        app.logger.error(
          { err: error, programId: request.params.program_id },
          'Failed to fetch sessions'
        );
        throw error;
      }
    }
  );

  // GET /api/sessions/:id - Get session details
  fastify.get(
    '/api/sessions/:id',
    {
      schema: {
        description: 'Get session details with exercises',
        tags: ['sessions'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              program_id: { type: 'string', format: 'uuid' },
              client_id: { type: 'string', format: 'uuid' },
              week_number: { type: 'number' },
              day_number: { type: 'number' },
              session_name: { type: 'string' },
              exercises: { type: 'array' },
              completed: { type: 'boolean' },
              completed_at: { type: ['string', 'null'], format: 'date-time' },
              notes: { type: ['string', 'null'] },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      app.logger.info({ sessionId: request.params.id }, 'Fetching session');

      try {
        const [session] = await app.db
          .select()
          .from(schema.workoutSessions)
          .where(eq(schema.workoutSessions.id, request.params.id));

        if (!session) {
          app.logger.warn(
            { sessionId: request.params.id },
            'Session not found'
          );
          return reply.status(404).send({ error: 'Session not found' });
        }

        app.logger.info(
          { sessionId: session.id },
          'Session fetched successfully'
        );
        return {
          id: session.id,
          program_id: session.programId,
          client_id: session.clientId,
          week_number: session.weekNumber,
          day_number: session.dayNumber,
          session_name: session.sessionName,
          exercises: session.exercises,
          completed: session.completed,
          completed_at: session.completedAt,
          notes: session.notes,
          created_at: session.createdAt,
        };
      } catch (error) {
        app.logger.error(
          { err: error, sessionId: request.params.id },
          'Failed to fetch session'
        );
        throw error;
      }
    }
  );

  // PUT /api/sessions/:id/complete - Complete session and log exercises
  fastify.put(
    '/api/sessions/:id/complete',
    {
      schema: {
        description: 'Mark session as complete and log exercise data',
        tags: ['sessions'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['exercises'],
          properties: {
            exercises: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: [
                  'exercise_name',
                  'weight_used',
                  'reps_completed',
                ],
                properties: {
                  exercise_name: { type: 'string' },
                  weight_used: { type: 'number' },
                  reps_completed: { type: 'number' },
                  rpe: { type: 'number', minimum: 1, maximum: 10 },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              program_id: { type: 'string', format: 'uuid' },
              client_id: { type: 'string', format: 'uuid' },
              week_number: { type: 'number' },
              day_number: { type: 'number' },
              session_name: { type: 'string' },
              exercises: { type: 'array' },
              completed: { type: 'boolean' },
              completed_at: { type: 'string', format: 'date-time' },
              notes: { type: ['string', 'null'] },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: CompleteSessionBody;
      }>,
      reply
    ) => {
      app.logger.info(
        { sessionId: request.params.id, exerciseCount: request.body.exercises.length },
        'Completing session'
      );

      try {
        // Update session as completed
        const [session] = await app.db
          .update(schema.workoutSessions)
          .set({
            completed: true,
            completedAt: new Date(),
          })
          .where(eq(schema.workoutSessions.id, request.params.id))
          .returning();

        if (!session) {
          app.logger.warn(
            { sessionId: request.params.id },
            'Session not found for completion'
          );
          return reply.status(404).send({ error: 'Session not found' });
        }

        // Log each exercise
        for (const exercise of request.body.exercises) {
          await app.db
            .insert(schema.exerciseLogs)
            .values({
              sessionId: session.id,
              clientId: session.clientId,
              exerciseName: exercise.exercise_name,
              weightUsed: exercise.weight_used.toString(),
              repsCompleted: exercise.reps_completed,
              rpe: exercise.rpe || null,
              notes: exercise.notes || null,
            });
        }

        app.logger.info(
          { sessionId: session.id, exerciseCount: request.body.exercises.length },
          'Session completed and exercises logged'
        );

        return {
          id: session.id,
          program_id: session.programId,
          client_id: session.clientId,
          week_number: session.weekNumber,
          day_number: session.dayNumber,
          session_name: session.sessionName,
          exercises: session.exercises,
          completed: session.completed,
          completed_at: session.completedAt,
          notes: session.notes,
          created_at: session.createdAt,
        };
      } catch (error) {
        app.logger.error(
          { err: error, sessionId: request.params.id },
          'Failed to complete session'
        );
        throw error;
      }
    }
  );

  // POST /api/sessions/:id/log - Log individual exercise
  fastify.post(
    '/api/sessions/:id/log',
    {
      schema: {
        description: 'Log individual exercise for a session',
        tags: ['sessions'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['exercise_name', 'weight_used', 'reps_completed'],
          properties: {
            exercise_name: { type: 'string' },
            weight_used: { type: 'number' },
            reps_completed: { type: 'number' },
            rpe: { type: 'number', minimum: 1, maximum: 10 },
            notes: { type: 'string' },
          },
        },
        response: {
          201: {
            description: 'Exercise logged successfully',
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              session_id: { type: 'string', format: 'uuid' },
              client_id: { type: 'string', format: 'uuid' },
              exercise_name: { type: 'string' },
              weight_used: { type: 'number' },
              reps_completed: { type: 'number' },
              rpe: { type: ['number', 'null'] },
              notes: { type: ['string', 'null'] },
              logged_at: { type: 'string', format: 'date-time' },
            },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: LogExerciseBody;
      }>,
      reply
    ) => {
      app.logger.info(
        { sessionId: request.params.id, exercise: request.body.exercise_name },
        'Logging exercise'
      );

      try {
        // Verify session exists
        const [session] = await app.db
          .select()
          .from(schema.workoutSessions)
          .where(eq(schema.workoutSessions.id, request.params.id));

        if (!session) {
          app.logger.warn(
            { sessionId: request.params.id },
            'Session not found for exercise log'
          );
          return reply.status(404).send({ error: 'Session not found' });
        }

        // Create exercise log
        const [log] = await app.db
          .insert(schema.exerciseLogs)
          .values({
            sessionId: session.id,
            clientId: session.clientId,
            exerciseName: request.body.exercise_name,
            weightUsed: request.body.weight_used.toString(),
            repsCompleted: request.body.reps_completed,
            rpe: request.body.rpe || null,
            notes: request.body.notes || null,
          })
          .returning();

        app.logger.info(
          { logId: log.id, sessionId: session.id },
          'Exercise logged successfully'
        );

        reply.status(201);
        return {
          id: log.id,
          session_id: log.sessionId,
          client_id: log.clientId,
          exercise_name: log.exerciseName,
          weight_used: log.weightUsed ? parseFloat(log.weightUsed) : null,
          reps_completed: log.repsCompleted,
          rpe: log.rpe,
          notes: log.notes,
          logged_at: log.loggedAt,
        };
      } catch (error) {
        app.logger.error(
          { err: error, sessionId: request.params.id },
          'Failed to log exercise'
        );
        throw error;
      }
    }
  );
}
