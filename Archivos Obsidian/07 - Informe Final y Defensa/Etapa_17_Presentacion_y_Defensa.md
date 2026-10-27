# Guion de Presentación y Defensa Oral del Proyecto

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas y Gestión para Resto-Bar  
**Expositores:** Alex Combina & Fabrizio Magnelli  
**Tiempo Estimado:** 15 a 20 minutos  

---

## Estructura de la Defensa

```
1. Introducción y Problema (2 min) -> Fabrizio
2. Arquitectura y Desarrollo del Código (3 min) -> Alex
3. Estrategia de Testing y Casos de Prueba (4 min) -> Fabrizio
4. Demostración TDD y Refactorización (3 min) -> Alex
5. Demostración en Vivo del Sistema y Suite Automatizada (5 min) -> Ambos
6. Conclusiones y Ronda de Preguntas (3 min) -> Ambos
```

---

## Diálogo y Minuta de Exposición

### Bloque 1: Problema y Requisitos (Fabrizio Magnelli)
- *"Buenas tardes profesores. Presentamos el proyecto integrador de la cátedra de Verificación y Validación de Software. El problema que abordamos es la gestión deficiente de reservas en locales gastronómicos: sobreturnos, pérdida de señas y falta de confirmación fehaciente."*
- Explicar los 5 Requisitos Funcionales: RF01 (Registro), RF02 (Cálculo de Seña con recargos), RF03 (Confirmación), RF04 (Cancelación estricta a 24 hs) y RF05 (Control de 50 lugares por turno).

### Bloque 2: Arquitectura y Programación Defensiva (Alex Combina)
- *"Dividimos la solución en módulos desacoplados: `feeCalculator.js` como motor puro de negocio y `reservationService.js` como coordinador de estados."*
- Mostrar cómo el código aplica programación defensiva validando tipos (`TypeError`), límites numéricos (`RangeError` entre 1 y 12 personas) y consistencia temporal de turnos.

### Bloque 3: Estrategia de Calidad y Casos de Prueba (Fabrizio Magnelli)
- Explicar la diferencia entre **Verificación** (análisis estático, TDD) y **Validación** (caja negra, pruebas de sistema).
- Detallar las **Clases de Equivalencia y Valores Límite** (fronteras 0, 1, 4, 5, 12, 13).
- Explicar el grafo de flujo de control y caminos básicos para la cobertura de **Caja Blanca** de la función de seña ($V(G)=4$).

### Bloque 4: TDD, Defectos y Refactorización (Alex y Fabrizio)
- Alex: Explicar el ciclo **Red -> Green -> Refactor** aplicado al cálculo de señas. Mostrar el código antes y después de refactorizar (eliminación de números mágicos y encapsulamiento de constantes).
- Fabrizio: Explicar el ciclo de vida de los defectos `BUG-001` (días viernes omitidos en el recargo de fin de semana) y `BUG-002` (cálculo horario de 24 hs para cancelaciones), y cómo las **Pruebas de Regresión** garantizaron que la solución no introdujo fallas colaterales.

### Bloque 5: Demostración en Vivo
1. Ejecutar en terminal: `npm test`.
   - Mostrar a la cátedra cómo los 25 casos de prueba unitarios, de integración y de límites pasan en 120 ms con reporte verde.
2. Abrir el sistema interactivo en el navegador con `npm run dev`.
   - Simular una reserva un viernes para 6 personas, mostrando en pantalla el desglose del 10% de grupo y el 15% de fin de semana.
   - Demostrar el bloqueo automático ante intentos de sobrepasar los 50 comensales.

### Bloque 6: Conclusiones
- Destacar que aplicar testing automatizado desde el inicio permitió un sistema 100% predecible y blindado contra fallos de concurrencia y pérdidas económicas.
