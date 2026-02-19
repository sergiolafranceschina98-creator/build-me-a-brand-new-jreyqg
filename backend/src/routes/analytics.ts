import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, count, and } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/analytics/client/:client_id - Get client analytics
  fastify.get(
    '/api/analytics/client/:client_id',
    {
      schema: {
        description: 'Get analytics for a specific client',
        tags: ['analytics'],
        params: {
          type: 'object',
          required: ['client_id'],
          properties: {
            client_id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              compliance_rate: { type: 'number' },
              total_sessions: { type: 'number' },
              completed_sessions: { type: 'number' },
              strength_progress: {
                type: 'object',
                properties: {
                  squat: { type: 'object' },
                  bench: { type: 'object' },
                  deadlift: { type: 'object' },
                },
              },
              muscle_group_volume: { type: 'object' },
              last_workout_date: { type: ['string', 'null'], format: 'date-time' },
            },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { client_id: string } }>,
      reply
    ) => {
      app.logger.info(
        { clientId: request.params.client_id },
        'Fetching client analytics'
      );

      try {
        // Verify client exists
        const [client] = await app.db
          .select()
          .from(schema.clients)
          .where(eq(schema.clients.id, request.params.client_id));

        if (!client) {
          app.logger.warn(
            { clientId: request.params.client_id },
            'Client not found for analytics'
          );
          return reply.status(404).send({ error: 'Client not found' });
        }

        // Get session statistics
        const allSessions = await app.db
          .select({
            id: schema.workoutSessions.id,
            completed: schema.workoutSessions.completed,
            completedAt: schema.workoutSessions.completedAt,
          })
          .from(schema.workoutSessions)
          .where(eq(schema.workoutSessions.clientId, request.params.client_id));

        const totalSessions = allSessions.length;
        const completedSessions = allSessions.filter((s) => s.completed).length;
        const complianceRate =
          totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

        // Get last workout date
        const completedWorkouts = allSessions
          .filter((s) => s.completedAt)
          .sort((a, b) => {
            const dateA = new Date(a.completedAt!).getTime();
            const dateB = new Date(b.completedAt!).getTime();
            return dateB - dateA;
          });

        const lastWorkoutDate =
          completedWorkouts.length > 0 ? completedWorkouts[0].completedAt : null;

        // Get exercise logs for strength progress
        const exerciseLogs = await app.db
          .select()
          .from(schema.exerciseLogs)
          .where(eq(schema.exerciseLogs.clientId, request.params.client_id));

        // Calculate strength progress for main lifts
        const strengthProgress = {
          squat: {
            firstLog: null as any,
            lastLog: null as any,
            progress: 0,
          },
          bench: {
            firstLog: null as any,
            lastLog: null as any,
            progress: 0,
          },
          deadlift: {
            firstLog: null as any,
            lastLog: null as any,
            progress: 0,
          },
        };

        // Process squat logs
        const squatLogs = exerciseLogs
          .filter(
            (l) =>
              l.exerciseName.toLowerCase().includes('squat') ||
              l.exerciseName.toLowerCase().includes('leg press')
          )
          .sort(
            (a, b) =>
              new Date(a.loggedAt).getTime() -
              new Date(b.loggedAt).getTime()
          );

        if (squatLogs.length > 0) {
          strengthProgress.squat.firstLog = {
            weight: parseFloat(squatLogs[0].weightUsed),
            reps: squatLogs[0].repsCompleted,
            date: squatLogs[0].loggedAt,
          };
          strengthProgress.squat.lastLog = {
            weight: parseFloat(squatLogs[squatLogs.length - 1].weightUsed),
            reps: squatLogs[squatLogs.length - 1].repsCompleted,
            date: squatLogs[squatLogs.length - 1].loggedAt,
          };
          strengthProgress.squat.progress =
            strengthProgress.squat.lastLog.weight -
            strengthProgress.squat.firstLog.weight;
        }

        // Process bench logs
        const benchLogs = exerciseLogs
          .filter(
            (l) =>
              l.exerciseName.toLowerCase().includes('bench') ||
              l.exerciseName.toLowerCase().includes('chest press')
          )
          .sort(
            (a, b) =>
              new Date(a.loggedAt).getTime() -
              new Date(b.loggedAt).getTime()
          );

        if (benchLogs.length > 0) {
          strengthProgress.bench.firstLog = {
            weight: parseFloat(benchLogs[0].weightUsed),
            reps: benchLogs[0].repsCompleted,
            date: benchLogs[0].loggedAt,
          };
          strengthProgress.bench.lastLog = {
            weight: parseFloat(benchLogs[benchLogs.length - 1].weightUsed),
            reps: benchLogs[benchLogs.length - 1].repsCompleted,
            date: benchLogs[benchLogs.length - 1].loggedAt,
          };
          strengthProgress.bench.progress =
            strengthProgress.bench.lastLog.weight -
            strengthProgress.bench.firstLog.weight;
        }

        // Process deadlift logs
        const deadliftLogs = exerciseLogs
          .filter((l) => l.exerciseName.toLowerCase().includes('deadlift'))
          .sort(
            (a, b) =>
              new Date(a.loggedAt).getTime() -
              new Date(b.loggedAt).getTime()
          );

        if (deadliftLogs.length > 0) {
          strengthProgress.deadlift.firstLog = {
            weight: parseFloat(deadliftLogs[0].weightUsed),
            reps: deadliftLogs[0].repsCompleted,
            date: deadliftLogs[0].loggedAt,
          };
          strengthProgress.deadlift.lastLog = {
            weight: parseFloat(
              deadliftLogs[deadliftLogs.length - 1].weightUsed
            ),
            reps: deadliftLogs[deadliftLogs.length - 1].repsCompleted,
            date: deadliftLogs[deadliftLogs.length - 1].loggedAt,
          };
          strengthProgress.deadlift.progress =
            strengthProgress.deadlift.lastLog.weight -
            strengthProgress.deadlift.firstLog.weight;
        }

        // Calculate muscle group volume
        const muscleGroupVolume: Record<string, number> = {};
        for (const log of exerciseLogs) {
          const volume = parseFloat(log.weightUsed) * log.repsCompleted;
          const muscleGroup = determineMuscleGroup(log.exerciseName);
          muscleGroupVolume[muscleGroup] =
            (muscleGroupVolume[muscleGroup] || 0) + volume;
        }

        app.logger.info(
          {
            clientId: request.params.client_id,
            complianceRate: complianceRate.toFixed(2),
            completedSessions,
          },
          'Analytics calculated'
        );

        return {
          compliance_rate: Math.round(complianceRate),
          total_sessions: totalSessions,
          completed_sessions: completedSessions,
          strength_progress: strengthProgress,
          muscle_group_volume: muscleGroupVolume,
          last_workout_date: lastWorkoutDate,
        };
      } catch (error) {
        app.logger.error(
          { err: error, clientId: request.params.client_id },
          'Failed to fetch analytics'
        );
        throw error;
      }
    }
  );
}

// Helper function to determine muscle group from exercise name
function determineMuscleGroup(exerciseName: string): string {
  const lower = exerciseName.toLowerCase();

  if (
    lower.includes('squat') ||
    lower.includes('leg press') ||
    lower.includes('leg') ||
    lower.includes('lunge') ||
    lower.includes('hack')
  ) {
    return 'Legs';
  }
  if (
    lower.includes('deadlift') ||
    lower.includes('pull') ||
    lower.includes('row') ||
    lower.includes('back') ||
    lower.includes('lat')
  ) {
    return 'Back';
  }
  if (
    lower.includes('bench') ||
    lower.includes('press') ||
    lower.includes('push') ||
    lower.includes('chest')
  ) {
    return 'Chest';
  }
  if (
    lower.includes('shoulder') ||
    lower.includes('overhead') ||
    lower.includes('ohp')
  ) {
    return 'Shoulders';
  }
  if (lower.includes('curl') || lower.includes('arm')) {
    return 'Arms';
  }
  if (lower.includes('core') || lower.includes('abs')) {
    return 'Core';
  }

  return 'Other';
}
