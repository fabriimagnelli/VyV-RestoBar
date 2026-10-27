---
name: Café & Bistro La Boîte
description: Sistema visual táctil inspirado en el libro mayor de reservas y planos en mármol de los grandes bistrós europeos.
colors:
  primary: "#c59a53"
  primary-hover: "#b0843d"
  primary-light: "#fbf6ec"
  neutral-bg: "#f2f0eb"
  surface: "#fffdfa"
  surface-dark: "#181512"
  text-primary: "#1c1916"
  text-secondary: "#685e50"
  text-muted: "#968a78"
  text-on-dark: "#fbf9f4"
  status-free: "#245e43"
  status-free-bg: "#edf6f1"
  status-reserved: "#bf7224"
  status-reserved-bg: "#fdf5ea"
  status-occupied: "#8c2d22"
  status-occupied-bg: "#fcf1ef"
typography:
  display:
    fontFamily: "Cinzel, serif"
    fontSize: "clamp(1.25rem, 2vw, 1.6rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
  quote:
    fontFamily: "Newsreader, serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.93rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-on-dark}"
    rounded: "{rounded.sm}"
    padding: "16px 24px"
  button-primary-hover:
    backgroundColor: "#25201b"
    textColor: "{colors.text-on-dark}"
    rounded: "{rounded.sm}"
  chip-state-free:
    backgroundColor: "{colors.status-free-bg}"
    textColor: "{colors.status-free}"
    rounded: "{rounded.pill}"
    padding: "3px 8px"
---

# Design System: Café & Bistro La Boîte

## Overview

**Creative North Star: "The Grand Bistro Reservation Book & Marble Stand"**

El sistema visual de La Boîte rechaza las interfaces administrativas despersonalizadas y los formularios estériles de SaaS. Toma como referencia la atmósfera tangible de la alta gastronomía europea: el peso del latón bruñido, la calma del mármol claro, la caligrafía clásica sobre papel lino y la precisión de un anfitrión experimentado que gestiona el salón con elegancia.

La arquitectura visual organiza el espacio en dos planos armónicos: a la izquierda, el **Libro de Turnos** con tipografía editorial de hospitalidad y controles táctiles de selección inmediata; a la derecha, el **Atril de Mármol**, un croquis visual interactivo donde las mesas se reconocen al instante por sector, capacidad y estado de ocupación.

**Key Characteristics:**
- Fusión de calidez física (latón, mármol travertino, crema lino) con reactividad digital en tiempo real.
- Tipografía jerárquica con identidad fuerte ('Cinzel' para monogramas y mesas, 'Newsreader' para hospitalidad, 'Plus Jakarta Sans' para interacción).
- Estados de aforo inequívocos codificados por color orgánico (verde bosque, ámbar cálido, borgoña profundo).
- Ausencia de artificios vacíos (cero neón, cero bordes gruesos artificiales, cero emojis en lugar de iconos vectoriales).

## Colors

La paleta cromática se construye a partir de materiales nobles de bistró: café espresso, bronce pulido, mármol mineral y toques botánicos.

### Primary
- **Burnished Brass** (`#c59a53`): El acento insignia del sistema. Utilizado para marcar selecciones activas, bordes de enfoque y detalles de prestigio.
- **Brass Deep** (`#b0843d`): Tono de interacción hover para botones y tabs activos.
- **Brass Light** (`#fbf6ec`): Superficie tenue para elementos interactivos en foco o mesas seleccionadas.

### Secondary
- **Forest Green** (`#245e43`): Identifica mesas y slots libres con aforo disponible, y el sello de confirmación inmediata.
- **Amber Gold** (`#bf7224`): Comunica mesas reservadas próximas a ocupar y franjas horarias con última mesa disponible.
- **Wine Burgundy** (`#8c2d22`): Comunica mesas ocupadas actualmente y alertas de sobreturno o aforo completo.

### Neutral
- **Deep Espresso** (`#181512`): Fondo de cabeceras, botones principales de confirmación y badges de prestigio.
- **Mineral Alabaster** (`#f2f0eb`): Fondo general del canvas, aportando calma visual y calidez sin caer en el blanco estéril.
- **Crisp Linen** (`#fffdfa`): Superficie de tarjetas y paneles principales con sutil separación física.
- **Pewter Text** (`#1c1916`): Tinta tipográfica principal de alto contraste y legibilidad.

