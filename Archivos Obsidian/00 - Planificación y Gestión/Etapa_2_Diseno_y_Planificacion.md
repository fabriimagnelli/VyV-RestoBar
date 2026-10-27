# Etapa 2: Diseño y Planificación - Sistema Resto-Bar

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Fecha:** 27 de Octubre de 2026  

---

## 1. Integrantes del Equipo y Distribución de Responsabilidades

El proyecto se desarrolla en equipo con una clara separación funcional entre desarrollo de lógica/código y control de calidad / aseguramiento y gestión:

| Integrante | Rol Principal | Responsabilidades Asignadas |
| :--- | :--- | :--- |
| **Alex Combina** | Desarrollador de Software | • Programación de módulos de lógica de negocio (registro de reservas, motor de cálculo de señas, control de cupos).<br>• Desarrollo de la maqueta y componentes UI frontend.<br>• Implementación de validaciones defensivas y manejo de errores en código.<br>• Aplicación de refactorización según ciclo TDD. |
| **Fabrizio Magnelli** | QA Lead / Tester Técnico & Gestión | • Planificación y estrategia de aseguramiento de calidad (QA).<br>• Diseño formal de casos de prueba (Caja Negra y Caja Blanca).<br>• Configuración y ejecución de pruebas automatizadas (unitarias, integración, sistema y regresión).<br>• Registro, clasificación y seguimiento de defectos (Bugs).<br>• Gestión de la documentación en Obsidian y redacción del Informe Técnico Final. |

---

## 2. Alcance y Funcionalidades a Desarrollar

Se contemplan las siguientes funcionalidades principales basadas en el análisis de requisitos formal (RF01 a RF05):

1. **Gestión y Registro de Reservas (RF01):**
   - Alta de reservas capturando comensales (1 a 12), fecha (no pasadas, máx. 30 días), turno (Turno 1: 11:00 a 14:00 | Turno 2: 20:00 a 00:30) y datos del cliente.
   - Emisión de código alfanumérico único en estado inicial `Pendiente`.
2. **Motor de Cálculo de Seña y Recargos (RF02 - Módulo Núcleo para TDD y Caja Blanca):**
   - Tarifa base: \$2.000 por persona (1 a 4 comensales).
   - Recargo de grupo: +10% sobre el subtotal base para grupos de 5 a 12 personas.
   - Recargo de fin de semana: +15% adicional sobre el total si el día reservado es Viernes o Sábado.
3. **Confirmación y Asignación de Cupos (RF03):**
   - Transición de estado a `Confirmada` con validación de pago de seña.
   - Descuento definitivo del aforo disponible por turno (máx. 50 personas por turno).
4. **Cancelación y Liberación de Cupo (RF04):**
   - Cancelación sin penalización permitida con antelación mínima de 24 horas respecto al inicio del turno.
   - Liberación automática del cupo para reasignación. Bloqueo de cancelación fuera de término.
5. **Consulta de Disponibilidad y Aforo en Tiempo Real (RF05):**
   - Verificación de cupos restantes por fecha y turno (0 a 50 comensales) para prevenir terminantemente el overbooking.
6. **Interfaz Web Interactiva (Maqueta Operativa):**
   - Frontend web responsivo que permite al comensal reservar y al personal visualizar la ocupación y estados de las mesas.

---

## 3. Tecnologías y Herramientas

- **Lenguaje y Entorno:** JavaScript (ES Modules), Node.js (v22+).
- **Frontend / Bundler:** HTML5, CSS3 moderno, JavaScript nativo modular, Vite.
- **Testing Framework y Aserciones:** Node.js Test Runner nativo (`node:test`, `node:assert/strict`). Permite ejecución rápida, sin dependencias externas complejas ni problemas de transpilación.
- **Control de Versiones:** Git y GitHub como repositorio central de colaboración.
- **Documentación y Trazabilidad:** Obsidian (Markdown estructurado por etapas).
- **Diseño y Calidad Visual de Interfaz:** Skill `impeccable` para auditoría, jerarquía y estándares de usabilidad/accesibilidad frontend.

---

## 4. Repositorio del Proyecto

