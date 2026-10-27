# Informe Técnico Final y Memoria del Proyecto

# Sistema de Gestión, Validación y Reservas para Resto-Bar

**Asignatura:** Verificación y Validación de Software  
**Carrera:** Tecnicatura Superior en Desarrollo de Software (TSDS - 3° Año)  
**Institución:** Universidad Provincial de Córdoba (UPC) - Sede Regional Las Varillas "D. Vélez Sársfield"  
**Integrantes:**
- **Fabrizio Magnelli** (QA Lead, Testing Técnico, Automatización y Documentación)
- **Alex Combina** (Desarrollador de Software, Arquitectura y Lógica de Negocio)
**Fecha:** 27 de Octubre de 2026  
**Repositorio GitHub:** [https://github.com/fabriimagnelli/VyV-RestoBar](https://github.com/fabriimagnelli/VyV-RestoBar)

---

## 1. Portada y Presentación
El presente informe documenta de manera integral el desarrollo, verificación, validación y aseguramiento de la calidad de un sistema de software para resto-bar. Se abordaron todas las etapas del ciclo de vida de la actividad integradora, haciendo énfasis en técnicas de caja negra, caja blanca, programación defensiva, TDD, automatización y seguimiento de defectos.

---

## 2. Descripción del Problema y Justificación
El resto-bar enfrentaba severos problemas operativos por la gestión manual de sus reservas (llamadas y mensajes de chat), ocasionando sobreventa (overbooking) en horarios pico, falta de control en el aforo físico, inconsistencias en el cobro de señas y cancelaciones arbitrarias que producían pérdidas financieras.

---

## 3. Objetivos del Proyecto
- Desarrollar un sistema modular, robusto y testeable para la gestión del ciclo de vida de reservas.
- Implementar un motor financiero de cálculo de señas con recargos por volumen y días festivos/fin de semana.
- Blindar el aforo del establecimiento en un máximo de 50 comensales por turno.
- Aplicar rigurosamente la metodología TDD y diseñar casos de prueba automatizados con métricas verificables.

---

## 4. Requisitos Funcionales Formales
1. **RF01 - Registrar Reserva:** Alta con comensales (1 a 12), fecha (0 a 30 días), turnos (1 o 2) y generación de código unívoco.
2. **RF02 - Calcular Importe de Seña:** Tarifa base de \$2.000 por persona; +10% de recargo si el grupo es de 5 a 12 personas; +15% de recargo adicional si es Viernes o Sábado.
3. **RF03 - Confirmar Reserva:** Validación del abono completo de la seña y descuento definitivo de cupo.
4. **RF04 - Cancelar Reserva:** Aceptada sin penalización hasta 24 hs antes del inicio del turno; rechazo estricto fuera de plazo.
5. **RF05 - Consultar Disponibilidad:** Verificación en tiempo real del aforo disponible (0 a 50).

---

## 5. Arquitectura y Tecnologías Utilizadas
- **Lenguaje:** JavaScript ES Modules bajo Node.js (v22+).
- **Framework de Pruebas:** Node.js Test Runner nativo (`node:test`) y aserciones estrictas (`node:assert/strict`).
- **Frontend / Prototipado:** Vite, HTML5 semántico, CSS3 moderno, JavaScript reactivo.
- **Herramienta de Auditoría UI:** Skill `impeccable`.
- **Control de Versiones y Gestión:** Git, GitHub y Obsidian.

---

## 6. Estrategia de Verificación y Validación

### A. Verificación (Durante el desarrollo):
- Inspecciones de código y checklists estáticos.
- Desarrollo Dirigido por Pruebas (TDD) en el cálculo de señas.
- Pruebas unitarias de cajas blancas y análisis de caminos de ejecución.

### B. Validación (Sistema en funcionamiento):
- Partición en clases de equivalencia y análisis de valores límite (Caja Negra).
- Pruebas de integración de punta a punta (Registro -> Pago de seña -> Asignación de cupo -> Cancelación).
- Pruebas de carga y saturación de aforo.

---

## 7. Resumen de Casos de Prueba Ejecutados

Se formalizaron y ejecutaron **25 pruebas automatizadas**, logrando un **100% de aprobación (Pass)**:

| ID / Grupo | Descripción | Técnica | Resultado |
| :--- | :--- | :--- | :---: |
| **CP-01** | Tarifa base para 2 personas en día de semana (\$4.000) | Clases de Equivalencia | **Aprobado** |
| **CP-02** | Límite de 4 comensales sin recargo de grupo (\$8.000) | Valores Límite | **Aprobado** |
| **CP-03** | Límite de 5 comensales con 10% de recargo (\$11.000) | Valores Límite | **Aprobado** |
| **CP-04** | Máximo de 12 comensales un Viernes (+10% y +15% = \$30.360) | Camino Complejo | **Aprobado** |
| **CP-05** | Rechazo de 0 comensales (límite inferior) | Valores Límite | **Aprobado** |
| **CP-06** | Rechazo de 13 comensales (límite superior) | Valores Límite | **Aprobado** |
| **CP-07** | Registro normal en estado pendiente | Integración | **Aprobado** |
| **CP-08** | Confirmación al abonar seña exacta | Integración | **Aprobado** |
| **CP-09** | Cancelación anticipada (>24 hs) con liberación de cupo | Límite Temporal | **Aprobado** |
| **CP-10** | Rechazo de cancelación tardía (<24 hs) | Límite Temporal | **Aprobado** |
| **CP-11** | Bloqueo estricto al superar 50 lugares por turno | Saturación | **Aprobado** |
| **Tests defensivos** | Rechazo de decimales, negativos, strings, turnos inválidos | Robustez | **Aprobado** |

---

## 8. Ciclo TDD y Refactorización

Se documentó la aplicación del ciclo en tres fases sobre el motor `feeCalculator`:
1. **Red:** Escritura inicial del test `CP-04` que fallaba por ausencia de lógica de recargos.
2. **Green:** Programación mínima necesaria para satisfacer el test.
3. **Refactor:** Reemplazo de números mágicos por constantes con nombres semánticos, incorporación de validaciones de tipo entero y límites de rango, y modularización del extractor de días de semana (`isWeekend`) para blindarlo contra inconsistencias de zona horaria UTC.

---

## 9. Registro y Resolución de Defectos (Bugs)

Se documentaron y resolvieron 2 defectos en el ciclo de pruebas:
- **BUG-001 (Alta):** Omisión del recargo del 15% en días viernes por chequeo exclusivo de fines de semana sábado/domingo. Subsanado y verificado.
- **BUG-002 (Alta):** Evaluación errónea de la regla de 24 horas para cancelaciones mediante días calendario en lugar de diferencia horaria respecto al inicio del turno. Subsanado y validado.

Tras cada corrección se ejecutaron **Pruebas de Regresión**, demostrando cero efectos secundarios colaterales.

---

## 10. Conclusiones y Defensa Técnica

El proyecto demostró con éxito cómo la integración temprana de técnicas de aseguramiento de calidad (TDD, análisis de valores límite, pruebas de integración y automatización con runners nativos) reduce drásticamente la tasa de defectos en producción. El software resultante es seguro, predecible, escalable y cumple al 100% con los requerimientos académicos y las necesidades reales del negocio gastronómico.

---

## 11. Bibliografía y Fuentes Consultadas
1. Pressman, R. S. (2010). *Ingeniería del Software: Un enfoque práctico*. McGraw-Hill.
2. Myers, G. J., Sandler, C., & Badgett, T. (2011). *The Art of Software Testing*. John Wiley & Sons.
3. Beck, K. (2002). *Test-Driven Development: By Example*. Addison-Wesley Professional.
4. Documentación Oficial de Node.js Test Runner: `https://nodejs.org/api/test.html`.
5. Apuntes de Cátedra: *Verificación y Validación de Software*, UPC (2026).
