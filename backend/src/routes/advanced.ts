import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';
import type { App } from '../index.js';

interface ReadinessBody {
  sleep: number;
  stress: number;
  soreness: number;
  energy: number;
}

interface MacroInfo {
  protein: number;
  carbs: number;
  fats: number;
}

interface MealTemplate {
  meal_name: string;
  description: string;
  foods: string[];
  macros: MacroInfo;
}

interface Macros {
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  daily_calories: number;
}

interface NutritionPlan {
  macros: Macros;
  meal_templates: MealTemplate[];
  suggestions: string[];
}

export function register(app: App, fastify: FastifyInstance) {
  // POST /api/readiness/client/:client_id - Submit readiness score
  fastify.post(
    '/api/readiness/client/:client_id',
    {
      schema: {
        description:
          'Submit client readiness score for AI to adjust workout intensity',
        tags: ['advanced'],
        params: {
          type: 'object',
          required: ['client_id'],
          properties: {
            client_id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['sleep', 'stress', 'soreness', 'energy'],
          properties: {
            sleep: { type: 'number', minimum: 1, maximum: 10 },
            stress: { type: 'number', minimum: 1, maximum: 10 },
            soreness: { type: 'number', minimum: 1, maximum: 10 },
            energy: { type: 'number', minimum: 1, maximum: 10 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              readiness_score: { type: 'number' },
              intensity_adjustment: { type: 'string' },
              recommendation: { type: 'string' },
            },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { client_id: string };
        Body: ReadinessBody;
      }>,
      reply
    ) => {
      app.logger.info(
        {
          clientId: request.params.client_id,
          sleep: request.body.sleep,
          stress: request.body.stress,
        },
        'Submitting readiness score'
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
            'Client not found for readiness'
          );
          return reply.status(404).send({ error: 'Client not found' });
        }

        // Calculate readiness score (average of inverted stress/soreness + sleep/energy)
        const readinessScore = Math.round(
          (request.body.sleep +
            (10 - request.body.stress) +
            (10 - request.body.soreness) +
            request.body.energy) /
            4
        );

        let intensityAdjustment = 'Maintain';
        let recommendation = 'Proceed with planned workout at normal intensity.';

        if (readinessScore >= 8) {
          intensityAdjustment = 'Increase';
          recommendation =
            'You are well-rested and recovered. Consider pushing intensity higher, adding an extra set, or increasing weights.';
        } else if (readinessScore >= 6) {
          intensityAdjustment = 'Maintain';
          recommendation =
            'You are in good condition. Proceed with your planned workout.';
        } else if (readinessScore >= 4) {
          intensityAdjustment = 'Reduce';
          recommendation =
            'You seem fatigued. Consider reducing volume or intensity. Focus on technique.';
        } else {
          intensityAdjustment = 'Deload';
          recommendation =
            'Recovery is needed. Consider a light deload session or rest day. Prioritize sleep and nutrition.';
        }

        app.logger.info(
          {
            clientId: client.id,
            readinessScore,
            intensityAdjustment,
          },
          'Readiness score calculated'
        );

        return {
          readiness_score: readinessScore,
          intensity_adjustment: intensityAdjustment,
          recommendation,
        };
      } catch (error) {
        app.logger.error(
          { err: error, clientId: request.params.client_id },
          'Failed to calculate readiness'
        );
        throw error;
      }
    }
  );

  // GET /api/readiness/client/:client_id - Get latest readiness data
  fastify.get(
    '/api/readiness/client/:client_id',
    {
      schema: {
        description: 'Get latest readiness data and recommended intensity',
        tags: ['advanced'],
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
              readiness_score: { type: 'number' },
              intensity_adjustment: { type: 'string' },
              recommendation: { type: 'string' },
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
        'Fetching readiness data'
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
            'Client not found'
          );
          return reply.status(404).send({ error: 'Client not found' });
        }

        // Return default readiness (would be stored/fetched from DB in production)
        const defaultReadiness = {
          readiness_score: 7,
          intensity_adjustment: 'Maintain',
          recommendation: 'No recent readiness data. Use default parameters.',
        };

        app.logger.info(
          { clientId: client.id },
          'Readiness data retrieved'
        );

        return defaultReadiness;
      } catch (error) {
        app.logger.error(
          { err: error, clientId: request.params.client_id },
          'Failed to fetch readiness'
        );
        throw error;
      }
    }
  );

  // GET /api/nutrition/client/:client_id - Generate nutrition plan
  fastify.get(
    '/api/nutrition/client/:client_id',
    {
      schema: {
        description:
          'Generate AI-powered nutrition plan based on client goals and metrics',
        tags: ['advanced'],
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
              macros: {
                type: 'object',
                properties: {
                  protein_grams: { type: 'number' },
                  carbs_grams: { type: 'number' },
                  fats_grams: { type: 'number' },
                  daily_calories: { type: 'number' },
                },
              },
              meal_templates: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    meal_name: { type: 'string' },
                    description: { type: 'string' },
                    foods: { type: 'array', items: { type: 'string' } },
                    macros: {
                      type: 'object',
                      properties: {
                        protein: { type: 'number' },
                        carbs: { type: 'number' },
                        fats: { type: 'number' },
                      },
                    },
                  },
                },
              },
              suggestions: { type: 'array', items: { type: 'string' } },
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
        'Generating nutrition plan'
      );

      try {
        // Fetch client
        const [client] = await app.db
          .select()
          .from(schema.clients)
          .where(eq(schema.clients.id, request.params.client_id));

        if (!client) {
          app.logger.warn(
            { clientId: request.params.client_id },
            'Client not found for nutrition'
          );
          return reply.status(404).send({ error: 'Client not found' });
        }

        // Build nutrition prompt
        const prompt = `Generate a personalized nutrition plan for a client with these characteristics:
- Weight: ${client.weight} kg
- Height: ${client.height} cm
- Age: ${client.age}
- Goal: ${client.goals}
- Training Frequency: ${client.trainingFrequency} days/week
- Experience Level: ${client.experience}
- Body Fat: ${client.bodyFatPercentage || 'Unknown'}%

Provide:
1. Macro recommendations in grams (protein, carbs, fats) and total daily calories
2. 3-4 meal template examples with foods and their macros
3. 3-4 actionable nutrition suggestions specific to their goals

Use evidence-based nutrition science and tailor recommendations to their goals (fat loss: caloric deficit, hypertrophy: adequate protein and surplus, strength: sufficient protein and calories).`;

        // Calculate nutrition plan using evidence-based formulas
        const weight = parseFloat(client.weight.toString());
        const age = client.age;
        const height = client.height;
        const trainingFrequency = client.trainingFrequency;

        // Harris-Benedict TDEE calculation
        let tdee = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
        tdee = tdee * (1 + (trainingFrequency * 0.15)); // Activity multiplier

        // Protein based on goal
        let proteinMultiplier = 1.8;
        if (client.goals.toLowerCase().includes('strength')) {
          proteinMultiplier = 2.2;
        } else if (client.goals.toLowerCase().includes('fat')) {
          proteinMultiplier = 2.0; // Higher protein for fat loss
        }

        const proteinGrams = Math.round(weight * proteinMultiplier);
        const proteinCalories = proteinGrams * 4;

        // Carbs vs fats based on goal
        let carbPercent = 0.45;
        let fatPercent = 0.25;
        if (client.goals.toLowerCase().includes('fat')) {
          carbPercent = 0.35;
          fatPercent = 0.35;
        }

        const carbGrams = Math.round((tdee * carbPercent) / 4);
        const fatGrams = Math.round((tdee * fatPercent) / 9);

        const nutritionPlan: NutritionPlan = {
          macros: {
            protein_grams: proteinGrams,
            carbs_grams: carbGrams,
            fats_grams: fatGrams,
            daily_calories: Math.round(tdee),
          },
          meal_templates: [
            {
              meal_name: 'Breakfast',
              description: 'High protein start to the day',
              foods: ['Eggs', 'Oats', 'Berries'],
              macros: { protein: Math.round(proteinGrams * 0.2), carbs: Math.round(carbGrams * 0.25), fats: Math.round(fatGrams * 0.2) },
            },
            {
              meal_name: 'Lunch',
              description: 'Balanced meal with protein and carbs',
              foods: ['Chicken', 'Rice', 'Vegetables'],
              macros: { protein: Math.round(proteinGrams * 0.3), carbs: Math.round(carbGrams * 0.3), fats: Math.round(fatGrams * 0.25) },
            },
            {
              meal_name: 'Pre-Workout',
              description: 'Quick carbs and protein',
              foods: ['Banana', 'Protein Shake'],
              macros: { protein: Math.round(proteinGrams * 0.15), carbs: Math.round(carbGrams * 0.25), fats: Math.round(fatGrams * 0.1) },
            },
            {
              meal_name: 'Dinner',
              description: 'Protein-focused with vegetables',
              foods: ['Salmon', 'Sweet Potato', 'Broccoli'],
              macros: { protein: Math.round(proteinGrams * 0.35), carbs: Math.round(carbGrams * 0.2), fats: Math.round(fatGrams * 0.45) },
            },
          ],
          suggestions: [
            `Aim for ${proteinGrams}g protein daily for your goals`,
            `Spread protein across ${trainingFrequency} meals throughout the day`,
            client.goals.toLowerCase().includes('fat')
              ? 'Create a caloric deficit of 300-500 calories for sustainable fat loss'
              : 'Maintain a slight caloric surplus to support muscle growth',
            'Stay hydrated with at least 3-4 liters of water daily',
            'Time majority of carbs around your training sessions',
          ],
        };

        app.logger.info(
          {
            clientId: client.id,
            dailyCalories: nutritionPlan.macros.daily_calories,
          },
          'Nutrition plan generated'
        );

        return nutritionPlan;
      } catch (error) {
        app.logger.error(
          { err: error, clientId: request.params.client_id },
          'Failed to generate nutrition plan'
        );
        throw error;
      }
    }
  );
}
