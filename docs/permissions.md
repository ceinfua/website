# Permisos de rutas

El acceso a las rutas es denegado por defecto. `proxy.ts` (la convención de
middleware de Next.js) revisa cada request contra `lib/permissions.ts` antes
de que llegue a una página o a un handler de API.

## Cómo funciona

1. **`PUBLIC_ROUTES`**: una lista explícita de patrones (regex) permitidos.
   Un request que coincida con alguno de estos patrones pasa sin
   verificación de sesión.
2. **`PROTECTED_ROUTES`**: patrones asociados a los roles que pueden
   acceder a ellos.
3. Cualquier ruta que no coincida con ninguna de las dos listas igual
   requiere una sesión autenticada (de cualquier rol). No existe un tercer
   estado "desprotegido por defecto".

Es decir, el estado de una ruta siempre es uno de estos tres:

- Explícitamente pública (`PUBLIC_ROUTES`)
- Explícitamente restringida a roles específicos (`PROTECTED_ROUTES`)
- Implícitamente "autenticado, cualquier rol" (no coincide con ninguna lista)

Los requests sin sesión reciben una redirección 307 a `/login` (páginas) o
un 401 en JSON (`/api/**`). Los requests autenticados que no cumplen el
chequeo de rol reciben una redirección a `/` o un 403 en JSON.

## Cómo agregar una ruta nueva

Al agregar una página o ruta de API nueva, hay que decidir su nivel de
acceso y declararlo explícitamente en `lib/permissions.ts`:

- **Pública** (no requiere sesión): agregar un patrón a `PUBLIC_ROUTES`.
- **Restringida a roles específicos**: agregar una entrada
  `{ pattern, roles }` a `PROTECTED_ROUTES`.
- **Solo necesita "cualquier usuario logueado", sin restricción de rol**
  (como `/profile`): no hace falta hacer nada, el chequeo por defecto de
  "autenticado" ya la cubre.

Nunca asumir que una ruta nueva es pública por defecto: si no se agrega en
ningún lado, por defecto va a requerir sesión. Tampoco intentar "salir" del
proxy agregando una ruta a las exclusiones del matcher en `proxy.ts`; solo
`_next/static`, `_next/image` y `favicon.ico` deberían estar excluidos.

## Los chequeos a nivel de recurso quedan en el handler

`proxy.ts` solo ve la URL, no los datos subyacentes, así que solo puede
aplicar un filtro grueso por rol y ruta. Los chequeos de pertenencia (por
ejemplo, que un `EXTERNAL_PARTNER` o `STUDENT` solo acceda a su propio
registro) se siguen verificando dentro del handler (ver `lib/authz.ts` y
los chequeos de self/staff/partner en `app/api/students/[id]/route.ts`).
Que una ruta sea alcanzable según `lib/permissions.ts` no significa que
todos los registros detrás de ella sean accesibles para todos los roles
permitidos.

## Mapa de rutas actual

| Ruta | Acceso |
|---|---|
| `/`, `/events`, `/news`, `/login`, `/register`, `/claim-account` | Pública |
| `/api/auth/**`, `/api/register`, `/api/claim-account`, `/api/verify-email`, `/api/news`, `/api/events` | Pública |
| `/profile` | Cualquier usuario autenticado |
| `/api/profile/password` | Cualquier usuario autenticado (no está en `PROTECTED_ROUTES` a propósito: cae en el chequeo por defecto de "autenticado, cualquier rol", igual que `/profile`) |
| `/students` | `CEINFUA_MEMBER`, `ADMIN`, `EXTERNAL_PARTNER` |
| `/api/students` (listado) | `CEINFUA_MEMBER`, `ADMIN`, `EXTERNAL_PARTNER` |
| `/api/students/[id]` | Cualquier rol autenticado (self/staff/partner se verifica en el handler) |
| `/admin/**`, `/api/admin/**` | `ADMIN` |

## Pendiente: rate limiting en endpoints de auth

Se evaluó agregar rate limiting en `/api/auth/**`, `/api/register` y
`/api/claim-account` para frenar intentos de login/registro por fuerza
bruta o scripts. Se decidió no implementarlo por ahora:

- El sitio es de bajo perfil (centro de estudiantes), sin presupuesto para
  infraestructura adicional.
- Una implementación real requiere un store compartido entre invocaciones
  serverless (ej. Upstash Redis). Vercel no permite contar requests en
  memoria de forma confiable entre instancias.
- El costo de un intento de fuerza bruta contra este sitio no justifica,
  por ahora, sumar una dependencia externa nueva.

Si en el futuro aparece un caso concreto (abuso real detectado, o el
proyecto consigue presupuesto para un store administrado), retomar esto
agregando `@upstash/ratelimit` + Upstash Redis delante de los endpoints de
auth, siguiendo el mismo patrón de `proxy.ts`.

## Pendiente: cobertura automática de rutas

Sería ideal tener un test que recorra `lib/permissions.ts` y verifique que
cada ruta devuelve el status esperado (401/403/200) según el rol. Hoy el
proyecto no tiene suite de tests automatizada, así que esta verificación se
hace a mano (ver checklist de prueba manual usada al construir esto). Si en
algún momento se agrega una suite de tests al proyecto en general, este es
un buen primer caso para cubrir.
