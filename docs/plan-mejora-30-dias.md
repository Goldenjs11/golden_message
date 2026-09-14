# Plan de mejora 30 días — Golden Message

## Día 1 — Línea base de seguridad y observabilidad
- Crear un middleware global de errores y de ruta no encontrada.
- Reforzar CORS con origen permitido y credenciales explícitas.
- Añadir un endpoint de salud para verificar que el servidor responde.

## Día 2 — Validación formal de peticiones
- Añadir validaciones en `register`, `login`, `createMessage` y `updateMessage`.
- Crear mensajes de error consistentes y separar validaciones de controladores.

## Día 3 — Auditoría de permisos
- Rehacer lógica de `soloAdmin` en middleware de autorización.
- Garantizar control de acceso en rutas de admin y rutas de API.
- Añadir pruebas manuales para roles.

## Día 4 — Endpoint de salud y despliegue
- Crear endpoint `/health` con metadata básica del servicio.
- Añadir comprobación de conexión a PostgreSQL y nivel de servicio.

## Día 5 — Registro y logging centralizado
- Añadir logger con `winston` o `pino` para errores y accesos.
- Sustituir `console.log` por trazas estructuradas.

## Día 6 — Limpieza de dependencias
- Revisar qué dependencias están realmente en uso.
- Quitar paquetes sin uso o duplicados.

## Día 7 — Revisión de seguridad de cookies y JWT
- Añadir `sameSite`, `secure` y `path` adecuados en producción.
- Revisar cuánto tiempo vive el token y si es del tipo apropiado.

## Día 8 — Capa de servicios
- Extraer lógica de negocio desde controladores a servicios.
- Crear `message.service.js` y `user.service.js`.

## Día 9 — Tooling de pruebas
- Empezar con pruebas de `register`, `login`, y `message` APIs.
- Crear una suite base con `supertest`.

## Día 10 — Escalado de pruebas
- Cubrir errores de sesión y permisos.
- Añadir pruebas para rutas públicas y privadas.

## Día 11 — Políticas de formato y estilo
- Añadir ESLint o reglas de estilo base.
- Revisión de importaciones y orden de archivos.

## Día 12 — Mejorar el manejo de archivos
- Normalizar la carpeta de uploads y evitar almacenamiento local relativo.
- Guardar rutas públicas por configuración.

## Día 13 — Seguridad de datos
- Separar datos públicos y privados en payloads.
- Evitar devolver hashes, tokens o datos confidenciales.

## Día 14 — Manejo de reacciones y mensajes
- Revisar validación de reacción pública y permitir control de duplicados.
- Revisar límites de token y expiración de mensajes.

## Día 15 — UX de login y registro
- Mejorar mensajes de error y flujo de verificación.
- Reducir fricción entre registro, verificación y acceso.

## Día 16 — UX de administración
- Crear un tablero más consistente para listar mensajes.
- Añadir filtros por estado, fecha y usuario.

## Día 17 — Mejorar UI de perfil
- Limpiar formularios de perfil y carga de datos.
- Añadir comprobación de cambios y feedback visual.

## Día 18 — Refactor de frontend API
- Centralizar llamadas fetch y separar endpoints de acceso a datos.
- Reducir lógica duplicada en [frontend/js](../frontend/js).

## Día 19 — Base de documentos y README
- Crear documentación de instalación local y despliegue.
- Añadir ejemplos de `.env` y pasos de arranque.

## Día 20 — Revisión de base de datos
- Crear índices para rutas más comunes y consultas de mensajes.
- Revisar tablas de usuario, mensajes y reacciones.

## Día 21 — Optimización de consultas
- Revisar consultas SQL con `JOIN` o subconsultas.
- Añadir `SELECT` de columnas específicas y eliminar fetches innecesarios.

## Día 22 — Mejora de rendimiento del frontend
- Reducir JS duplicado y mejorar carga de pantallas.
- Añadir lazy loading para pantallas pesadas de administración.

## Día 23 — Preparar despliegue real
- Añadir `Dockerfile`, `docker-compose` y `healthcheck`.
- Crear pipeline de despliegue seguro.

## Día 24 — Introducir variables de entorno de producción
- Separar entornos de desarrollo, staging y producción.
- Validar configuración al arrancar.

## Día 25 — Revisión de mail y QR
- Mejorar el flujo de envío de mail de verificación y mensaje.
- Revisar seguridad del enlace QR y de los archivos de los mensajes.

## Día 26 — Revisión de escalabilidad
- Añadir paginación y filtros de listado de mensajes.
- Revisar forma de cargar mensajes masivos.

## Día 27 — Seguridad de archivos
- Restrict upload a tipos seguros y tamaños razonables.
- Revisar almacenamiento de imágenes cargadas.

## Día 28 — Mediciones y métricas
- Añadir métricas de login exitoso, errores, y uso de endpoints.
- Crear dashboard de observabilidad mínima.

## Día 29 — QA inicial y revisión cruzada
- Ejecutar pruebas de flujo de login, registro, mensajes y reacciones.
- Revisar advertencias de servicios.

## Día 30 — Entregable y consolidación
- Preparar changelog de mejoras.
- Documentar arquitectura tomada y próximos pasos.
