import app from './app';
import { env } from './config/env';
import { sequelize } from './config/database';

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to DB:', error);
  }
}

startServer();

