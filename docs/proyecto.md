# CEINFUA Website — Documentación del Proyecto

Visión general de lo construido hasta ahora. Basado en las specs e implementation plans del
pipeline de ICM (`Interpreted-Context-Methdology/workspaces/feature-development/stages/`), más
lo aprendido operando el proyecto localmente. Para detalles de configuración día a día, ver
`docs/local-dev-notes.md`.

## Qué es

Portal web para el Centro de Estudiantes de Ingeniería Informática de la Universidad Americana
(CEINFUA). Publica novedades y eventos, y lleva un registro de los miembros del centro de
estudiantes con control de acceso basado en roles.

## Funcionalidades construidas

### 1. Base del proyecto (bootstrap)

Next.js (App Router) + TypeScript + Tailwind, Prisma contra Postgres local (vía Docker
Compose). Modelos iniciales `News` y `Event`, con páginas placeholder `/`, `/news`, `/events`.
Esta es la base sobre la que se construyó todo lo demás: sin ella, ninguna otra feature tiene
dónde apoyarse.

### 2. Registro de estudiantes y control de acceso por roles (RBAC)

Sistema de autenticación (NextAuth/Auth.js, Credentials provider) y modelo de permisos con
cuatro roles:

| Rol | Ver propio registro | Ver todos los estudiantes | Editar propio registro | Editar cualquier estudiante | Crear estudiantes | Gestionar roles |
|---|---|---|---|---|---|---|
| `STUDENT` | Sí | No | Sí | No | No (solo a sí mismo) | No |
| `CEINFUA_MEMBER` | Sí | Sí | Sí | Sí | Sí | No |
| `ADMIN` | Sí | Sí | Sí | Sí | Sí | Sí |
| `EXTERNAL_PARTNER` | N/A | Campos limitados (`nombre`, `apellido`, `cedula`, `telefono`) | No | No | No | No |

**Por qué existe `EXTERNAL_PARTNER`:** partners logísticos externos (ej. una empresa de
courier) necesitan confirmar que un estudiante existe y poder contactarlo, sin ver su perfil
completo (correo, carrera, año de ingreso, estado).

**Modelo de datos:** `User` (autenticación: email, hash de contraseña, rol) separado de
`Student` (datos de perfil, en español porque el dato es leído por stakeholders no técnicos),
vinculados 1 a 1. Esta separación evita que una consulta de `external-partner` toque
credenciales en algún momento.

**Flujos de alta de estudiantes, dos caminos:**
- **Autorregistro** (`/register`): cualquiera puede crearse una cuenta `STUDENT`. Requiere
  verificación de email antes de poder iniciar sesión.
- **Alta por staff**: un `CEINFUA_MEMBER`/`ADMIN` crea el `User` (sin contraseña) + `Student`
  desde `/students`, el sistema manda una invitación con un `claimToken` de un solo uso, y la
  persona invitada define su contraseña en `/claim-account?token=...` para activar la cuenta.

**Cierre de sesión:** cualquier usuario autenticado ve un botón "Cerrar sesión" en la barra de
navegación (`app/components/LogoutButton.tsx`), que invalida la sesión/JWT vía `signOut()` de
NextAuth y redirige a `/login`. No requiere ruta ni endpoint propio: `signOut()` usa el handler
ya expuesto en `/api/auth/**`.

**Cambio de contraseña:** cualquier usuario autenticado puede cambiar su propia contraseña desde
`/profile` (`app/profile/password-form.tsx` + `PATCH /api/profile/password`), ingresando la
contraseña actual y la nueva. Solo autoservicio: no hay forma de que un `ADMIN`/`CEINFUA_MEMBER`
resetee la contraseña de otro usuario (eso queda fuera de alcance, ver más abajo) ni un flujo de
"olvidé mi contraseña" sin sesión. Esto también es lo que se usa para rotar la contraseña del
admin sembrado por el seed, en vez de tener que volver a correr `npx prisma db seed`.

