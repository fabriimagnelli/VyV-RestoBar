# Etapa 10: Pruebas de Sistema y Validación

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Tester Técnico:** Fabrizio Magnelli  
**Fecha:** 27 de Octubre de 2026  

---

## 1. Objetivo de las Pruebas de Sistema

Validar el producto de software en su totalidad para determinar si cumple cabalmente con las necesidades y requisitos definidos inicialmente en el análisis del problema (Etapa 1).

---

## 2. Dimensiones Evaluadas del Sistema

### 2.1 Funcionamiento y Cumplimiento de Requisitos (RF01 - RF05)
- **Registro y Trazabilidad:** Se validó que los clientes puedan ingresar datos y obtener reservas unívocas identificadas con código alfanumérico.
- **Transición de Estados:** Se verificó que ninguna reserva pueda saltar de estados de forma ilegal (ejemplo: confirmar una reserva ya cancelada, o cancelar reservas finalizadas).
- **Control de Aforo Estricto:** Se comprobó que el sistema bloquea cualquier solicitud que supere los 50 comensales por turno, erradicando el problema de sobreventa.

### 2.2 Manejo de Errores y Comportamiento ante Datos Incorrectos
- **Tipos de datos anómalos:** Cadenas de texto en campos numéricos, objetos vacíos, valores `undefined` fueron interceptados por validaciones defensivas sin provocar cuelgues del proceso ni excepciones no controladas.
- **Valores fuera de rango:** Intentos de reservar para 0 o más de 12 personas resultan en mensajes claros de error al usuario.
- **Anomalías de fecha:** Fechas pasadas y fechas a más de 30 días fueron rechazadas consistentemente.

### 2.3 Respuesta ante Situaciones Esperadas y No Esperadas
- **Concurrencia y Saturación:** Al alcanzar los 50 lugares ocupados, el sistema muestra disponibilidad 0 y rechaza nuevas peticiones de reserva en ese turno mientras mantiene habilitado el otro turno u otras fechas.
- **Rechazo de cancelación tardía:** Los intentos de cancelación con menos de 24 horas antes del turno son denegados protegiendo la recaudación de señas del resto-bar.

---

## 3. Conclusión de Validación

### ¿El sistema desarrollado satisface las necesidades planteadas al comienzo del proyecto?

**Respuesta: SÍ, categóricamente.**

**Justificación:**
1. **Eliminación del Overbooking:** La gestión de capacidad por turno garantiza que nunca se exceda el aforo máximo de 50 personas.
2. **Automatización de Señas:** El cálculo parametrizado por persona (\$2.000), grupo (+10%) y fin de semana (+15%) elimina la discrecionalidad y errores manuales de cotización.
3. **Control Operativo:** Tanto el personal administrativo como el comensal cuentan con reglas transparentes de confirmación y cancelación protegidas por un margen de 24 horas.
4. **Trazabilidad de Calidad:** Los 25 casos de prueba ejecutados automatizadamente otorgan un 100% de confiabilidad funcional sobre los requisitos comprometidos.