### Named Rules
**The Material Restraint Rule.** El latón dorado (`#c59a53`) se reserva exclusivamente para acciones primarias y selección activa. Nunca se utiliza como fondo masivo de página ni en textos de cuerpo.

## Typography

**Display Font:** Cinzel (con fallback a Georgia, serif)  
**Quote / Accent Font:** Newsreader (con fallback a Times New Roman, serif)  
**Body & UI Font:** Plus Jakarta Sans (con fallback a system-ui, -apple-system, sans-serif)

**Character:** Un diálogo entre la autoridad monumental clásica del bistró histórico y la agilidad nítida del diseño contemporáneo de interfaces.

### Hierarchy
- **Display** (Cinzel, 700, clamp(1.25rem, 2vw, 1.6rem), line-height 1.2): Encabezados de sección, números de mesa y títulos de comprobante.
- **Quote / Subhead** (Newsreader, 400 italic, 0.95rem, line-height 1.4): Citas de bienvenida, descripciones de turno y notas de hospitalidad.
- **Body** (Plus Jakarta Sans, 500-600, 0.93rem, line-height 1.5): Textos de formulario, etiquetas descriptivas y valores tabulares.
- **Label** (Plus Jakarta Sans, 700, 0.75rem, letter-spacing 0.06em, uppercase): Chips de estado, números de comensales y encabezados de tabla.

## Layout

El layout principal implementa una cabecera fija de 84px con monograma y reloj en vivo, seguido de un contenedor central de 1440px máximo.
En escritorio, el modo cliente opera como un cockpit de dos columnas (500px para el Libro de Reservas, 1fr para el Plano de Mesas).
En pantallas móviles y tablets (< 1080px), el layout se adapta a un flujo vertical apilado sin pérdida de controles ni sobrecarga visual.

## Elevation & Depth

La profundidad se modela mediante sombras neutras de difusión suave derivadas de la luz natural ambiental sobre superficies de madera y mármol, prohibiendo halos de color o resplandores artificiales.

### Shadow Vocabulary
- **Elevación Baja (`--shadow-sm`)** (`0 2px 8px rgba(35, 28, 20, 0.05)`): Utilizado en tarjetas de mesa en reposo y botones secundarios.
- **Elevación Media (`--shadow-md`)** (`0 8px 24px rgba(35, 28, 20, 0.08)`): Utilizado en el contenedor del Libro Mayor y el panel de salón.
- **Elevación Alta (`--shadow-lg`)** (`0 16px 40px rgba(35, 28, 20, 0.12)`): Utilizado en el comprobante final de confirmación y modales.

## Shapes

- Radios sutiles y consistentes: `6px` para botones y controles interactivos (`--radius-sm`), `10px` para tarjetas medianas (`--radius-md`), y `16px` para contenedores maestros (`--radius-lg`).
- Chips de estado totalmente redondeados (`--radius-pill`: 9999px).
- Bordes sutiles de 1px con opacidad medida (`rgba(104, 94, 80, 0.18)`).

## Components

### Buttons
- **Shape:** Radio de 6px (`--radius-sm`).
- **Primary:** Fondo Deep Espresso (`#181512`), borde de 1px en Brass Gold (`#c59a53`), texto blanco en Cinzel 700 con tracking espaciado.
- **WhatsApp Action:** Fondo verde WhatsApp oficial (`#25d366`), texto blanco, elevación neutra.

### Table Token Cards
- **Structure:** Ficha táctil con número de mesa en Cinzel, badge de capacidad con icono vectorial de comensales y píldora de estado.
- **State Selection:** Al seleccionarse como preferida, adopta borde de 2px en Brass Gold y fondo Brass Light.

### Form Inputs
- **Style:** Fondo mineral suave, borde sutil de 1px, texto en Plus Jakarta Sans.
- **Focus:** Borde reforzado en Brass Gold con aro de enfoque suave sin halo de color invasivo.

## Do's and Don'ts

### Do:
- **Do** usar iconos vectoriales SVG limpios y unificados de 15-18px con stroke-width 2px.
- **Do** mantener el feedback háptico/visual en la selección de slots de tiempo y comensales.
- **Do** validar la disponibilidad en tiempo real para bloquear turnos sin mesas compatibles y erradicar el overbooking.

### Don't:
- **Don't** utilizar emojis como sustituto de iconos en el sistema.
- **Don't** utilizar bordes gruesos de color en un solo lado de las tarjetas (anti-patrón side-tab).
- **Don't** colocar resplandores de colores saturados como sombras sobre fondos oscuros.