- **Plataforma:** GitHub
- **Repositorio:** `fabriimagnelli/VyV-RestoBar` (o URL remota configurada en el proyecto)
- **Estrategia de Ramas:**
  - `main`: Versión estable, código testeado y documentación verificada.
  - Ramas de características / etapas para desarrollo incremental y commits descriptivos por integrante.

---

## 5. Estrategia de Pruebas: Verificación vs. Validación

Siguiendo las buenas prácticas de la ingeniería de software y la materia:

### A. Verificación (Durante el desarrollo - "¿Estamos construyendo el producto correctamente?"):
- **Revisiones Estáticas:** Análisis de código fuente e inspecciones cruzadas de requisitos frente a la implementación.
- **Desarrollo Dirigido por Pruebas (TDD):** Aplicado al motor de cálculo de señas (`RF02`), con ciclo estricto *Red -> Green -> Refactor*.
- **Pruebas Unitarias:** Validación aislada de funciones defensivas (tipos, límites, excepciones para números negativos, rangos fuera de 1-12 personas, fechas inválidas).
- **Pruebas de Caja Blanca:** Análisis estructural de caminos lógicos, sentencias, decisiones compuestas (ej. grupo > 4 y días viernes/sábado) y cobertura en el cálculo financiero.
- **Pruebas de Integración:** Verificación de la comunicación e interoperabilidad entre módulos (ej. Reserva -> Cálculo de seña -> Asignación de cupo en Turno).

### B. Validación (Con el sistema integrado - "¿Estamos construyendo el producto correcto?"):
- **Pruebas de Caja Negra:** Clases de equivalencia y análisis de valores límite aplicados a formularios de entrada (cantidades 0, 1, 4, 5, 12, 13; fechas hoy, hoy-1, hoy+30, hoy+31).
- **Pruebas de Sistema:** Ejecución de flujos completos de punta a punta (End-to-End) simulando el comportamiento real del cliente y del encargado de recepción.
- **Pruebas con Situaciones Excepcionales:** Intentos de reserva simultánea que sobrepasen el cupo de 50 personas, cancelaciones a menos de 24 hs, ingresos con tipos erróneos.
- **Pruebas de Regresión:** Reejecución automatizada de la suite de pruebas tras cada refactorización o corrección de defectos para asegurar la no degradación de funcionalidades previas.

---

## 6. Plan de Automatización y Herramientas de Testing

| Tipo de Prueba | Herramienta | Enfoque / Objetivo |
| :--- | :--- | :--- |
| **Unitarias (TDD)** | `node:test` + `node:assert/strict` | Probar exhaustivamente la lógica del cálculo de señas (`RF02`), validación de parámetros y excepciones defensivas. |
| **Integración** | `node:test` | Probar el flujo completo entre creación de reserva, verificación de disponibilidad por turno y confirmación. |
| **Automatización E2E / API Mock** | Scripts Node.js + Server Mock | Simulación de reservas concurrentes y control de aforo máximo de 50 lugares. |
| **Inspección de UI / Frontend** | Skill `impeccable` | Auditoría de contraste, jerarquía visual, usabilidad en móviles y validación de estados de formulario. |

---

## 7. Cronograma y Entregables por Etapas

1. **Etapa 1:** Análisis del Problema y Requisitos Formales *(Completado)*.
2. **Etapa 2:** Diseño, Planificación y Estrategia de Pruebas *(Documento actual)*.
3. **Etapa 3:** Desarrollo de Módulos Centrales con Programación Defensiva.
4. **Etapa 4:** Verificación y Revisión Estática.
5. **Etapa 5 & 6:** Diseño y Ejecución de Casos de Prueba (Caja Negra y Caja Blanca).
6. **Etapa 7:** Registro y Seguimiento Formal de Defectos (Bugs).
7. **Etapa 8 & 9:** Pruebas Unitarias y de Integración Automatizadas.
8. **Etapa 10 & 11:** Pruebas de Sistema y Automatización.
9. **Etapa 12:** TDD y Refactorización documentada.
10. **Etapa 13 a 15:** Pruebas de Regresión, Revisión de Artefactos no código e Informe Técnico Final.
