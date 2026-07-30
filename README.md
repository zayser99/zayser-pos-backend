# 🥐 Zayser POS - Backend (API)

Este es el backend oficial (API REST) para el Punto de Venta (POS) y Tienda en Línea de **Trenzas y Conchas Mexicanas**. Está construido sobre el poderoso framework [NestJS](https://nestjs.com/), utilizando [Prisma ORM](https://www.prisma.io/) para la conexión robusta y tipada con la base de datos PostgreSQL.

## 🚀 Tecnologías Principales

- **Framework:** NestJS (Node.js)
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Autenticación:** Better-Auth
- **Lenguaje:** TypeScript
- **Gestor de Paquetes:** pnpm

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/en/) (v20 o superior recomendado)
- [pnpm](https://pnpm.io/installation) (Gestor de paquetes)
- Una instancia de **PostgreSQL** corriendo localmente o en la nube (ej. Supabase, Neon).

## 🛠️ Instalación y Configuración Local

1. **Clonar el repositorio y entrar al directorio:**
   ```bash
   cd zayser-pos-api
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Configurar Variables de Entorno:**
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Rellena los valores en el `.env`, especialmente la cadena de conexión a la base de datos:
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/zayser_db?schema=public"
   ```

4. **Sincronizar la Base de Datos (Prisma):**
   Aplica las migraciones y genera el cliente tipado para tu base de datos:
   ```bash
   pnpm dlx prisma migrate dev
   # o si ya tienes la BD creada:
   pnpm dlx prisma db push
   pnpm dlx prisma generate
   ```

5. **Ejecutar el servidor de desarrollo:**
   ```bash
   pnpm run start:dev
   ```
   El servidor se levantará (generalmente en `http://localhost:3001`).

## 🐳 Despliegue con Docker (Producción / VPS)

El proyecto incluye un `Dockerfile` súper optimizado (Multi-stage build en Alpine Linux), diseñado específicamente para servidores pequeños o VPS austeros (DigitalOcean, AWS Lightsail, etc.).

1. **Construir la imagen:**
   ```bash
   docker build -t zayser-pos-api .
   ```

2. **Ejecutar el contenedor:**
   ```bash
   docker run -d -p 3001:3001 --env-file .env --name api-backend zayser-pos-api
   ```

> **Aviso de Rendimiento (VPS):** 
> El `Dockerfile` ya implementa un límite de memoria estricto (`NODE_OPTIONS="--max-old-space-size=512"`) y usa `pnpm prune --prod` para purgar dependencias innecesarias, previniendo cuelgues por *Out of Memory* (OOM Killer).
> También incluye la librería `openssl` nativa para asegurar compatibilidad absoluta del motor de Prisma dentro de Alpine Linux.

## 🗄️ Comandos Útiles de Prisma

- Abrir la interfaz visual de la base de datos: `pnpm dlx prisma studio`
- Crear una nueva migración tras cambiar el archivo `schema.prisma`: `pnpm dlx prisma migrate dev --name descripcion_del_cambio`

## 📁 Estructura del Proyecto

- `prisma/`: Esquema de la base de datos (`schema.prisma`) y migraciones.
- `src/`: Lógica de negocio (Controladores, Servicios, Módulos).
  - `src/main.ts`: Punto de entrada de la aplicación.
- `test/`: Pruebas End-to-End e unitarias.
