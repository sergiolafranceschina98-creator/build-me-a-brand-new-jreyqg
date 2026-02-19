import { createApplication } from "@specific-dev/framework";
import * as schema from './db/schema/schema.js';
import { register as registerClientRoutes } from './routes/clients.js';
import { register as registerProgramRoutes } from './routes/programs.js';
import { register as registerSessionRoutes } from './routes/sessions.js';
import { register as registerExerciseRoutes } from './routes/exercises.js';
import { register as registerAnalyticsRoutes } from './routes/analytics.js';

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Register routes
registerClientRoutes(app, app.fastify);
registerProgramRoutes(app, app.fastify);
registerSessionRoutes(app, app.fastify);
registerExerciseRoutes(app, app.fastify);
registerAnalyticsRoutes(app, app.fastify);

await app.run();
app.logger.info('Application running');
