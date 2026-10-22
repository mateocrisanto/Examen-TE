# Revisión de la aplicación

**Fecha:** 22/10/2026  
**Alcance:** revisión estática del código, configuración, reglas de Firestore y documentación del proyecto.  
**Prioridad:** P1 = resolver antes de entregar/publicar; P2 = fallo funcional importante; P3 = mejora de menor impacto.

> **Nota de estado:** este informe conserva el diagnóstico inicial previo a las correcciones. Después se implementaron varios de los cambios descritos; `npm run tsc` ahora pasa. El detalle actualizado, las pruebas manuales pendientes y las decisiones están en [`AUDITORIA.md`](./AUDITORIA.md). No se deben interpretar las recomendaciones siguientes como tareas todavía sin hacer sin revisar esa bitácora.

## Resumen

Se encontraron fallos que bloquean el chequeo de tipos, dejan acciones de la interfaz sin funcionar, impiden filtrar o cargar la lista de Pokémon ante errores de red y pueden impedir recuperar el equipo al volver a iniciar sesión. También hay un riesgo de subir el archivo `.env` al repositorio.

El archivo local `firestore.rules` ya restringe la subcolección `equipo` al usuario autenticado propietario. No se comprobó si esas reglas están publicadas en Firebase; hay que verificarlo en la consola antes de considerar cerrado el hallazgo de privacidad.

## P1 — Resolver antes de la entrega o publicación

### 1. El chequeo de TypeScript falla

- **Archivos:** `src/components/SelectorRol.tsx`, `src/components/TarjetaMiembro.tsx`, `src/firebase/config.ts`, `src/firebase/diagnostico.ts`, `expo-env.d.ts`.
- **Evidencia:** `npm run tsc` termina con 14 errores: `suplente` no pertenece al tipo `Rol`; `Pressable` no admite `onClick`; y TypeScript no encuentra `process` en las dos integraciones con variables de entorno. En el estado actual del repositorio, `expo-env.d.ts` aparece eliminado; ese archivo declara los tipos de Expo.
- **Impacto:** no se cumple el objetivo de compilación/type-check y hay errores en controles esenciales.
- **Solución sugerida:** cambiar `suplente` por el rol existente `banca`; usar `onPress` en el `Pressable`; restaurar la declaración de Expo (`/// <reference types="expo/types" />`) o generar la equivalente con Expo. Volver a ejecutar `npx tsc --noEmit` hasta obtener cero errores.

### 2. El archivo `.env` puede subirse accidentalmente

- **Archivos:** `.gitignore`, `.env`, `src/config/claves.ts`.
- **Evidencia:** `.env` aparece como archivo no rastreado (`?? .env`) y `.gitignore` no lo excluye.
- **Impacto:** alguien podría agregarlo al repositorio por error. Aunque la configuración de Firebase para cliente no equivale a una clave privada de servidor, no debe publicarse el entorno local ni credenciales privadas.
- **Solución sugerida:** ignorar `.env` y variantes de entorno, manteniendo `.env.example` rastreable. Revisar `git status` antes de cada commit. Si alguna credencial privada ya fue publicada, revocarla/rotarla y retirar el secreto del historial.
- **Nota:** la constante `CLAVE_ADMIN_REPORTES` en `src/config/claves.ts` está expresamente marcada como ficticia y no se identificó como una credencial real; no debe tratarse como un secreto confirmado. No guardar una clave administrativa real en una app cliente.

### 3. La caché de equipo se serializa de forma incorrecta y se comparte entre cuentas

- **Archivo:** `src/context/EquipoContext.tsx`.
- **Evidencia:** `guardarCache` guarda `String(lista)`, pero `leerCache` intenta recuperar el valor con `JSON.parse`. Un arreglo de objetos convertido con `String` no queda como JSON válido. Además, se utiliza una única clave `@equipo_cache` para todas las cuentas.
- **Impacto:** al volver a iniciar sesión, el parseo puede fallar antes de llamar a Firestore, dejando el equipo sin cargar. En un dispositivo compartido, la caché no está aislada por UID y podría mostrar datos locales de otra cuenta.
- **Solución sugerida:** guardar con `JSON.stringify`, parsear y validar los datos de manera controlada, usar una clave que incluya el UID y evitar mostrar una caché de otra cuenta. Si la caché es inválida, informar/registrar el problema y continuar intentando cargar el equipo remoto.

