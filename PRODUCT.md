# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Vite + HTML/CSS/JS vanilla modular con almacenamiento reactivo en localStorage.

## Users
- **Clientes del Resto-Café**: Comensales individuales, parejas, familias o grupos de amigos que desean reservar una mesa de forma inmediata según turno o franja horaria, sin llamadas ni demoras.
- **Personal / Host / Administrador**: Equipo de salón y gerencia que supervisa la ocupación en tiempo real, confirma asistencias (check-in), gestiona cancelaciones y no-shows, y configura mesas, aforos y horarios del local.

## Product Purpose
Plataforma web ágil, intuitiva y responsive diseñada para resto-cafés contemporáneos. Resuelve de forma integral la reserva autónoma del cliente y el control visual de ocupación del local para el personal, eliminando el riesgo de sobreturnos (overbooking) y agilizando la operación del salón.

## Positioning
Sistema enfocado en la cadencia dinámica de un resto-café (turnos de Desayuno, Almuerzo, Merienda y Cena con slots de 60-90 min), asignación inteligente de sectores (Terraza/Exterior, Salón Principal, Barra), confirmación instantánea con código y envío directo a WhatsApp, complementado por un mapa interactivo de mesas con actualización en tiempo real.

## Operating Context
- **Entorno Cliente**: Navegadores móviles y de escritorio; flujo de reserva en 3 pasos con confirmación inmediata y enlace directo a WhatsApp.
- **Entorno Staff / Recepción**: Pantalla de host o tablet en caja/mostrador; vista panorámica del aforo diario, grilla horaria y mapa de mesas con cambio rápido de estados (Libre, Reservada, Ocupada).

## Capabilities and Constraints
- Selector de fecha y turno (Desayuno, Almuerzo, Merienda, Cena) con franjas horarias configurables (slots de 60-90 min).
- Selección de comensales (1 a 8+ personas).
- Selector de zona/sector con indicación de ambiente (Terraza/Exterior, Salón Principal, Barra).
- Motor de disponibilidad en tiempo real con bloqueo dinámico de turnos agotados (prevención estricta de overbooking).
- Formulario de contacto con nombre, apellido, teléfono/WhatsApp y notas especiales (cumpleaños, accesibilidad, requerimientos dietarios).
- Pantalla de confirmación con código alfanumérico único de reserva y botón de acción para enviar detalles formateados por WhatsApp al número del local.
- Panel de gestión para administración y staff:
  - Vista de ocupación mediante grilla horaria/calendario diario.
  - Mapa visual interactivo de mesas con estados (Libre, Reservada, Ocupada) y listado filtrable.
  - Gestión completa de mesas (creación, edición de capacidad máxima, activación/desactivación y asignación a sectores).
  - Control de reservas (marcar check-in / asistencia, cancelar, registrar no-show y asignación manual de mesa).
  - Configuración del local (nombre, teléfono WhatsApp, horarios de atención, duración estimada por turno y margen de tolerancia en minutos).
- Toggle superior para alternar fluidamente entre la Vista Cliente y el Panel Staff, manteniendo sincronía de datos en vivo.

## Brand Commitments
- Nombre de marca predeterminado: **"Café & Bistro La Boîte"** (configurable).
- Identidad visual gastronómica de alta gama: paleta cálida (café tostado, ámbar dorado, carbón profundo, crema suave), tipografía refinada y micro-interacciones fluidas.

## Evidence on Hand
- Especificación funcional directa del usuario detallando los requerimientos para Flujo Cliente y Panel de Gestión.

## Product Principles
- **Cero fricción para el comensal**: La reserva se completa en menos de 1 minuto sin registro previo obligatorio.
- **Aforo blindado contra overbooking**: No se puede reservar si las mesas del sector o turno superan su capacidad.
- **Claridad de un vistazo para el staff**: El estado del local (libre, reservada, ocupada) se percibe en 3 segundos en el mapa visual.
- **Conexión humana vía WhatsApp**: Confirmación inmediata y canal directo con el comercio.

## Accessibility & Inclusion
- Contraste accesible WCAG AA en modos claro y oscuro.
- Interfaz táctil optimizada para móviles (botones amplios, feedback háptico/visual en selección de slots y mesas).
