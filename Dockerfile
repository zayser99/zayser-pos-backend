# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Limitar uso de memoria en compilación (VPS austeros)
ENV NODE_OPTIONS="--max-old-space-size=512"

# Instalar dependencias necesarias para Prisma en Alpine
RUN apk add --no-cache openssl

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./
# Copiar el esquema de prisma para poder generar el cliente
COPY prisma ./prisma

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Generar cliente de Prisma
RUN pnpm dlx prisma generate

# Copiar el resto del código y compilar
COPY . .
RUN pnpm run build

# Eliminar dependencias de desarrollo para aligerar la imagen final
RUN pnpm prune --prod

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Prisma requiere OpenSSL para conectarse a la base de datos en Alpine
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3001
# Limitar memoria en producción para evitar OOM (Out of Memory) en el VPS
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copiar archivos compilados y dependencias de producción
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

# Iniciar la aplicación
CMD ["node", "dist/main.js"]