### 4. La privacidad de Firestore depende de publicar las reglas corregidas

- **Archivo:** `firestore.rules`.
- **Evidencia:** el archivo del repositorio ahora exige autenticación y coincidencia entre `request.auth.uid` y `{uid}` para leer/escribir `usuarios/{uid}/equipo/{pokemonId}`. No se verificó el estado de las reglas desplegadas en el proyecto Firebase.
- **Impacto:** si Firebase aún tiene las reglas anteriores (`allow read, write: if true`), cualquier usuario podría acceder a los equipos.
- **Solución sugerida:** desplegar `firestore.rules` (`firebase deploy --only firestore:rules`) y comprobar en el simulador que el propietario autenticado puede acceder, mientras que otra cuenta y una solicitud sin autenticar son rechazadas.

## P2 — Fallos funcionales importantes

### 5. El botón «Quitar» no ejecuta la acción

- **Archivo:** `src/components/TarjetaMiembro.tsx`.
- **Evidencia:** el control es un `Pressable` con `onClick`, propiedad que no existe en React Native y que TypeScript reporta como error.
- **Impacto:** el usuario no puede quitar miembros del equipo.
- **Solución sugerida:** reemplazar `onClick` por `onPress` y comprobar que el documento se elimina en Firestore y desaparece de la lista.

### 6. El buscador no actualiza los resultados al escribir

- **Archivo:** `src/screens/ExplorarScreen.tsx`.
- **Evidencia:** el efecto que calcula `visibles` depende de `estado`, pero no de `busqueda`.
- **Impacto:** cambiar el texto de búsqueda no vuelve a filtrar la lista.
- **Solución sugerida:** recalcular la lista al cambiar `estado` o `busqueda` (por ejemplo, incluir ambas dependencias o derivar los resultados durante el render).

### 7. Explorar puede quedarse cargando indefinidamente si falla la API

- **Archivos:** `src/screens/ExplorarScreen.tsx`, `src/services/pokeService.ts`.
- **Evidencia:** `obtenerLista()` no comprueba `res.ok`; el efecto de Explorar solo maneja el resultado exitoso y no captura el rechazo. El estado permanece en `cargando` ante un error de red o una respuesta HTTP fallida.
- **Impacto:** no se informa del fallo ni se ofrece reintentar.
- **Solución sugerida:** verificar `res.ok`, capturar el error en el efecto y pasar la pantalla a un estado visible de error con botón Reintentar. Mantener el indicador de carga solo mientras la solicitud está activa.

### 8. Cambiar el rol modifica el estado en el mismo arreglo

- **Archivo:** `src/context/EquipoContext.tsx`.
- **Evidencia:** `cambiarRol` muta `miembro.rol` y luego llama `setEquipo(equipo)` con la misma referencia.
- **Impacto:** React puede omitir el render porque la referencia no cambió; además, esa función no actualiza la caché local.
- **Solución sugerida:** crear una nueva lista con `map`, actualizar el estado con esa lista y persistir la misma versión en la caché después de confirmar el cambio remoto.

### 9. El selector muestra un rol inexistente

- **Archivo:** `src/components/SelectorRol.tsx`.
- **Evidencia:** la lista incluye `suplente`, pero `Rol` y `ETIQUETA_ROL` definen `titular`, `reserva` y `banca`. La etiqueta del rol inexistente resulta indefinida y no puede coincidir con el rol de Charmander (`banca`).
- **Impacto:** aparece un botón sin texto y el rol «En la banca» no queda representado/seleccionado correctamente.
- **Solución sugerida:** sustituir `suplente` por `banca` y usar el valor del rol como `key` del elemento.

### 10. Las tarjetas de equipo no tienen una clave estable

