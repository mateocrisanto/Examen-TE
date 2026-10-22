# Examen práctico parcial — Caza de errores con auditoría

**Materia:** Tecnologías emergentes · Desarrollo de aplicaciones móviles
**Duración máxima:** 80 minutos · **Modalidad:** individual · **Uso de IA:** permitido sin restricción

---

## 1. Qué se espera de usted

Recibe una aplicación móvil hecha con React Native, Expo y TypeScript que **arranca y parece funcionar**, pero contiene errores de distintos tipos: de código, de experiencia de usuario y de seguridad.

Para ayudarle a encontrarlos, el equipo de soporte recopiló **comentarios de usuarios** y **observaciones de una revisión de código** (sección 4). Su trabajo es:

1. **Reproducir** cada comentario en la aplicación.
2. **Decidir** si describe un error de la aplicación, un pedido de mejora o algo que no se puede reproducir.
3. **Encontrar la causa** y **corregirla** con el cambio mínimo necesario.
4. **Comprobar** que la corrección funciona.
5. **Auditar** cada corrección en la bitácora `AUDITORIA.md`: síntoma, causa, cambio realizado, prueba que confirma la solución, y si se apoyó en IA con qué prompt.

Un comentario describe **lo que el usuario ve**, no la causa. Encontrar la causa y corregirla es su trabajo. Además, un comentario no es una orden: no todos describen un error de la aplicación.

> **Cómo se relaciona con su nota:** cada comentario que corresponde a un error vale una cantidad de puntos conocida de antemano, repartida entre la **corrección** y la **auditoría**. La tabla completa está en la sección 8. Léala antes de empezar.

Puede usar cualquier plataforma o agente de IA. Lo que se evalúa es que la corrección sea correcta, que la haya comprobado y que **pueda explicar** por qué el error ocurría.

> Puede haber código inusual que **funciona bien**. Cambiarlo sin motivo puede introducir errores nuevos. Si revisa algo y decide no cambiarlo, regístrelo en la sección 2 de la bitácora.

## 2. La aplicación: “Equipo Pokémon”

- **Login / registro** con Firebase Auth (correo y contraseña).
- **Explorar:** lista de Pokémon desde PokéAPI, con buscador por nombre; al tocar uno se abre su detalle. Aquí está el botón **Salir**.
- **Detalle:** imagen, tipos, altura y peso, y botón “Agregar a mi equipo”.
- **Mi equipo:** los Pokémon guardados en Firestore (`usuarios/{uid}/equipo`). Cada tarjeta se puede expandir para cambiar su rol (titular, reserva, en la banca) o quitarla.
- **Persistencia:** el equipo se guarda también en el dispositivo (AsyncStorage) para mostrarlo rápido al abrir la app.

## 3. Antes del examen (obligatorio, no cuenta en los 80 minutos)

Configure un **nuevo** proyecto de Firebase y compruebe que la app funciona, siguiendo `GUIA-CONFIGURACION-FIREBASE-EXAMEN.md`. Llegue al examen con la checklist de esa guía completa.

## 4. Bandeja de soporte

### 4.1 Cómo leerla

- Cada comentario indica **qué observó el usuario** y **cómo reproducirlo**. No indica dónde está el problema ni cómo se corrige.
- Algunos comentarios solo se pueden reproducir después de corregir otro. Se indica en cada caso.
- Si modifica algo **solo para reproducir** un problema (por ejemplo, una dirección o un valor), restáurelo después y no lo cuente como corrección.
- El compilador también ayuda: `npx tsc --noEmit` muestra errores de tipos.

### 4.2 Comentarios de usuarios

#### T1 · Camila (usuaria de Android)
> “Cada vez que cierro la app por completo tengo que volver a escribir mi correo y mi contraseña. Mi otra app de Pokémon no me lo pide.”

**Cómo reproducirlo:** inicie sesión, cierre Expo Go deslizándolo (no basta con bloquear la pantalla) y abra el proyecto otra vez. ¿Entra directo a la app o vuelve al inicio de sesión?

