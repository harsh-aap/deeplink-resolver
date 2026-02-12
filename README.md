# DeepLink Resolver

A production-ready deeplink resolution service built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- 🚀 Express.js REST API
- 🔒 Security headers with Helmet
- 📊 Request logging with Morgan
- 🗄️ PostgreSQL database with Sequelize ORM
- 🔄 Graceful shutdown handling
- 📦 PM2 process management for production
- 🛡️ Environment variable validation
- ⚡ Compression middleware

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

The server will start at `http://localhost:8000`

### Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

## API Endpoints

### Health Check
```
GET /api/deeplink/health
```

Returns service status.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build)
- `npm run start:prod` - Start with PM2 in production mode
- `npm run stop` - Stop PM2 processes
- `npm run restart` - Restart PM2 processes
- `npm run logs` - View PM2 logs
- `npm run status` - Check PM2 status
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Rollback last migration

## Environment Variables

See `.env.example` for all available configuration options.

Required variables:
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASS` - Database password

Optional variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 8000)
- `LOG_LEVEL` - Logging level (default: info)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `ALLOWED_ORIGINS` - CORS allowed origins (production only)

## Project Structure

```
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middlewares
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── dist/                   # Compiled JavaScript (generated)
├── logs/                   # Application logs
├── ecosystem.config.js     # PM2 configuration
├── tsconfig.json          # TypeScript configuration
└── DEPLOYMENT.md          # Deployment guide
```

## License

ISC
