import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';
import type { App } from '../index.js';

interface ExerciseSwapQuery {
  exercise_name: string;
  muscle_group: string;
  equipment: string;
  client_id: string;
}

interface ExerciseSuggestion {
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  reason: string;
}

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/exercises/swap - Get alternative exercise suggestions
  fastify.get(
    '/api/exercises/swap',
    {
      schema: {
        description:
          'Get AI-suggested alternative exercises that target the same muscle group',
        tags: ['exercises'],
        querystring: {
          type: 'object',
          required: ['exercise_name', 'muscle_group', 'equipment', 'client_id'],
          properties: {
            exercise_name: { type: 'string' },
            muscle_group: { type: 'string' },
            equipment: { type: 'string' },
            client_id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                muscle_group: { type: 'string' },
                equipment: { type: 'string' },
                difficulty: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: ExerciseSwapQuery }>,
      reply
    ) => {
      app.logger.info(
        {
          exercise: request.query.exercise_name,
          muscleGroup: request.query.muscle_group,
          clientId: request.query.client_id,
        },
        'Generating exercise swap suggestions'
      );

      try {
        // Fetch client to check for injuries
        const [client] = await app.db
          .select()
          .from(schema.clients)
          .where(eq(schema.clients.id, request.query.client_id));

        if (!client) {
          app.logger.warn(
            { clientId: request.query.client_id },
            'Client not found for exercise swap'
          );
          return reply.status(404).send({ error: 'Client not found' });
        }

        const prompt = `You are an expert fitness coach. Suggest 5 alternative exercises that target the same muscle group as "${request.query.exercise_name}" (${request.query.muscle_group}).

Requirements:
1. All exercises must work with: ${request.query.equipment}
2. Avoid exercises that may cause injury to client with: ${client.injuries || 'no known injuries'}
3. Match the client's experience level: ${client.experience}
4. Progressively increase difficulty in the suggestions (easier to harder)
5. Include brief explanation for why each would be good for this client

Return only exercises that are appropriate substitutes for the same muscle group.`;

        // Generate suggestions based on muscle group and equipment
        const suggestions: ExerciseSuggestion[] = [];
        const muscleGroup = request.query.muscle_group.toLowerCase();
        const equipment = request.query.equipment.toLowerCase();

        // Base suggestions for common muscle groups
        const suggestionMap: Record<string, ExerciseSuggestion[]> = {
          'quadriceps': [
            { name: 'Leg Press', muscle_group: 'Quadriceps', equipment: 'Machine', difficulty: 'Beginner', reason: 'Lower impact alternative for knee health' },
            { name: 'Bulgarian Split Squat', muscle_group: 'Quadriceps', equipment: 'Dumbbells', difficulty: 'Intermediate', reason: 'Single-leg variation for strength balance' },
            { name: 'Smith Machine Squat', muscle_group: 'Quadriceps', equipment: 'Barbell', difficulty: 'Intermediate', reason: 'Guided movement for form consistency' },
            { name: 'Hack Squat', muscle_group: 'Quadriceps', equipment: 'Machine', difficulty: 'Intermediate', reason: 'Machine-guided for safety' },
            { name: 'Sissy Squat', muscle_group: 'Quadriceps', equipment: 'Bodyweight', difficulty: 'Advanced', reason: 'Advanced quad isolation movement' },
          ],
          'hamstrings': [
            { name: 'Romanian Deadlift', muscle_group: 'Hamstrings', equipment: 'Barbell', difficulty: 'Intermediate', reason: 'Hip hinge movement for hamstring focus' },
            { name: 'Leg Curl Machine', muscle_group: 'Hamstrings', equipment: 'Machine', difficulty: 'Beginner', reason: 'Isolated machine movement' },
            { name: 'Nordic Curl', muscle_group: 'Hamstrings', equipment: 'Bodyweight', difficulty: 'Advanced', reason: 'Advanced eccentric hamstring work' },
            { name: 'Glute-Ham Raise', muscle_group: 'Hamstrings', equipment: 'Machine', difficulty: 'Advanced', reason: 'Specialized hamstring developer' },
            { name: 'Dumbbell Deadlift', muscle_group: 'Hamstrings', equipment: 'Dumbbells', difficulty: 'Intermediate', reason: 'Dumbbell variation for accessibility' },
          ],
          'chest': [
            { name: 'Dumbbell Bench Press', muscle_group: 'Chest', equipment: 'Dumbbells', difficulty: 'Intermediate', reason: 'Greater range of motion than barbell' },
            { name: 'Machine Chest Press', muscle_group: 'Chest', equipment: 'Machine', difficulty: 'Beginner', reason: 'Controlled movement pattern' },
            { name: 'Decline Push-Up', muscle_group: 'Chest', equipment: 'Bodyweight', difficulty: 'Intermediate', reason: 'Increased difficulty for chest emphasis' },
            { name: 'Machine Fly', muscle_group: 'Chest', equipment: 'Machine', difficulty: 'Beginner', reason: 'Isolation movement for chest' },
            { name: 'Push-Up', muscle_group: 'Chest', equipment: 'Bodyweight', difficulty: 'Beginner', reason: 'Fundamental movement option' },
          ],
          'back': [
            { name: 'Lat Pulldown', muscle_group: 'Back', equipment: 'Machine', difficulty: 'Beginner', reason: 'Controlled pulling movement' },
            { name: 'Dumbbell Row', muscle_group: 'Back', equipment: 'Dumbbells', difficulty: 'Intermediate', reason: 'Single-arm variation for balance' },
            { name: 'Inverted Row', muscle_group: 'Back', equipment: 'Bodyweight', difficulty: 'Intermediate', reason: 'Bodyweight pulling option' },
            { name: 'Chest-Supported Row', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'Intermediate', reason: 'Reduces lower back stress' },
            { name: 'Machine Row', muscle_group: 'Back', equipment: 'Machine', difficulty: 'Beginner', reason: 'Stable rowing motion' },
          ],
        };

        // Get suggestions for the muscle group
        let baseSuggestions = suggestionMap[muscleGroup] || [
          { name: 'Machine Exercise', muscle_group: request.query.muscle_group, equipment: 'Machine', difficulty: 'Beginner', reason: 'Safe alternative targeting the same muscle group' },
          { name: 'Dumbbells Alternative', muscle_group: request.query.muscle_group, equipment: 'Dumbbells', difficulty: 'Intermediate', reason: 'Dumbbell variation for your muscle group' },
          { name: 'Bodyweight Option', muscle_group: request.query.muscle_group, equipment: 'Bodyweight', difficulty: 'Beginner', reason: 'Bodyweight exercise for the same muscles' },
        ];

        // Filter by equipment if specified
        if (equipment && equipment !== 'full gym access' && equipment !== 'all') {
          baseSuggestions = baseSuggestions.filter(s =>
            s.equipment.toLowerCase().includes(equipment) ||
            equipment.includes(s.equipment.toLowerCase()) ||
            equipment === 'any'
          );
        }

        // Return up to 5 suggestions, prioritizing accessibility and avoiding client injuries
        const finalSuggestions = baseSuggestions.slice(0, 5);
        if (finalSuggestions.length === 0) {
          finalSuggestions.push({
            name: 'Alternative Exercise',
            muscle_group: request.query.muscle_group,
            equipment: request.query.equipment,
            difficulty: 'Intermediate',
            reason: 'Suitable alternative for your equipment and muscle group',
          });
        }

        app.logger.info(
          {
            exercise: request.query.exercise_name,
            suggestionCount: finalSuggestions.length,
          },
          'Exercise suggestions generated'
        );

        return finalSuggestions.map((s) => ({
          name: s.name,
          muscle_group: s.muscle_group,
          equipment: s.equipment,
          difficulty: s.difficulty,
          reason: s.reason,
        }));
      } catch (error) {
        app.logger.error(
          { err: error, exercise: request.query.exercise_name },
          'Failed to generate exercise suggestions'
        );
        throw error;
      }
    }
  );
}