- **Archivo:** `src/screens/EquipoScreen.tsx`.
- **Evidencia:** `equipo.map` crea `TarjetaMiembro` sin propiedad `key`.
- **Impacto:** React emite una advertencia y puede reutilizar el estado local de expansión de una tarjeta para otra cuando se elimina un elemento.
- **Solución sugerida:** pasar `key={m.id}` a cada `TarjetaMiembro` y verificar que al eliminar un miembro permanezca expandida la tarjeta correcta.

### 11. El control «Quitar» es demasiado pequeño y no confirma la eliminación

- **Archivo:** `src/components/TarjetaMiembro.tsx`.
- **Evidencia:** el botón tiene una altura fija de 28 px y elimina el elemento directamente al tocarlo.
- **Impacto:** es fácil tocarlo por accidente y no hay oportunidad de cancelar.
- **Solución sugerida:** ampliar el área táctil a al menos 44 px y pedir confirmación con el diálogo nativo (`Alert.alert`) antes de llamar a `onQuitar`.

## P3 — Robustez y documentación

### 12. Los errores al cambiar rol o quitar un miembro no se presentan al usuario

- **Archivos:** `src/context/EquipoContext.tsx`, `src/components/TarjetaMiembro.tsx`.
- **Evidencia:** las operaciones son asíncronas, pero los manejadores de la tarjeta no muestran un estado de error si Firestore rechaza la escritura/eliminación.
- **Impacto:** un fallo de red puede parecer un toque ignorado y puede generar una promesa rechazada sin manejar.
- **Solución sugerida:** capturar el rechazo en el punto de interacción, mostrar un mensaje claro y mantener el estado local sin cambios hasta que la operación remota se confirme.

### 13. El README apunta al enunciado en una ubicación incorrecta

- **Archivo:** `README.md`.
- **Evidencia:** indica que el enunciado está en `../ENUNCIADO-EXAMEN.md`, aunque el archivo está en la misma carpeta que el README.
- **Impacto:** el enlace/instrucción no lleva al documento desde el repositorio.
- **Solución sugerida:** cambiar la ruta a `./ENUNCIADO-EXAMEN.md`.

### 14. La bitácora requerida está sin completar

- **Archivo:** `AUDITORIA.md`.
- **Evidencia:** las tablas de correcciones, decisiones y errores no resueltos están vacías.
- **Impacto:** el enunciado del examen requiere documentar síntomas, causas, cambios y pruebas; el informe de revisión no sustituye esa bitácora.
- **Solución sugerida:** completar la bitácora con las pruebas que realmente se ejecutaron, las decisiones sobre T13/T14 y R1/R2/R3, y la declaración veraz de uso de IA.

## Observaciones que no se consideran errores confirmados

- **R1 — `useEffect` con `[]` en la suscripción de autenticación:** es correcto mantener una única suscripción durante la vida del proveedor y devolver su función de limpieza. No depende de valores cambiantes del componente.
- **R2 — `any` en `obtenerDetalle`:** por sí solo no demuestra un fallo con respuestas válidas de PokéAPI; el código comprueba al menos `id` y `name`. Para mayor robustez se puede usar `unknown` y validar también los campos anidados, pero no es la causa de un fallo funcional reproducido en esta revisión.
- **R3 — índice como `key` en `SelectorRol`:** la lista de roles es fija y no se reordena ni elimina dinámicamente, por lo que no se identificó un fallo observable por usar el índice ahí. Usar el propio rol como clave es una mejora simple, no una corrección urgente.
- **T13 y T14:** traducir nombres o agregar modo claro son pedidos de mejora, no errores respecto del comportamiento descrito para esta aplicación.

## Verificación y límites

- Ejecutado: `npm run tsc`.
- Resultado: falla con los 14 errores descritos en el hallazgo 1.
- No se ejecutó la app en Expo ni se probaron cuentas, conectividad, Firestore o el simulador de reglas; esos comportamientos requieren una ejecución con un proyecto Firebase configurado.
- El informe refleja el estado de trabajo encontrado. Entre los cambios locales preexistentes al informe se observaron, entre otros, la eliminación de `expo-env.d.ts` y un `.env` sin seguimiento; no se modificaron esos archivos.