#### T2 · Diego
> “Cuando mi internet anda mal, abro Explorar y se queda la ruedita dando vueltas para siempre. No dice nada y tampoco me deja volver a intentar.”

**Cómo reproducirlo:** para simularlo sin depender de su conexión, cambie temporalmente la dirección de la API por una que no exista, reinicie la app e inicie sesión. Observe la pantalla Explorar.

#### T3 · Valeria
> “Escribo ‘pika’ en el buscador de Explorar y la lista sigue igual, con todos los Pokémon.”

**Cómo reproducirlo:** pestaña Explorar, escriba en “Buscar por nombre…” y luego borre el texto.

#### T4 · Mateo
> “Quiero sacar a un Pokémon de mi equipo, toco ‘Quitar’ y no pasa absolutamente nada.”

**Cómo reproducirlo:** Mi equipo → expanda una tarjeta → toque “Quitar”. Si no hay equipo, use “Cargar equipo de ejemplo”.

#### T5 · Lucía
> “Cambio el rol de un Pokémon y la pantalla no se entera. En la consola de Firebase sí se ve el cambio. Si cierro la tarjeta y la vuelvo a abrir, ahí sí aparece.”

**Cómo reproducirlo:** Mi equipo → expanda una tarjeta → elija otro rol → observe la pantalla, y luego revise el documento en Firestore.

#### T6 · Andrés
> “Mi equipo estaba lleno. Cerré sesión, volví a entrar y ‘Mi equipo’ aparece vacío. Revisé la consola de Firebase y mis Pokémon siguen ahí.”

**Cómo reproducirlo:** con el equipo cargado (si está vacío, use “Cargar equipo de ejemplo” y espere a que aparezcan las tarjetas), pulse **Salir** en la pestaña Explorar, vuelva a iniciar sesión y abra “Mi equipo”.

**Nota de soporte:** si tras corregir el problema este persiste en su teléfono, puede haber quedado guardada una copia dañada de una prueba anterior. Piense cómo debe comportarse la app ante eso.

#### T7 · Sofía
> “En Mi equipo, al abrir una tarjeta veo tres botones de rol, pero el tercero no tiene texto. Tampoco encuentro ‘En la banca’, y Charmander está en la banca pero no hay ningún botón marcado.”

**Cómo reproducirlo:** Mi equipo → expanda la tarjeta de Charmander (equipo de ejemplo) y observe los botones de rol.

#### T8 · Ricardo
> “El botón ‘Quitar’ es diminuto. Con el pulgar le acierto a duras penas.”

**Cómo reproducirlo:** Mi equipo → expanda una tarjeta y observe el botón. Recuerde el principio de áreas táctiles visto en la Semana 6.

#### T9 · Paula
> “Se me fue el dedo y sin querer borré a mi Pikachu. La app no me preguntó nada y lo perdí.”

**Cómo reproducirlo:** solo se puede reproducir cuando “Quitar” responda (ver T4). Cuando responda, observe qué ocurre al tocarlo. Use un Pokémon que pueda volver a agregar.

#### T10 · Tomás
> “Abrí la tarjeta de Charmander y después quité a Bulbasaur. De repente la tarjeta que quedó abierta era la de Pikachu, no la de Charmander. Además, cada vez que entro a Mi equipo sale una advertencia en la consola.”

**Cómo reproducirlo:** la advertencia aparece al entrar a Mi equipo, sin necesidad de quitar nada. El cambio de tarjeta solo se reproduce cuando “Quitar” responda (ver T4): cargue el equipo de ejemplo, expanda a Charmander y quite a Bulbasaur.

#### T11 · Nicolás
> “Le conté a mi amigo de mi equipo y me dijo que entró con su propia cuenta y pudo ver mis Pokémon. ¿Eso no debería ser privado?”

