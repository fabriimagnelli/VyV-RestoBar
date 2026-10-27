# Etapa 9: Pruebas de Integración

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Tester Técnico:** Fabrizio Magnelli  
**Fecha:** 27 de Octubre de 2026  
**Herramienta:** `node:test` y `node:assert/strict`  

---

## 1. Alcance de las Pruebas de Integración

El objetivo de las pruebas de integración es verificar que los módulos desacoplados del sistema interactúan y coordinan sus datos correctamente en conjunto.

En el sistema Resto-Bar, se evaluó la integración entre:
1. **Módulo de Reservas (`ReservationService`)**
2. **Motor de Cálculo de Seña (`feeCalculator`)**
3. **Módulo de Control de Aforo y Disponibilidad**

Archivo de pruebas: [`tests/reservationService.test.js`](file:///c:/Users/Fabri/OneDrive/Desktop/VyV-RestoBar/tests/reservationService.test.js).

---

## 2. Flujo Integrado Evaluado: Ciclo Completo de una Reserva

El caso de integración principal verifica la siguiente secuencia de colaboración entre componentes:

```
[ Cliente ingresa datos ] 
          │
          ▼
1. ReservationService.createReservation()
          │
          ├──> Invoca feeCalculator.calculateDepositFee()
          │         └──> Retorna desglose exacto de seña ($8.000)
          │
          ├──> Invoca ReservationService.getAvailability()
          │         └──> Descuenta cupo temporal (de 50 a 46 disponibles)
          │
          └──> Genera reserva en estado 'pendiente' con código 'RES-XXXX'
          │
          ▼
2. ReservationService.confirmReservation(code, 8000)
          │
          └──> Valida importe, actualiza estado a 'confirmada' y sella 'paidAt'
          │
          ▼
3. ReservationService.cancelReservation(code, timestamp)
          │
          └──> Valida margen de 24 hs, pasa a 'cancelada' y devuelve los 4 cupos al turno
```

---

## 3. Resultados de los Casos de Integración

1. **Integración Creación $\rightarrow$ Cálculo de Seña:**
   - Se comprobó que `createReservation` transporta los comensales y la fecha a `calculateDepositFee`, inyectando el objeto `depositDetails` y el monto total en la entidad persistida.
   - *Resultado:* **Aprobado**.
2. **Integración Reserva $\rightarrow$ Capacidad:**
   - Tras registrar 4 reservas de 12 personas, la disponibilidad residual disminuyó exactamente a 2 comensales. Al intentar reservar 4 adicionales, el subsistema de cupos detuvo la creación de la reserva.
   - *Resultado:* **Aprobado**.
3. **Integración Cancelación $\rightarrow$ Liberación de Cupo:**
   - La cancelación exitosa realizada con antelación mayor a 24 horas restauró de inmediato la disponibilidad del turno a 50 lugares libres.
   - *Resultado:* **Aprobado**.

---

## 4. Evidencia Técnica

Los 9 tests de integración y ciclo de vida de servicio finalizaron con estado exitoso (0 fallos) en **10.58 ms**.
