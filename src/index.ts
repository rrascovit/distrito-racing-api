import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
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

    // Rate Limiting - proteção contra brute force
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // Máximo de 100 requisições por IP
      message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.',
      standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
      legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
    });

    // Aplicar rate limiting em todas as rotas
    this.app.use('/api', limiter);

    // CORS - permitir requisições do frontend Angular
    this.app.use(
      cors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          // Permitir requisições sem origin apenas em desenvolvimento
          if (!origin) {
            if (config.nodeEnv === 'development') {
              return callback(null, true);
            }
            return callback(new Error('Origin obrigatória em produção'));
          }

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

    // Logging com sanitização de dados sensíveis
    morgan.token('sanitized-auth', (req: Request) => {
      const auth = req.headers.authorization;
      return auth ? 'Bearer [REDACTED]' : 'none';
    });

    if (config.nodeEnv === 'development') {
      // Dev: log simples sem dados sensíveis
      this.app.use(morgan(':method :url :status :response-time ms'));
    } else {
      // Produção: log com IP para auditoria, mas sem tokens
      this.app.use(morgan(':remote-addr :method :url :status :response-time ms - auth: :sanitized-auth'));
    }
  }

  private configureRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Root endpoint - informações básicas sem expor estrutura
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Distrito Racing API',
        version: '1.0.0',
        status: 'online',
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