**Cómo reproducirlo:** cree una segunda cuenta (B). En la consola de Firebase → Firestore → Reglas → **Simulador de reglas**, pruebe una lectura de `usuarios/{uid de la cuenta A}/equipo/25` autenticado como la cuenta B, y otra sin autenticar. Compare el resultado con lo que espera.

#### T12 · Elena (revisora de seguridad)
> “Revisé el repositorio antes de publicarlo. Cuando existe un archivo `.env`, Git lo ofrece para subirlo, y hay un archivo en `src` con algo que parece una clave de administración. Eso no debería estar ahí.”

**Cómo reproducirlo:** con su `.env` ya creado, ejecute en la carpeta del proyecto:
```bash
git status
git grep -n -i "admin"
git log --oneline
```
Pregúntese qué ocurre con lo que ya quedó guardado en el historial.

#### T13 · Javier
> “Los nombres de los Pokémon salen en inglés. ¿Pueden traducirlos al español?”

**Cómo reproducirlo:** pestaña Explorar. Decida si es un error de la aplicación o un pedido de mejora, y justifique.

#### T14 · Marina
> “Estaría genial un modo claro para usar la app de día.”

**Cómo reproducirlo:** no aplica. Decida si es un error de la aplicación o un pedido de mejora, y justifique.

### 4.3 Observaciones de la revisión de código

Un compañero del equipo revisó el código y marcó tres puntos como “sospechosos”:

- **R1.** En `EquipoContext.tsx`, el `useEffect` que se suscribe a la sesión tiene `[]` como dependencias. ¿No debería listar algo?
- **R2.** En `pokeService.ts`, la función `obtenerDetalle` usa `any`. En TypeScript eso debería evitarse.
- **R3.** En `SelectorRol.tsx`, el `map` usa el índice como `key`. Dicen que es una mala práctica.

Decida, con evidencia, si cada observación corresponde a un error. Cambiar algo que funciona bien puede introducir errores nuevos: **justifique su decisión tanto si lo cambia como si no**.

### 4.4 Notas sobre el orden de trabajo

- T9 y T10 solo se reproducen del todo cuando el botón “Quitar” responde (T4).
- Para T6 y T10 conviene tener cargado el equipo de ejemplo.
- Si endurece las reglas de Firestore (T11), lo que antes se permitía puede dejar de permitirse: **repita el recorrido completo de la app** después de publicarlas.
- Cada comentario debe quedar en la bitácora: como corrección (sección 1), como decisión justificada (sección 2: T13, T14 y R1 a R3), o como error no resuelto (sección 3). Una misma corrección puede resolver más de un comentario.

## 5. Durante el examen

### Material y reglas
- Puede usar internet, documentación, sus apuntes y cualquier plataforma de IA.
- El trabajo es individual: no puede pedir ayuda a otras personas. El docente solo aclara dudas del enunciado.
- No reescriba la aplicación desde cero y no elimine funcionalidades para “quitar” un error.
- No implemente mejoras que nadie le pidió como error (por ejemplo, T13 o T14): no suman puntos y consumen tiempo.
- No cambie versiones de dependencias salvo que el error lo exija y pueda justificarlo.
- No suba su archivo `.env` al repositorio.

### Método sugerido
1. **Reproducir:** ejecute la app y siga los pasos de cada comentario. Sin síntoma reproducido no hay error confirmado.
2. **Aislar:** use la consola de Expo, `npx tsc --noEmit`, la consola de Firebase y el simulador de reglas para ubicar dónde ocurre.
3. **Corregir** con el cambio mínimo.
4. **Verificar** repitiendo la prueba que fallaba y probando un caso cercano, para comprobar que no rompió otra cosa.
5. **Documentar** en `AUDITORIA.md` mientras lo recuerda.

### Plan de tiempo sugerido
| Minutos | Actividad |
|---|---|
| 0 a 10 | Abrir el proyecto, ejecutar la app, leer los comentarios y reproducir los que pueda |
| 10 a 65 | Corregir y verificar, un comentario a la vez, completando la bitácora |
| 65 a 80 | Revisión final de punta a punta, evidencias y entrega |

