import { Sequelize } from 'sequelize';
import { env } from './env';

export const db = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASS,
  {
    host: env.DB_HOST,
    dialect: 'postgres',
    logging: env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // For AWS RDS
      }
    }
  }
);
// Export as 'sequelize' for backward compatibility
export const sequelize = db;