**Gestión de roles:** solo un `ADMIN` puede cambiar el rol de otro usuario, desde
`/admin/roles`. No existe alta pública para roles que no sean `STUDENT`: es una restricción
intencional, por seguridad. El sistema impide degradar al último `ADMIN` restante, para evitar
quedar sin ningún admin.

**Bootstrap del primer admin:** como no puede haber alta pública de admins, el primer usuario
`ADMIN` se crea con un script de seed (`prisma/seed.ts` → `npx prisma db seed`). Ver
`docs/local-dev-notes.md` para las credenciales de desarrollo.

### 3. Gestión de novedades (News) — CRUD de administración

Solo un `ADMIN` puede crear, editar y borrar noticias desde `/admin/news`
(`app/api/admin/news/route.ts` + `app/api/admin/news/[id]/route.ts`). La publicación es
inmediata: no hay estado de borrador ni flujo de aprobación. Cada noticia tiene título, cuerpo
y una imagen de portada opcional.

**Imágenes:** se suben a Vercel Blob (`lib/blob.ts`), validando tipo (`png`/`jpeg`/`webp`) y
tamaño (máx. 5MB) antes de subir. Al reemplazar o borrar una noticia, la imagen vieja también se
borra del blob store, para no dejar archivos huérfanos.

**Página pública `/news`:** ya no es un placeholder — trae las últimas 10 noticias
(`createdAt` descendente) directamente vía Prisma en el server component, y expone "Cargar más"
que pagina con cursor contra `GET /api/news` (ruta pública, sin autenticación — ver
`docs/permissions.md`).

**Eventos (`/events`, `/admin/events`) quedan fuera de esta iteración** — mismo patrón, se
construye en una PR separada (ver sección "Lo que falta" abajo).

## Decisiones de arquitectura relevantes

- **Email en desarrollo:** se usa Resend, pero sin `RESEND_API_KEY` configurada el sistema no
  falla: loguea el email (asunto y link) en la consola del servidor en lugar de enviarlo. Así
  los flujos de registro e invitación se pueden probar completos sin cuenta real de email.
- **IDs de las tablas:** en un principio los `id` se generaban con `cuid()` del lado de Prisma
  Client (código de la app). Se migró a que Postgres los genere directamente
  (`gen_random_uuid()`), porque el generador del lado de la app le impedía a Prisma Studio
  insertar filas manualmente (no tenía forma de calcular el default). Detalle completo en
  `docs/local-dev-notes.md`.
- **Nombres de campos en español, código en inglés:** los modelos/enums de Prisma están en
  inglés (convención del código), pero los campos de datos del estudiante (`nombre`,
  `apellido`, `cedula`, `carrera`, `estado`, etc.) están en español porque el dato en sí es
  consumido y leído directamente por stakeholders no técnicos.

## Lo que falta / queda fuera de alcance (por ahora)

Marcado explícitamente como fuera de alcance en las specs, para futuras iteraciones:
- Recuperación de contraseña ("forgot password"): el flujo de `claim-account` es distinto y no
  lo cubre
- Importación masiva de estudiantes (CSV)
- Auditoría de quién cambió qué
- Rate limiting / anti-abuso en `/api/register`
- Autenticación multifactor
- Deploy a producción (cuentas de GitHub/Vercel/Neon, dominio, secretos de producción)
- Pulido visual/UI más allá de formularios funcionales
- CRUD de Events (crear, editar, borrar eventos desde la app): News ya lo tiene (`/admin/news`,
  ver sección 3 arriba), Events se construye en una PR separada siguiendo el mismo patrón
- Múltiples imágenes por noticia/evento, recorte/redimensionado, o una librería de medios
- Categorías, tags o búsqueda de texto completo sobre News/Events

## Dónde está cada cosa

- Specs (qué se construye y por qué): `Interpreted-Context-Methdology/workspaces/feature-development/stages/01-spec/output/`
- Planes de implementación (cómo se construye, paso a paso): `.../stages/02-implementation/output/`
- Descripciones de PR: `.../stages/03-pr/output/`
- Notas operativas de desarrollo local (Docker, Prisma, credenciales): `docs/local-dev-notes.md`
- Sobre la licencia (AGPL) y qué implica: `docs/licencia.md`