### Comandos útiles
```bash
npx expo start -c        # iniciar con caché limpia (obligatorio si cambia .env)
npx tsc --noEmit         # revisión de tipos: el objetivo final es cero errores
git status               # qué archivos cambió
git log --oneline        # historial de commits
```

### Commits
Haga **al menos un commit por corrección**, con un mensaje claro, por ejemplo: `fix(C3): ...`. En la bitácora, cite el commit de cada corrección.

## 6. La bitácora de auditoría (`AUDITORIA.md`)

La bitácora tiene cuatro secciones:

| Sección | Qué va ahí |
|---|---|
| 1. Correcciones realizadas | Una fila por cada corrección |
| 2. Decisión sobre T13, T14 y R1 a R3 | Para cada uno: qué revisó, si cambió o no, por qué y cómo lo comprobó |
| 3. Errores no resueltos | Los comentarios que reprodujo pero no logró corregir, con lo que intentó y su hipótesis |
| 4. Declaración sobre el uso de IA | Plataformas usadas y declaración de veracidad |

En la sección 1, cada fila tiene estos campos:

| Campo | Qué debe contener |
|---|---|
| ID | Identificador propio (C1, C2...) |
| Ticket(s) | El o los comentarios que originaron la corrección (por ejemplo, T4) |
| Síntoma | Lo que **usted observó al reproducirlo** en su propia app: pantalla, mensaje exacto, qué hizo. No copie el comentario del usuario |
| Causa | Por qué ocurría, con sus propias palabras. **No está en el comentario** |
| Cambio realizado | Archivo y qué cambió; commit asociado |
| Prueba que confirma | Acción repetible y resultado (por ejemplo, “sin internet aparece el mensaje de error y el botón Reintentar”) |
| ¿IA? | Sí, No o Parcial |
| Prompt utilizado | El prompt literal si usó IA y qué ajustó de la respuesta. Si no usó IA, escriba “No” |

Reglas de la bitácora:
- Declarar que usó IA **no** resta puntos. Lo que se penaliza es declarar algo falso.
- Las pruebas deben poder repetirse: el docente podría ejecutarlas.
- Si una conversación fue larga, anote el prompt inicial y el que produjo la solución.
- Una misma fila puede cubrir varios comentarios (por ejemplo T8 y T9), pero cada fila se califica una sola vez.

## 7. Entrega

Entregue **todo antes de que se cumplan los 80 minutos**:

1. **Repositorio en GitHub** (privado) con su código corregido y el historial de commits. Comparta el enlace con el docente y agréguelo como colaborador.
```bash
git remote add origin <URL-de-su-repositorio-vacío>
git branch -M main
git push -u origin main
```
2. **`AUDITORIA.md`** completo, dentro del repositorio.
3. **Carpeta `evidencias/`** dentro del repositorio con capturas de:
   - `npx tsc --noEmit` sin errores.
   - *Authentication → Users* con al menos dos cuentas de prueba (A y B).
   - El simulador de reglas de Firestore: acceso permitido al dueño y denegado a otro usuario.
4. **Archivo `firestore.rules`** corregido, dentro del repositorio.

Si GitHub no funciona, entregue un archivo `.zip` del proyecto **sin** `node_modules` ni `.env`.

## 8. Cómo se califica

La nota es de **100 puntos** y se reparte así:

| Componente | Puntos | De qué depende |
|---|---|---|
| Comentarios con error (T1 a T12): corrección y auditoría | 83 | Cada comentario con error vale lo que indica la tabla 8.2 |
| Declaración de uso de IA | 5 | Sección 8.5 |
| Falsas alarmas (R1 a R3) | 6 | Sección 8.4 |
| Verificación global | 6 | Sección 8.6 |
| **Total** | **100** | |

### 8.1 Cómo se relaciona cada comentario con la nota

