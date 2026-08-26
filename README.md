# Calistenia + Nutrición

App web de entrenamiento de calistenia + nutrición para Uruguay. Prueba gratis
de 7 días, después $250/mes vía Mercado Pago. Guardado real en base de datos
propia (Supabase) — ya no depende de tener cuenta paga de Claude.

## Stack

- **Frontend**: React + Vite + Tailwind, hosteable en Vercel o Netlify.
- **Backend**: Supabase (Postgres + Auth + Edge Functions).
- **Pagos**: Mercado Pago (Checkout Pro) con activación automática de Premium
  vía webhook.
- **Coach con IA**: proxy server-side a la API de Anthropic (Edge Function),
  gateado a usuarios Premium.

## 1) Crear el proyecto Supabase

1. Andá a [supabase.com](https://supabase.com), creá un proyecto nuevo.
2. En **Project Settings → API** copiá `Project URL` y `anon public key`.
3. En **Project Settings → API → service_role** copiá la `service_role key`
   (¡nunca la pongas en el frontend! solo se usa en el webhook de Mercado Pago).
4. En **Authentication → Providers**, dejá habilitado Email (con o sin
   confirmación, a tu gusto). Si activás confirmación por email, configurá
   el remitente en **Authentication → Email Templates**.

## 2) Correr las migraciones SQL

Abrí el **SQL Editor** de tu proyecto Supabase y pegá el contenido de
`supabase/migrations/0001_init.sql`, o instalá la CLI de Supabase y corré:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

Esto crea:
- `user_data`: todos los datos por usuario (perfil, progresión, registros
  diarios, suscripción, peso, etc.), protegidos por Row Level Security.
- `premium_codes`, `referral_codes`, `referral_redemptions`, `admins`: tablas
  compartidas, sin acceso directo — todo pasa por funciones RPC seguras.

## 3) Marcarte como administrador

Para ver el panel oculto de códigos (5 taps en el logo), necesitás estar en
la tabla `admins`. Primero creá tu cuenta en la app (o desde
**Authentication → Users** en Supabase), después en el SQL Editor:

```sql
insert into admins (user_id)
values ('EL-UUID-DE-TU-USUARIO');
```

(El UUID lo ves en Authentication → Users, columna `UID`.)

## 4) Variables de entorno del frontend

```bash
cp .env.example .env.local
```

Completá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los datos del paso 1.

```bash
npm install
npm run dev
```

## 5) Deploy del frontend (Vercel o Netlify)

- **Vercel**: importá el repo, framework preset "Vite", agregá las mismas dos
  variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en
  Project Settings → Environment Variables.
- **Netlify**: mismo proceso, build command `npm run build`, publish dir `dist`.

## 6) Edge Functions (Supabase)

Instalá la [CLI de Supabase](https://supabase.com/docs/guides/cli) y logueate.

```bash
supabase link --project-ref <tu-project-ref>

# Secretos que necesitan las funciones:
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set MP_ACCESS_TOKEN=APP_USR-...
supabase secrets set APP_URL=https://tu-app.vercel.app

# Deploy:
supabase functions deploy coach
supabase functions deploy mercadopago-create-preference
supabase functions deploy mercadopago-webhook --no-verify-jwt
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` ya están
disponibles automáticamente dentro de las Edge Functions, no hace falta
setearlas a mano.

El flag `--no-verify-jwt` en `mercadopago-webhook` es necesario porque
Mercado Pago llama a esa URL sin un token de Supabase.

### Configurar el webhook en Mercado Pago

1. Conseguí tu `MP_ACCESS_TOKEN` en
   [Mercado Pago Developers](https://www.mercadopago.com.uy/developers/panel) →
   tu aplicación → Credenciales de producción.
2. En la misma sección, configurá la URL de notificaciones (webhook) a:
   `https://<tu-proyecto>.supabase.co/functions/v1/mercadopago-webhook`
   (esto es opcional si preferís confiar solo en el `notification_url` que ya
   manda cada preferencia de pago creada por `mercadopago-create-preference`).

Con esto, cuando alguien paga desde la app: se crea una preferencia con su
`user_id` como referencia → paga en Mercado Pago → Mercado Pago llama al
webhook → el webhook activa `premium: true` en su fila de `user_data`
automáticamente, sin que tengas que generar ni mandar ningún código a mano.

El panel oculto de códigos (5 taps en el logo) sigue disponible como método
manual de respaldo (cortesías, promociones puntuales).

## 7) Coach con IA

Necesita tu propia API key de Anthropic (con facturación a tu cargo), seteada
como secreto `ANTHROPIC_API_KEY` en Supabase (paso 6). La Edge Function
`coach` verifica que quien llama esté autenticado y tenga acceso Premium
(pago o dentro del trial) antes de gastar créditos. Si no está disponible o
falla, la app cae automáticamente al respondedor local (`responderLocal` en
`src/App.jsx`), sin IA.

## Estructura del proyecto

```
src/
  App.jsx            # Toda la UI y lógica de negocio (ported del artifact original)
  lib/
    supabaseClient.js # Cliente de Supabase
    storage.js         # safeGet/safeSet + wrappers de las funciones RPC
    auth.jsx            # Pantalla de login/signup + gate de sesión
supabase/
  migrations/0001_init.sql   # Esquema completo + RLS + funciones RPC
  functions/
    coach/                    # Proxy a Anthropic (gateado a Premium)
    mercadopago-create-preference/  # Crea el link de pago
    mercadopago-webhook/            # Activa Premium al confirmar el pago
```

## Qué claves de datos usa la app (todas viven en `user_data`, por usuario)

`perfil`, `progresion`, `progresoSeries`, `registro:YYYY-MM-DD`, `suscripcion`,
`onboarding`, `referido`, `peso`, `metaPeso`, `planComidas`, `misMenus`.

Los códigos premium y el sistema de referidos (antes `shared: true` en
`window.storage`) ahora viven en tablas propias (`premium_codes`,
`referral_codes`, `referral_redemptions`) con acceso exclusivamente a través
de funciones RPC — así nadie puede fabricar un canje o activar Premium
editando datos directamente desde el navegador.
