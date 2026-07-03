# CEINFUA Website

[![Licencia: AGPL v3](https://img.shields.io/badge/Licencia-AGPL%20v3-blue.svg)](./LICENSE)

Portal de internet para el Centro de Estudiantes de Ingeniería Informática de la Universidad Americana (CEINFUA): publica noticias, novedades y eventos del centro de estudiantes. También lleva el registro de la membresía del centro con control de acceso por rol (registro de estudiantes, gestión del padrón de staff y administración de roles).

## Requisitos previos

- Node.js (se recomienda v20+)
- Docker + Docker Compose (para Postgres local)

## Configuración

1. Instalar las dependencias:
   ```bash
   npm install
   ```

2. Copiar el archivo de entorno y ajustarlo según haga falta:
   ```bash
   cp .env.example .env
   ```

   Además de `DATABASE_URL`, hacen falta estas variables para que funcionen el login y el envío de mails:
   - `NEXTAUTH_SECRET`: secreto aleatorio usado para firmar los tokens de sesión. Se genera localmente con `openssl rand -base64 32`.
   - `NEXTAUTH_URL`: URL base de la app (`http://localhost:3000` en desarrollo).
   - `RESEND_API_KEY`: API key de [Resend](https://resend.com), usada para enviar los mails de verificación e invitación de cuenta. Se puede dejar vacía en local: `lib/email.ts` detecta que falta la key y en su lugar imprime el mail por consola, así que los flujos de registro e invitación funcionan de punta a punta sin una cuenta real de Resend.
   - `EMAIL_FROM`: dirección de origen usada en los mails salientes.

3. Levantar la base de datos Postgres local:
   ```bash
   docker compose up -d
   ```

4. Aplicar las migraciones de la base de datos:
   ```bash
   npx prisma migrate dev
   ```

5. Sembrar la primera cuenta de administrador (bootstrap):
   ```bash
   npx prisma db seed
   ```
   Crea `admin@ceinfua.local` (contraseña `ChangeMe123!`, ver `prisma/seed.ts`) con rol `ADMIN` y un registro de `Student` vinculado. Es la única forma de obtener un admin inicial; cambiá la contraseña después del primer login. Se puede volver a correr sin problema (upsert).

## Levantar el servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) para ver el sitio.

Páginas disponibles:
- `/` (Inicio), `/news`, `/events`
- `/register`: autorregistro de estudiantes (crea una cuenta sin verificar y envía un mail de verificación)
- `/login`: inicio de sesión con email y contraseña
- `/claim-account?token=...`: para estudiantes agregados manualmente por el staff; permite definir una contraseña para activar la cuenta (el link viene en el mail de invitación)
- `/profile`: registro propio del estudiante logueado (edita `telefono`/`estado`)
- `/students`: padrón completo (`CEINFUA_MEMBER`/`ADMIN`) o búsqueda limitada (`EXTERNAL_PARTNER`: solo nombre, apellido, cédula y teléfono)
- `/admin/roles`: gestión de roles, solo para admins

Si el puerto 3000 ya está en uso, correr en otro puerto:

```bash
npm run dev -- -p 3001
```

### Flujo de estudiante creado por staff

Un usuario `CEINFUA_MEMBER` o `ADMIN` puede crear un registro de `Student` en nombre de otra persona mediante `POST /api/students`, sin que esa persona tenga que autorregistrarse. La cuenta nueva no tiene contraseña: el sistema envía un mail de invitación para reclamar la cuenta (o lo imprime por consola si `RESEND_API_KEY` no está configurada) con un link a `/claim-account?token=...` donde el estudiante define su propia contraseña para activar el login.

## Stack tecnológico

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM (7.x, generador nuevo `prisma-client` con el driver adapter `@prisma/adapter-pg`) contra Postgres local (vía Docker Compose)
- Auth.js / NextAuth v5 (beta) con el provider Credentials + `@auth/prisma-adapter`
- Resend para el envío de mails transaccionales (verificación e invitaciones para reclamar cuenta)

## Notas

- `DATABASE_URL` vive en `.env` (ignorado por git); `.env.example` documenta la forma esperada.
- El `datasource` de Prisma sigue siendo `postgresql` al migrar a un Postgres administrado (Neon/Supabase) para producción; solo cambia `DATABASE_URL`.
- El cliente de Prisma se genera en `app/generated/prisma` (no en la ruta por defecto de `@prisma/client`): importar desde `@/app/generated/prisma/client` o `@/app/generated/prisma/enums`, no directamente desde `@prisma/client`.
- Todavía no está implementado (queda pendiente, fuera del alcance de esta feature): recuperación de contraseña ("olvidé mi contraseña"), importación masiva de estudiantes por CSV, registro de auditoría, límite de tasa en `/api/register`, autenticación multifactor.

## Licencia

Copyright (C) 2026 Federico Barrios.

AGPL-3.0-or-later. Ver [`LICENSE`](./LICENSE) y [`docs/licencia.md`](./docs/licencia.md) para el detalle de por qué se eligió esta licencia. Las versiones modificadas que se ejecuten como servicio de red (no solo distribuidas) también deben liberar su código fuente bajo los mismos términos. Ver [`CONTRIBUTING.md`](./CONTRIBUTING.md) para cómo se licencian las contribuciones.
