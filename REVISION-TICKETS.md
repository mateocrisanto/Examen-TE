# Revisión de tickets y observaciones

Evaluación estática inicial del código revisado el 22/10/2026. Las correcciones posteriores y su validación están registradas en [`AUDITORIA.md`](./AUDITORIA.md); las recomendaciones de abajo describen el diagnóstico inicial.

## Tickets de soporte

| Ticket | Decisión | Causa y solución recomendada |
|---|---|---|
| **T1** | **Arreglar · alta** | En [`src/firebase/config.ts`](./src/firebase/config.ts) se usa `getAuth(app)` sin configurar explícitamente la persistencia de Auth para React Native. Inicializar Auth con persistencia de `AsyncStorage` y comprobar que la sesión sobrevive al reinicio y que “Salir” la cierra. |
| **T2** | **Arreglar · alta** | [`src/screens/ExplorarScreen.tsx`](./src/screens/ExplorarScreen.tsx) solo maneja el resultado exitoso de `obtenerLista`; si la petición falla, la pantalla queda cargando. Capturar el error, mostrar un estado de error y conectar “Reintentar”. También comprobar `res.ok` en [`src/services/pokeService.ts`](./src/services/pokeService.ts). |
| **T3** | **Arreglar · normal** | El filtrado depende de `estado`, pero no de `busqueda`, así que escribir no recalcula la lista. Hacer que el filtrado dependa de ambos valores —o calcularlo directamente a partir de ellos— y probar la búsqueda y el borrado del texto. |
| **T4** | **Arreglar · alta** | En [`src/components/TarjetaMiembro.tsx`](./src/components/TarjetaMiembro.tsx), el botón usa `onClick`; para la interacción nativa de React Native debe usar `onPress`. Verificar que se ejecuta la eliminación y que la tarjeta desaparece tras confirmarse en Firestore. |
| **T5** | **Arreglar · normal** | [`src/context/EquipoContext.tsx`](./src/context/EquipoContext.tsx) modifica el objeto existente y vuelve a enviar el mismo arreglo a React, que puede no detectar el cambio. Actualizar el miembro de forma inmutable y guardar también la lista nueva en caché. |
| **T6** | **Arreglar · alta** | La caché se guarda con `String(lista)`, pero luego se lee con `JSON.parse`; ese formato puede ser inválido y evitar que se solicite el equipo a Firestore. Guardar JSON, validar su contenido y, si está dañado, descartarlo y continuar cargando desde Firestore. Usar una clave de caché por usuario para evitar mezclar cuentas. |
| **T7** | **Arreglar · normal** | En [`src/components/SelectorRol.tsx`](./src/components/SelectorRol.tsx) se ofrece `suplente`, pero el tipo y las etiquetas usan `banca`. Usar el mismo valor `banca` en el selector para que se muestre “En la banca” y se marque como activo. |
| **T8** | **Arreglar · accesibilidad** | El botón “Quitar” mide solo 28 de alto. Aumentar su área táctil; en Android apuntar a **48 dp** de alto como mínimo y comprobar que resulte cómodo de pulsar. |
| **T9** | **Arreglar · normal** | La eliminación no pide confirmación. Mostrar un diálogo con acciones claras de cancelar y confirmar; solo la confirmación debe llamar a Firestore. |
| **T10** | **Arreglar · normal** | En [`src/screens/EquipoScreen.tsx`](./src/screens/EquipoScreen.tsx), cada tarjeta del `map` no tiene `key`. Añadir `key={m.id}` para que React mantenga correctamente la identidad de las tarjetas al quitar elementos y desaparezca la advertencia. |
| **T11** | **No cambiar las reglas actuales; verificar el despliegue** | [`firestore.rules`](./firestore.rules) restringe la lectura y escritura del equipo al usuario cuyo UID coincide con la ruta. En el simulador, B y una sesión anónima deberían recibir denegación al leer datos de A; A debería poder leer los suyos. Confirmar que esas son las reglas desplegadas en el proyecto utilizado por la app. |
| **T12** | **Arreglar · urgente** | `.env` está seguido por Git y [`src/config/claves.ts`](./src/config/claves.ts) contiene una declaración que aparenta ser una clave administrativa. Añadir exclusiones apropiadas a `.gitignore` (manteniendo `.env.example`), dejar de seguir los archivos sensibles y retirar credenciales privilegiadas de la app cliente. **Si la clave es válida, revocarla o rotarla**: ignorar o borrar el archivo actual no elimina las copias del historial. Evaluar la limpieza del historial de forma coordinada y comprobar si la clave tenía privilegios reales. No publicar valores secretos en reportes. |
| **T13** | **No corregir como bug; registrar como mejora** | PokéAPI devuelve nombres en inglés y el código los muestra tal cual; no es un fallo del buscador ni de la carga. Traducirlos sería una mejora de localización, por ejemplo consultando los nombres localizados de la especie y definiendo cómo tratar idiomas faltantes. |
| **T14** | **No corregir como bug; registrar como mejora** | El modo claro es una nueva función, no una reparación: la app declara actualmente una interfaz oscura en [`app.json`](./app.json). Implementarlo por separado como preferencia de tema si se decide incluirlo. |

## Observaciones de revisión

| Observación | Decisión | Motivo y recomendación |
|---|---|---|
| **R1** | **No cambiar** | El `useEffect` de [`src/context/EquipoContext.tsx`](./src/context/EquipoContext.tsx) registra una suscripción a Auth una sola vez y devuelve su función de limpieza. `[]` es intencional aquí; añadir dependencias sin necesidad puede hacer que se cancele y registre repetidamente. |
| **R2** | **Conviene corregir; no es un fallo funcional inmediato** | [`src/services/pokeService.ts`](./src/services/pokeService.ts) usa `any` para la respuesta. Definir el tipo mínimo de los campos utilizados y tratar el JSON como `unknown` hasta validar su forma. Las comprobaciones actuales son parciales. |
| **R3** | **Conviene corregir · baja prioridad** | En [`src/components/SelectorRol.tsx`](./src/components/SelectorRol.tsx), usar el rol (`r`) como `key` en vez del índice. Como la lista actual es fija y ordenada, el índice no parece causar el síntoma reportado; usar el valor estable es más claro y resistente a cambios futuros. |

## Estado tras las correcciones

- Se implementaron T1–T10 salvo T11, cuyas reglas locales ya restringen el acceso por UID; falta verificar las reglas desplegadas. También se atendió T12: `.env` quedó excluido y fuera del índice de Git, se conservó la copia local y se eliminó el archivo fuente que contenía la constante administrativa ficticia.
- R1, R2 y R3 no se cambiaron por no ser necesarios para resolver los fallos reproducidos (R2 queda como mejora de tipado).
- `npm run tsc` finalizó correctamente. No se ejecutaron pruebas manuales en Expo ni en Firebase.
- Sacar `.env` del índice no borra versiones de commits anteriores. No se reescribió el historial; si se necesita purgarlo, debe coordinarse porque afecta a colaboradores y clones existentes.

## Orden sugerido

1. **T12**, por la posibilidad de archivos de entorno versionados y la revisión pendiente del historial.
2. **T1 y T6**, por la persistencia de sesión y la recuperación del equipo.
3. **T2–T5, T7, T9 y T10**, por errores de uso y consistencia de la interfaz.
4. **T8, R2 y R3**, por accesibilidad y calidad de implementación.
5. **T11**, verificando que las reglas actuales estén desplegadas.
6. **T13 y T14**, como mejoras de producto, no como errores.

Esta revisión identifica causas y cambios recomendados; no registra como realizadas correcciones que todavía no se hayan implementado y probado.
