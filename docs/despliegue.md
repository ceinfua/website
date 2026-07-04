# Despliegue en Producción

Notas de cómo quedó configurado el despliegue en Vercel, qué cuentas/servicios están
involucrados, y qué falta para tener envío de email real. Complementa `local-dev-notes.md`
(que cubre el entorno local).

## Servicios usados

- **Vercel**: hosting y build (`ceinfuas-projects/website`). Proyecto conectado al repo
  `ceinfua/website` en GitHub, deploys automáticos en cada push a `main`.
- **Neon**: Postgres de producción (proyecto "website", región `sa-east-1`).
- **Resend**: envío de emails transaccionales (verificación de cuenta, invitaciones).
- **Vercel Blob**: almacenamiento de imágenes de News/Events (store `website-blob`).

## Repositorio: público, y por qué

`ceinfua/website` es público (AGPL-3.0-or-later). Además de la intención de que el proyecto
sea open source, ser público resuelve una restricción del plan Hobby de Vercel: si el repo es
privado, Vercel bloquea deploys de un commit cuyo autor no tenga acceso directo al proyecto de
Vercel ("Deployment Blocked... Hobby Plan does not support collaboration for private
repositories"). El commit author (`fedebarriosd`, cuenta personal, usada por trazabilidad) no
era miembro del team de Vercel, así que con el repo privado los pushes suyos quedaban
bloqueados. Con el repo público el chequeo no aplica.

## Prisma con output personalizado: por qué hace falta `postinstall`

El `generator client` en `schema.prisma` usa `output = "../app/generated/prisma"`, una carpeta
gitignoreada (correctamente: es código generado). Sin un paso explícito, Vercel nunca corre
`prisma generate` durante el build, y el build falla con
`Module not found: Can't resolve '@/app/generated/prisma/client'`. Se resolvió agregando en
`package.json`:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

## Variables de entorno (Production, en Vercel)

Ojo: agregar variables de entorno **antes** del primer deploy no es posible desde la pantalla
de importación de Vercel; hay que agregarlas después desde Project → Settings → Environment
Variables, y volver a desplegar para que tomen efecto.

| Variable | Valor | Sensible |
|---|---|---|
| `DATABASE_URL` | connection string **pooled** de Neon (host con `-pooler`) | Sí |
| `RESEND_API_KEY` | API key de Resend | Sí |
| `EMAIL_FROM` | remitente (ver sección de dominio abajo) | No |
| `NEXTAUTH_SECRET` | generado con `openssl rand -base64 32` | Sí |
| `NEXTAUTH_URL` | URL pública del deploy, ej. `https://website-omega-tan-10.vercel.app` (sin `/` final) | No |
| `BLOB_READ_WRITE_TOKEN` | se autocompleta al conectar el store de Vercel Blob al proyecto | (ya sensible por defecto) |

**`DATABASE_URL` pooled vs. directa**: la connection string *pooled* de Neon (con `-pooler` en
el host) es la que va en Vercel, porque las funciones serverless abren muchas conexiones cortas
y necesitan el pooler (PgBouncer). La connection string *directa* (sin `-pooler`) es la que se
usa localmente para migraciones y seed (`prisma migrate deploy`, `prisma db seed`), porque el
pooler no soporta bien las operaciones a nivel de sesión que las migraciones necesitan. No hay
que mezclarlas.

## Por qué hace falta un dominio propio para email real

Sin un dominio verificado en Resend, `EMAIL_FROM` tiene que usar el remitente de prueba
`onboarding@resend.dev`. Esa dirección **solo puede enviar al email dueño de la cuenta de
Resend** (403 `Testing domain restriction` para cualquier otro destinatario) — no sirve para
mandarle un email de verificación a un estudiante real que se registre con su propio correo.

Para que el flujo de registro funcione con cualquier destinatario, hace falta:

1. Comprar un dominio propio (ej. `ceinfua.org`).
2. Verificarlo en Resend (Domains → Add Domain), agregando los registros DNS (SPF/DKIM) que
   Resend indica.
3. Cambiar `EMAIL_FROM` a una dirección de ese dominio, ej. `CEINFUA <no-reply@ceinfua.org>`.

Comprar el dominio no da automáticamente una casilla de correo usable (`fede@ceinfua.org`):
verificarlo en Resend solo habilita **enviar** desde ese dominio. Para recibir correo ahí hace
falta además un proveedor de casillas (Google Workspace, Zoho, Migadu) o, más barato, un
servicio de reenvío como ImprovMX.

## Cuenta admin inicial vs. cuentas admin reales

`prisma/seed.ts` crea un admin de bootstrap (`admin@ceinfua.local`, ver
`local-dev-notes.md`). Para cuentas admin reales de personas concretas, el camino es:

- Si la persona también va a tener perfil de estudiante: que se registre por `/register`
  (crea `User` + `Student`), y después un admin existente la promueve a `ADMIN` desde
  `/admin/roles`.
- Si es una cuenta puramente administrativa (sin `Student` asociado, como el buzón institucional
  `centroinformaticaua@gmail.com`): no puede crearse por `/register`, porque ese endpoint
  siempre crea también una fila `Student` en la misma transacción. Hay que crearla directo en la
  base (estilo `prisma/seed.ts`) o vía Prisma Studio.
