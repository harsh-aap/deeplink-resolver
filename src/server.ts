import app from './app';
import { env, validateEnv } from './config/env';
import { sequelize } from './config/database';

let server: any;

async function startServer() {
  try {
    // Validate environment variables
    validateEnv();
    console.log(`🔧 Environment: ${env.NODE_ENV}`);

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Start HTTP server
    server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err: any) => {
          if (err) reject(err);
          else resolve(true);
        });
      });
      console.log('✅ HTTP server closed');
    }

    // Close database connections
    await sequelize.close();
    console.log('✅ Database connections closed');

    console.log('👋 Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

startServer();


