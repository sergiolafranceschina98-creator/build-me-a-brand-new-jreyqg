import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';
import type { App } from '../index.js';

interface CreateClientBody {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string;
  trainingFrequency: number;
  equipment: string;
  injuries?: string;
  preferredExercises?: string;
  sessionDuration: number;
  bodyFatPercentage?: number;
  squat1rm?: number;
  bench1rm?: number;
  deadlift1rm?: number;
}

interface UpdateClientBody {
  name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  experience?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string;
  trainingFrequency?: number;
  equipment?: string;
  injuries?: string;
  preferredExercises?: string;
  sessionDuration?: number;
  bodyFatPercentage?: number;
  squat1rm?: number;
  bench1rm?: number;
  deadlift1rm?: number;
}

export function register(app: App, fastify: FastifyInstance) {
  // POST /api/clients - Create a new client
  fastify.post(
    '/api/clients',
    {
      schema: {
        description: 'Create a new client profile',
        tags: ['clients'],
        body: {
          type: 'object',
          required: [
            'name',
            'age',
            'gender',
            'height',
            'weight',
            'experience',
            'goals',
            'trainingFrequency',
            'equipment',
            'sessionDuration',
          ],
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            gender: { type: 'string' },
            height: { type: 'number', description: 'Height in cm' },
            weight: { type: 'number', description: 'Weight in kg' },
            experience: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
            },
            goals: { type: 'string' },
            trainingFrequency: {
              type: 'number',
              description: 'Days per week (2-6)',
            },
            equipment: { type: 'string' },
            injuries: { type: 'string' },
            preferredExercises: { type: 'string' },
            sessionDuration: {
              type: 'number',
              description: 'Duration in minutes (45, 60, or 90)',
            },
            bodyFatPercentage: { type: 'number' },
            squat1rm: { type: 'number' },
            bench1rm: { type: 'number' },
            deadlift1rm: { type: 'number' },
          },
        },
        response: {
          201: {
            description: 'Client created successfully',
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              age: { type: 'number' },
              gender: { type: 'string' },
              height: { type: 'number' },
              weight: { type: ['number', 'null'] },
              experience: { type: 'string' },
              goals: { type: 'string' },
              trainingFrequency: { type: 'number' },
              equipment: { type: 'string' },
              injuries: { type: ['string', 'null'] },
              preferredExercises: { type: ['string', 'null'] },
              sessionDuration: { type: 'number' },
              bodyFatPercentage: { type: ['number', 'null'] },
              squat1rm: { type: ['number', 'null'] },
              bench1rm: { type: ['number', 'null'] },
              deadlift1rm: { type: ['number', 'null'] },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          400: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: CreateClientBody }>,
      reply: FastifyReply
    ) => {
      app.logger.info({ body: request.body }, 'Creating new client');

      try {
        const [client] = await app.db
          .insert(schema.clients)
          .values({
            name: request.body.name,
            age: request.body.age,
            gender: request.body.gender,
            height: request.body.height,
            weight: request.body.weight.toString(),
            experience: request.body.experience,
            goals: request.body.goals,
            trainingFrequency: request.body.trainingFrequency,
            equipment: request.body.equipment,
            injuries: request.body.injuries ?? null,
            preferredExercises: request.body.preferredExercises ?? null,
            sessionDuration: request.body.sessionDuration,
            bodyFatPercentage:
              request.body.bodyFatPercentage !== undefined
                ? String(request.body.bodyFatPercentage)
                : null,
            squat1rm:
              request.body.squat1rm !== undefined
                ? String(request.body.squat1rm)
                : null,
            bench1rm:
              request.body.bench1rm !== undefined
                ? String(request.body.bench1rm)
                : null,
            deadlift1rm:
              request.body.deadlift1rm !== undefined
                ? String(request.body.deadlift1rm)
                : null,
          })
          .returning();

        app.logger.info({ clientId: client.id }, 'Client created successfully');
        reply.status(201);
        return {
          ...client,
          weight: client.weight ? parseFloat(client.weight) : null,
          bodyFatPercentage: client.bodyFatPercentage ? parseFloat(client.bodyFatPercentage) : null,
          squat1rm: client.squat1rm ? parseFloat(client.squat1rm) : null,
          bench1rm: client.bench1rm ? parseFloat(client.bench1rm) : null,
          deadlift1rm: client.deadlift1rm ? parseFloat(client.deadlift1rm) : null,
        };
      } catch (error) {
        app.logger.error(
          { err: error, body: request.body },
          'Failed to create client'
        );
        throw error;
      }
    }
  );

  // GET /api/clients - Get all clients (summary)
  fastify.get(
    '/api/clients',
    {
      schema: {
        description: 'Get all clients with summary information',
        tags: ['clients'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                age: { type: 'number' },
                gender: { type: 'string' },
                goals: { type: 'string' },
                experience: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async () => {
      app.logger.info('Fetching all clients');

      try {
        const allClients = await app.db
          .select({
            id: schema.clients.id,
            name: schema.clients.name,
            age: schema.clients.age,
            gender: schema.clients.gender,
            goals: schema.clients.goals,
            experience: schema.clients.experience,
            createdAt: schema.clients.createdAt,
          })
          .from(schema.clients);

        app.logger.info({ count: allClients.length }, 'Clients fetched');
        return allClients;
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch clients');
        throw error;
      }
    }
  );

  // GET /api/clients/:id - Get full client profile
  fastify.get(
    '/api/clients/:id',
    {
      schema: {
        description: 'Get full client profile with all details',
        tags: ['clients'],
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
              name: { type: 'string' },
              age: { type: 'number' },
              gender: { type: 'string' },
              height: { type: 'number' },
              weight: { type: ['number', 'null'] },
              experience: { type: 'string' },
              goals: { type: 'string' },
              trainingFrequency: { type: 'number' },
              equipment: { type: 'string' },
              injuries: { type: ['string', 'null'] },
              preferredExercises: { type: ['string', 'null'] },
              sessionDuration: { type: 'number' },
              bodyFatPercentage: { type: ['number', 'null'] },
              squat1rm: { type: ['number', 'null'] },
              bench1rm: { type: ['number', 'null'] },
              deadlift1rm: { type: ['number', 'null'] },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      app.logger.info({ clientId: request.params.id }, 'Fetching client');

      try {
        const [client] = await app.db
          .select()
          .from(schema.clients)
          .where(eq(schema.clients.id, request.params.id));

        if (!client) {
          app.logger.warn(
            { clientId: request.params.id },
            'Client not found'
          );
          return reply.status(404).send({ error: 'Client not found' });
        }

        app.logger.info(
          { clientId: client.id },
          'Client fetched successfully'
        );
        return {
          ...client,
          weight: client.weight ? parseFloat(client.weight) : null,
          bodyFatPercentage: client.bodyFatPercentage ? parseFloat(client.bodyFatPercentage) : null,
          squat1rm: client.squat1rm ? parseFloat(client.squat1rm) : null,
          bench1rm: client.bench1rm ? parseFloat(client.bench1rm) : null,
          deadlift1rm: client.deadlift1rm ? parseFloat(client.deadlift1rm) : null,
        };
      } catch (error) {
        app.logger.error(
          { err: error, clientId: request.params.id },
          'Failed to fetch client'
        );
        throw error;
      }
    }
  );

  // PUT /api/clients/:id - Update client
  fastify.put(
    '/api/clients/:id',
    {
      schema: {
        description: 'Update client profile',
        tags: ['clients'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            gender: { type: 'string' },
            height: { type: 'number' },
            weight: { type: 'number' },
            experience: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            goals: { type: 'string' },
            trainingFrequency: { type: 'number' },
            equipment: { type: 'string' },
            injuries: { type: ['string', 'null'] },
            preferredExercises: { type: ['string', 'null'] },
            sessionDuration: { type: 'number' },
            bodyFatPercentage: { type: ['number', 'null'] },
            squat1rm: { type: ['number', 'null'] },
            bench1rm: { type: ['number', 'null'] },
            deadlift1rm: { type: ['number', 'null'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              age: { type: 'number' },
              gender: { type: 'string' },
              height: { type: 'number' },
              weight: { type: ['number', 'null'] },
              experience: { type: 'string' },
              goals: { type: 'string' },
              trainingFrequency: { type: 'number' },
              equipment: { type: 'string' },
              injuries: { type: ['string', 'null'] },
              preferredExercises: { type: ['string', 'null'] },
              sessionDuration: { type: 'number' },
              bodyFatPercentage: { type: ['number', 'null'] },
              squat1rm: { type: ['number', 'null'] },
              bench1rm: { type: ['number', 'null'] },
              deadlift1rm: { type: ['number', 'null'] },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateClientBody }>,
      reply
    ) => {
      app.logger.info(
        { clientId: request.params.id, body: request.body },
        'Updating client'
      );

      try {
        const updateData: Record<string, any> = {};

        if (request.body.name !== undefined)
          updateData.name = request.body.name;
        if (request.body.age !== undefined) updateData.age = request.body.age;
        if (request.body.gender !== undefined)
          updateData.gender = request.body.gender;
        if (request.body.height !== undefined)
          updateData.height = request.body.height;
        if (request.body.weight !== undefined)
          updateData.weight = request.body.weight.toString();
        if (request.body.experience !== undefined)
          updateData.experience = request.body.experience;
        if (request.body.goals !== undefined)
          updateData.goals = request.body.goals;
        if (request.body.trainingFrequency !== undefined)
          updateData.trainingFrequency = request.body.trainingFrequency;
        if (request.body.equipment !== undefined)
          updateData.equipment = request.body.equipment;
        if (request.body.injuries !== undefined)
          updateData.injuries = request.body.injuries;
        if (request.body.preferredExercises !== undefined)
          updateData.preferredExercises = request.body.preferredExercises;
        if (request.body.sessionDuration !== undefined)
          updateData.sessionDuration = request.body.sessionDuration;
        if (request.body.bodyFatPercentage !== undefined)
          updateData.bodyFatPercentage = request.body.bodyFatPercentage?.toString();
        if (request.body.squat1rm !== undefined)
          updateData.squat1rm = request.body.squat1rm?.toString();
        if (request.body.bench1rm !== undefined)
          updateData.bench1rm = request.body.bench1rm?.toString();
        if (request.body.deadlift1rm !== undefined)
          updateData.deadlift1rm = request.body.deadlift1rm?.toString();

        updateData.updatedAt = new Date();

        const [updated] = await app.db
          .update(schema.clients)
          .set(updateData)
          .where(eq(schema.clients.id, request.params.id))
          .returning();

        if (!updated) {
          app.logger.warn(
            { clientId: request.params.id },
            'Client not found for update'
          );
          return reply.status(404).send({ error: 'Client not found' });
        }

        app.logger.info(
          { clientId: updated.id },
          'Client updated successfully'
        );
        return {
          ...updated,
          weight: updated.weight ? parseFloat(updated.weight) : null,
          bodyFatPercentage: updated.bodyFatPercentage ? parseFloat(updated.bodyFatPercentage) : null,
          squat1rm: updated.squat1rm ? parseFloat(updated.squat1rm) : null,
          bench1rm: updated.bench1rm ? parseFloat(updated.bench1rm) : null,
          deadlift1rm: updated.deadlift1rm ? parseFloat(updated.deadlift1rm) : null,
        };
      } catch (error) {
        app.logger.error(
          { err: error, clientId: request.params.id, body: request.body },
          'Failed to update client'
        );
        throw error;
      }
    }
  );

  // DELETE /api/clients/:id - Delete client
  fastify.delete(
    '/api/clients/:id',
    {
      schema: {
        description: 'Delete client and all associated programs/sessions',
        tags: ['clients'],
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
            properties: { success: { type: 'boolean' } },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      app.logger.info({ clientId: request.params.id }, 'Deleting client');

      try {
        const [deleted] = await app.db
          .delete(schema.clients)
          .where(eq(schema.clients.id, request.params.id))
          .returning({ id: schema.clients.id });

        if (!deleted) {
          app.logger.warn(
            { clientId: request.params.id },
            'Client not found for deletion'
          );
          return reply.status(404).send({ error: 'Client not found' });
        }

        app.logger.info({ clientId: deleted.id }, 'Client deleted successfully');
        return { success: true };
      } catch (error) {
        app.logger.error(
          { err: error, clientId: request.params.id },
          'Failed to delete client'
        );
        throw error;
      }
    }
  );
}