Cada comentario de usuario que corresponde a un error se califica en **dos partes**:

1. **Corrección:** ¿el problema quedó resuelto de verdad? Se considera completa cuando se cumplen las tres condiciones:
   - se corrigió la **causa real**, no solo se ocultó el síntoma (por ejemplo, ocultar el buscador no corrige un buscador que no filtra);
   - el síntoma descrito en el comentario **ya no ocurre**;
   - no se rompió otra parte de la aplicación.
2. **Auditoría:** ¿lo documentó bien en la bitácora? (ver 8.3).

Las dos partes son independientes pero se complementan: **una corrección sin auditoría suma menos que una corrección bien auditada**, y una auditoría de algo que no corrigió suma poco.

### 8.2 Puntos máximos por comentario

| Ticket | Tema | Corrección | Auditoría | Total |
|---|---|---|---|---|
| T1 | Sesión al reabrir la app | 4 | 3 | 7 |
| T2 | Carga de Explorar sin conexión | 6 | 3 | 9 |
| T3 | Buscador de Explorar | 4 | 3 | 7 |
| T4 | Botón Quitar que no responde | 3 | 3 | 6 |
| T5 | Cambio de rol en pantalla | 5 | 3 | 8 |
| T6 | Equipo al volver a entrar | 6 | 3 | 9 |
| T7 | Botones de rol | 4 | 3 | 7 |
| T8 + T9 | Botón Quitar: tamaño y confirmación | 4 | 3 | 7 |
| T10 | Tarjetas al quitar un Pokémon | 3 | 3 | 6 |
| T11 | Privacidad del equipo | 7 | 3 | 10 |
| T12 | Repositorio y claves | 4 | 3 | 7 |
| **Subtotal** | | **50** | **33** | **83** |

Notas sobre la tabla:
- **T8 + T9** se refieren a un mismo botón: T8 vale 2 puntos de corrección, T9 vale 2 y la auditoría (3) se califica una sola vez para ambos.
- **T4** vale poco, pero hasta que “Quitar” responda no se pueden reproducir del todo T9 ni T10.
- **T13 y T14 no suman puntos.** Debe revisarlos y decidir (sección 2 de la bitácora), pero implementarlos no se premia.

### 8.3 Cómo se califica la auditoría (3 puntos por comentario)

Cada fila de la sección 1 de la bitácora se califica con cuatro criterios:

| Criterio | Puntos | Qué se espera |
|---|---|---|
| Síntoma | 0,5 | Cita el ticket y describe **lo que usted vio al reproducirlo** en su app. Si solo copia el comentario del usuario, vale 0 |
| Causa | 1 | Explica con precisión técnica y con sus palabras **por qué** ocurría. Parcialmente correcta: 0,5 |
| Cambio realizado | 0,5 | Indica archivo y qué cambió, y cita el commit |
| Prueba que confirma | 1 | Acción repetible y resultado esperado. “Ya funciona” no vale. Si el docente la ejecuta y no da ese resultado, vale 0 |

Casos especiales:
- **Si no corrigió el error** pero lo reprodujo y documentó una hipótesis razonable de la causa (sección 3 de la bitácora), puede obtener hasta **1,5 de los 3 puntos** de auditoría (síntoma más hipótesis).
- **Si no puede explicar en 2 minutos** una fila que presentó, esa fila pierde el 50 % de sus puntos de auditoría.
- Si el error fue corregido pero no hay fila en la bitácora, la auditoría de ese comentario vale 0.

**Ejemplo con un comentario ficticio “T0”** (no existe en este examen), que valdría 4 puntos de corrección y 3 de auditoría:

> T0, usuaria: “Marco una tarea como hecha y el contador de pendientes no cambia hasta que reabro la app.”

