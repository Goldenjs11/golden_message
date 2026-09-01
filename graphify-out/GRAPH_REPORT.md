# Graph Report - C:\Users\User\Documents\Proyectyos\golden_message  (2026-08-31)

## Corpus Check
- Corpus is ~19,884 words - fits in a single context window. You may not need a graph.

## Summary
- 329 nodes · 491 edges · 17 communities (16 shown, 1 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Backend y Base de Datos
- Conceptos del Dominio
- Creación de Mensajes
- Edición de Detalles
- Dependencias npm
- Panel de Gestión
- Menú Principal Admin
- Controlador de Mensajes
- Visor Público
- Gestión de Perfil
- Configuración del Paquete
- Página Acerca de
- Servicio de Correo y Registro
- Sistema de Amigos
- Inicio de Sesión
- Tema Claro y Oscuro
- Registro de Usuario

## God Nodes (most connected - your core abstractions)
1. `Public Message Viewer` - 11 edges
2. `About Landing Page` - 10 edges
3. `Dark/Light Theme Toggle` - 10 edges
4. `cargarMensaje()` - 8 edges
5. `Message Creation Form` - 8 edges
6. `getMessage()` - 7 edges
7. `pool` - 6 edges
8. `getViewerHash()` - 6 edges
9. `saveMessageReaction()` - 6 edges
10. `revisarCookie()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `generarQRConTexto()` --references--> `qrcode`  [EXTRACTED]
  backend/src/controllers/message.controller.js → package.json
- `Profile Management Copy` --semantically_similar_to--> `Profile Management`  [INFERRED] [semantically similar]
  frontend/pages/admin/gestion de perfil copy.html → frontend/pages/admin/gestion de perfil.html
- `notifyMessageView()` --calls--> `enviarMailNotificacionVisualizacionSimple()`  [EXTRACTED]
  backend/src/controllers/message.controller.js → backend/src/utils/mail.service.js
- `About Landing Page` --conceptually_related_to--> `Reactions System`  [EXTRACTED]
  frontend/pages/about.html → frontend/pages/views_mensajes.html
- `Message Management List` --references--> `Message Active/Inactive Status`  [EXTRACTED]
  frontend/pages/admin/gestion mensajes.html → frontend/pages/admin/creacion mensajes.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Message Creation to Public Viewing Pipeline** — frontend_pages_admin_creacion_mensajes, frontend_pages_admin_detalle_mensajes, frontend_pages_views_mensajes, concept_qr_code_generation, concept_message_details [INFERRED 0.85]
- **Profile Data Rendered in Public Message Viewer** — frontend_pages_admin_gestion_de_perfil, frontend_pages_views_mensajes, concept_public_username, concept_social_links, concept_banner_customization [INFERRED 0.85]
- **Authentication Entry Points into Admin Panel** — frontend_pages_login, frontend_pages_register, frontend_pages_admin_menu, rationale_auth_flow [EXTRACTED 1.00]

## Communities (17 total, 1 thin omitted)

### Community 0 - "Backend y Base de Datos"
Cohesion: 0.08
Nodes (30): __dirname, __filename, pool, login(), verificarCuenta(), getMessageById(), getMessageDetailsById(), saveMessageDetails() (+22 more)

### Community 1 - "Conceptos del Dominio"
Cohesion: 0.11
Nodes (33): Banner Gradient Customization, Comments on Messages, Availability Countdown Timer, Detail Position Ordering, Email Confirmation on Registration, Friends System, Message Availability Window, Message Detail Segments (+25 more)

### Community 2 - "Creación de Mensajes"
Cohesion: 0.10
Nodes (24): actualizarMensaje(), btnActualizarDetalles, btnCrearDetalles, cargarDatosEditarMenssage(), configurarBotonCopiar(), contActualizar, copiarTexto(), copyMessageLinkBtn (+16 more)

### Community 3 - "Edición de Detalles"
Cohesion: 0.13
Nodes (23): addDetailBtn, addDetailCard(), btnActualizarDetalles, btnCrearDetalles, cargarDetallesMenssage(), collectDetails(), colorValue(), createDetailHTML() (+15 more)

### Community 4 - "Dependencias npm"
Cohesion: 0.08
Nodes (25): bcryptjs, canvas, cors, dotenv, express, jsonwebtoken, multer, nodemailer (+17 more)

### Community 5 - "Panel de Gestión"
Cohesion: 0.09
Nodes (20): actualizarPaginacion(), btnAgregar, btnAgregarEmpty, btnBuscarForm, btnExportar, btnLimpiar, cargarCatalogo(), entriesPerPageSelect (+12 more)

### Community 6 - "Menú Principal Admin"
Cohesion: 0.11
Nodes (20): activarObserver(), agruparPorPosition(), bannerMini, contacts, contactsList, escribirTexto(), filteredCatalogoMessages, groupedMessages (+12 more)

### Community 7 - "Controlador de Mensajes"
Cohesion: 0.16
Nodes (20): createMessage(), deleteMessageReaction(), __dirname, __filename, fontPath, generarQRConTexto(), getAllMessages(), getClientIp() (+12 more)

### Community 8 - "Visor Público"
Cohesion: 0.20
Nodes (19): actualizarVistaConMensaje(), agregarReacciones(), agruparPorPosition(), cargarMensaje(), cargarReacciones(), configurarBotonDetalles(), escribirTexto(), groupedMessages (+11 more)

### Community 9 - "Gestión de Perfil"
Cohesion: 0.13
Nodes (18): actualizarAvatar(), actualizarBadge(), avatarInitial, bannerBg1, bannerBg2, bannerPreview, bannerText1, bannerText2 (+10 more)

### Community 10 - "Configuración del Paquete"
Cohesion: 0.12
Nodes (16): nodemon, author, description, devDependencies, nodemon, @types/pg, keywords, license (+8 more)

### Community 11 - "Página Acerca de"
Cohesion: 0.24
Nodes (11): applySources(), centerVid, gallery, initGallery(), leftVid, leftWrap, rightVid, rightWrap (+3 more)

### Community 12 - "Servicio de Correo y Registro"
Cohesion: 0.25
Nodes (10): register(), crearMailGenerico(), crearMailNotificacionVisualizacionSimple(), crearMailRestablecerContrasena(), crearMailVerificacion(), enviarMailGenerico(), enviarMailNotificacionVisualizacionSimple(), enviarMailRestablecerContrasena() (+2 more)

### Community 13 - "Sistema de Amigos"
Cohesion: 0.43
Nodes (6): getFriends(), getPendingRequests(), respondFriendRequest(), searchUsers(), sendFriendRequest(), router

### Community 14 - "Inicio de Sesión"
Cohesion: 0.33
Nodes (3): mensajeError, mensajeErrorPermiso, switchTheme

### Community 15 - "Tema Claro y Oscuro"
Cohesion: 0.47
Nodes (4): anims, click(), clickTog(), toggle()

## Knowledge Gaps
- **122 isolated node(s):** `__filename`, `__dirname`, `__filename`, `__dirname`, `fontPath` (+117 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Dependencias npm` to `Configuración del Paquete`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `generarQRConTexto()` connect `Controlador de Mensajes` to `Dependencias npm`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `qrcode` connect `Dependencias npm` to `Controlador de Mensajes`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `__filename`, `__dirname`, `__filename` to the rest of the system?**
  _122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend y Base de Datos` be split into smaller, more focused modules?**
  _Cohesion score 0.08048780487804878 - nodes in this community are weakly interconnected._
- **Should `Conceptos del Dominio` be split into smaller, more focused modules?**
  _Cohesion score 0.10795454545454546 - nodes in this community are weakly interconnected._
- **Should `Creación de Mensajes` be split into smaller, more focused modules?**
  _Cohesion score 0.09788359788359788 - nodes in this community are weakly interconnected._