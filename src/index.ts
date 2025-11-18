import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import config from './config';

// Carregar variáveis de ambiente
dotenv.config();

class Server {
  private app: Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = config.port;
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    // Security
    this.app.use(helmet());

    // CORS - permitir requisições do frontend Angular
    this.app.use(
      cors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          // Permitir requisições sem origin (mobile apps, Postman, etc.)
          if (!origin) return callback(null, true);

          if (config.allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Origin não permitida pelo CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    // Parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }
  }

  private configureRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Distrito Racing API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          profiles: '/api/profiles',
          cars: '/api/cars',
          events: '/api/events',
          products: '/api/products',
          orders: '/api/orders',
          addresses: '/api/addresses',
        },
      });
    });
  }

  private configureErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${this.port}`);
      console.log(`📝 Ambiente: ${config.nodeEnv}`);
      console.log(`🔒 CORS habilitado para: ${config.allowedOrigins.join(', ')}`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

// Inicializar e startar servidor
const server = new Server();
server.start();

export default server.getApp();
