# Guía: configurar un NUEVO proyecto de Firebase para el examen

> **Hágalo antes del examen** (idealmente el día anterior). Esta preparación **no cuenta** dentro de los 80 minutos.
> **No reutilice** el proyecto de Firebase de sus proyectos anteriores: el examen cambia las reglas de seguridad y necesita un proyecto limpio.
> Tiempo estimado: 15 a 20 minutos. No se necesita tarjeta de crédito (plan gratuito Spark).

## Requisitos
- Cuenta de Google.
- Node.js 18 o superior, Git y la app **Expo Go** en su teléfono (misma red WiFi que la computadora).
- La carpeta `app-examen/` entregada por el docente.

## Paso 1 — Crear el proyecto
1. Entre a [console.firebase.google.com](https://console.firebase.google.com) e inicie sesión.
2. **Agregar proyecto** (o *Create a project*).
3. Nombre: `examen-equipo-` seguido de su apellido (por ejemplo `examen-equipo-vega`).
4. Google Analytics: **desactívelo** (no se necesita). Pulse **Crear proyecto** y espere.

## Paso 2 — Registrar una app web
Aunque la app es móvil, usa el SDK JavaScript de Firebase, que se configura registrando una *app web*.
1. En la página principal del proyecto, pulse el ícono **`</>`** (Web).
2. Apodo: `examen-expo`. **No** marque Firebase Hosting. Pulse **Registrar app**.
3. Aparece un objeto `firebaseConfig`. **Déjelo abierto** o cópielo: lo usará en el Paso 6.

## Paso 3 — Activar Authentication
1. Menú izquierdo: **Compilación (Build) → Authentication → Comenzar**.
2. Pestaña **Sign-in method** → **Correo electrónico/contraseña** → **Habilitar** → **Guardar**.

## Paso 4 — Crear la base de datos Firestore
1. **Build → Firestore Database → Crear base de datos**.
2. Edición **Standard**. Ubicación: la más cercana a usted (no se puede cambiar después).
3. Modo **Producción** (las reglas empiezan cerradas; las ajustará en el Paso 5). Pulse **Habilitar**.

## Paso 5 — Publicar las reglas iniciales del examen
1. Firestore → pestaña **Reglas**.
2. Borre todo el contenido y pegue el contenido del archivo `app-examen/firestore.rules`.
3. Pulse **Publicar**.

> Estas son las reglas que entrega el docente. Sirven para que la app funcione, pero **no se asuma que son seguras**: revisarlas es parte del examen.

## Paso 6 — Conectar la app con su proyecto
1. Abra una terminal en la carpeta `app-examen/` y ejecute:
```bash
npm install
cp .env.example .env        # Windows (CMD): copy .env.example .env
```
2. Abra el archivo `.env` y pegue los valores de su `firebaseConfig`:

| firebaseConfig | Variable en `.env` |
|---|---|
| `apiKey` | `EXPO_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `EXPO_PUBLIC_FIREBASE_APP_ID` |

3. Inicie la app con la caché limpia (**siempre** que cambie el `.env`):
```bash
npx expo start -c
```
4. Escanee el código QR con Expo Go (Android: dentro de la app; iOS: con la cámara).

## Paso 7 — Verificar que todo funciona
1. En la pantalla de inicio, pulse **“Verificar configuración de Firebase”**. Debe aparecer ✅ con el nombre de su proyecto.
2. Pulse **“¿Primera vez? Crea tu cuenta”** y registre la **cuenta A** (por ejemplo `cuenta.a@ejemplo.com`, contraseña de 6 o más caracteres).
3. En la consola: **Authentication → Users** debe mostrar la cuenta A.
4. En la app, vaya a **Equipo** y pulse **“Cargar equipo de ejemplo”**: aparecen 3 tarjetas.
5. En la consola: **Firestore → Datos → usuarios → (su uid) → equipo** debe mostrar 3 documentos.
6. En **Explorar** debe verse una lista de Pokémon (requiere internet).

> Es **normal** que la app tenga errores y que `npx tsc --noEmit` muestre errores: el examen consiste en encontrarlos y corregirlos.

## Checklist de preparación
- [ ] Proyecto nuevo creado en Firebase (no el de proyectos anteriores).
- [ ] Authentication con correo/contraseña habilitado.
- [ ] Firestore creado y reglas iniciales publicadas.
- [ ] `.env` completo y la app abre en Expo Go.
- [ ] Verificación de configuración con ✅.
- [ ] Cuenta A registrada y visible en la consola.
- [ ] Equipo de ejemplo cargado (3 documentos en Firestore).
- [ ] Lista de Explorar visible (internet y PokéAPI accesibles).
- [ ] Git instalado y cuenta de GitHub lista (para la entrega).

## Problemas frecuentes
| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| La verificación dice que faltan variables | `.env` vacío o mal nombrado | Revise el nombre `.env` (sin `.txt`) y reinicie con `npx expo start -c` |
| `auth/operation-not-allowed` | No habilitó correo/contraseña | Repita el Paso 3 |
| `permission-denied` | Reglas sin publicar | Repita el Paso 5 |
| La app no abre en Expo Go | Versión de Expo incompatible o red distinta | Consulte al docente; verifique que teléfono y computadora estén en la misma red |
| La lista de Explorar no carga | Sin internet o PokéAPI inaccesible | Revise la conexión; si persiste, avise al docente antes del examen |
| `auth/network-request-failed` | Sin conexión | Revise internet |