| Criterio | Fila bien completada | Fila débil |
|---|---|---|
| Síntoma | “T0. Al marcar la tarea 2, el contador seguía en 5; al cerrar y abrir la app mostraba 4” → **0,5** | “T0. El contador no cambia” (copiado del comentario) → **0** |
| Causa | “`setTareas` recibía el mismo arreglo porque se hacía `push` y React no detectaba el cambio” → **1** | “No se actualizaba el estado” (incompleta) → **0,5** |
| Cambio | “`TareasContext.tsx`: se reemplazó `push` por `[...tareas, nueva]`; commit `fix(C1)`” → **0,5** | “Cambié el contexto, commit `fix(C1)`” (no dice qué cambió) → **0** |
| Prueba | “Marqué una tarea: el contador bajó al instante y seguía igual tras reabrir” → **1** | “Ya funciona” → **0** |
| **Auditoría** | **3 de 3** | **0,5 de 3** |

### 8.4 Observaciones de la revisión de código (R1 a R3): 6 puntos

Cada observación vale 2 puntos y se resuelve en la sección 2 de la bitácora:

| Qué hizo | Puntos |
|---|---|
| Comprobó la observación y justificó su decisión (dejarla igual o cambiarla de forma inofensiva) | 2 |
| La dejó igual o la cambió de forma inofensiva, pero sin justificar | 1 |
| La cambió y con eso **rompió** algo | 0, y además el descuento de 2 puntos de 8.7 (se aplica una sola vez) |

### 8.5 Declaración de uso de IA: 5 puntos

| Criterio | Puntos |
|---|---|
| La columna “¿IA?” está completa en todas las filas y, cuando usó IA, el prompt es literal y dice qué ajustó | 3 |
| La sección 4 de la bitácora está completa y es coherente con lo que se observa en su trabajo | 2 |

Declarar que usó IA **nunca** resta puntos. Declarar algo falso que se compruebe tiene un descuento (ver 8.7).

### 8.6 Verificación global: 6 puntos

| Criterio | Puntos |
|---|---|
| `npx tsc --noEmit` termina sin errores | 3 |
| La app arranca y el recorrido login → Explorar → Detalle → Mi equipo funciona | 3 |

### 8.7 Descuentos

| Situación | Descuento |
|---|---|
| Su archivo `.env` o credenciales reales de Firebase publicados en el repositorio | −5 |
| Declaración falsa sobre el uso de IA (comprobada) | −10 |
| Un cambio innecesario que rompe algo (cada uno, máximo −6) | −2 |
| Falta la bitácora `AUDITORIA.md` | La auditoría y la declaración de IA valen 0 |
| No entrega el archivo de reglas corregido ni la captura del simulador de reglas | La corrección de T11 vale como máximo 4 de 7 |

La clave ficticia que viene en el código base **no** cuenta como credencial real publicada.

### 8.8 Verificación breve

El docente elegirá a algunos estudiantes y les pedirá, en 2 minutos, repetir una de las pruebas de su bitácora y explicar la causa de un error corregido. Se aplica el descuento de 8.3 si no puede.

## 9. Preguntas frecuentes

**¿Puedo usar IA para encontrar los errores?** Sí. Pero revise cada propuesta, ejecute la app y compruebe el resultado.

**¿Debo atender todos los comentarios?** Debe revisar todos y dejar constancia de cada uno. Los que no sean errores se documentan en la sección 2 de la bitácora y no se cambian.

**¿Y si encuentro otro problema que no aparece en la bandeja?** Puede corregirlo y auditarlo, pero la bandeja está pensada como guía principal y no es necesario buscar más. No suma puntos adicionales.

**¿Qué hago si no logro corregir un error?** Anótelo en la sección 3 de la bitácora con lo que intentó y su hipótesis de la causa: se valora el razonamiento (hasta 1,5 puntos de auditoría).

**¿Qué hago si no logro reproducir un comentario?** Anote en la sección 3 qué pasos siguió y qué observó. Si el comentario depende de otro (por ejemplo T9 y T4), corrija primero el otro.

**¿Qué hago si falla el entorno (credenciales, red, Expo Go)?** Avise al docente de inmediato; no lo trate como un error de la app.
