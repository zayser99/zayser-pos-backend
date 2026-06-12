import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      const errorMsg = 'DATABASE_URL no está definida en las variables de entorno.';
      Logger.error(errorMsg, PrismaService.name);
      throw new Error(errorMsg);
    }

    // Configuración del Pool de conexiones de pg de forma profesional:
    // Extraemos o definimos valores de configuración del pool.
    const pool = new Pool({
      connectionString: databaseUrl,
      // Configuración avanzada del pool para control total
      max: Number(configService.get<string>('DATABASE_POOL_MAX', '10')),
      idleTimeoutMillis: Number(
        configService.get<string>('DATABASE_POOL_IDLE_TIMEOUT', '30000'),
      ),
      connectionTimeoutMillis: Number(
        configService.get<string>('DATABASE_POOL_CONN_TIMEOUT', '15000'),
      ),
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log:
        configService.get<string>('NODE_ENV') === 'development'
          ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ]
          : [
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ],
    });

    this.pool = pool;

    // Si estamos en desarrollo, logueamos las queries de Prisma de forma limpia
    if (configService.get<string>('NODE_ENV') === 'development') {
      // Usamos el hook de eventos para loguear la query
      (this as any).$on('query', (e: any) => {
        this.logger.debug(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
      });
    }
  }

  async onModuleInit() {
    try {
      this.logger.log(
        'Estableciendo conexión con la base de datos PostgreSQL (vía Driver Adapter)...',
      );
      await this.$connect();
      this.logger.log('Conexión con la base de datos establecida con éxito.');
    } catch (error) {
      this.logger.error('Error al conectar con la base de datos:', error);
      // Evitamos lanzar el error para permitir que la aplicación arranque
      // y pueda reportar errores de salud (health checks) o manejar reconexiones.
    }
  }

  async onModuleDestroy() {
    this.logger.log('Cerrando conexión con la base de datos y deteniendo el pool de conexiones...');
    try {
      await this.$disconnect();
      await this.pool.end();
      this.logger.log('Conexión con la base de datos y pool cerrados de forma limpia.');
    } catch (error) {
      this.logger.error('Error al cerrar la conexión de base de datos:', error);
    }
  }
}
