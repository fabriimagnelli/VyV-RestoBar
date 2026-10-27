# Etapa 14: Revisión de Artefactos No Código

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Auditor QA:** Fabrizio Magnelli  
**Fecha:** 27 de Octubre de 2026  

---

## 1. Artefacto Seleccionado para Revisión

Se seleccionó el **Manual de Usuario y Guía de Operación del Sistema de Reservas** (`MANUAL_USUARIO.md`) y la documentación funcional en `PRODUCT.md` / `DESIGN.md`.

---

## 2. Metodología de Revisión

Se aplicó una revisión formal documental mediante lista de verificación orientada a usabilidad, completitud y consistencia con las reglas de negocio verificadas en el software.

### Lista de Control (Checklist) Documental:
- [x] ¿El manual describe con claridad los dos perfiles de usuario (Cliente y Personal)?
- [x] ¿Se explican los horarios y características de cada turno (Turno 1 y Turno 2)?
- [x] ¿Las políticas de señas y recargos coinciden exactamente con la fórmula implementada en código?
- [x] ¿Se advierte al usuario el plazo límite de 24 horas para cancelación sin costo?
- [x] ¿Los pasos para efectuar el check-in y la confirmación son legibles y reproducibles?

---

## 3. Registro de Problemas Encontrados y Correcciones

### Hallazgo DOC-01: Discrepancia en turnos en maquetas previas
* **Problema:** En borradores preliminares se mencionaban 4 turnos (Desayuno, Almuerzo, Merienda, Cena) heredados de maquetas iniciales, mientras que la regla de negocio de la cátedra de VyV exige estrictamente dos turnos de servicio: Turno 1 (11:00 a 14:00 hs) y Turno 2 (20:00 a 00:30 hs).
* **Severidad:** Media (Riesgo de confusión en la defensa oral).
* **Acción Correctiva:** Se actualizó la especificación operativa alineando la documentación al estándar de los 2 turnos formales con capacidad máxima de 50 personas.

### Hallazgo DOC-02: Omisión del recargo de grupo en el instructivo del cliente
* **Problema:** El borrador explicaba la tarifa base de \$2.000 por persona pero no detallaba de forma explícita que contingentes de 5 a 12 personas abonan un 10% adicional por gestión de grupo numeroso.
* **Acción Correctiva:** Se incorporó una tabla explicativa transparente de políticas de seña tanto en el manual como en los casos de prueba de aceptación.

---

## 4. Conclusión

La documentación y artefactos no código han sido armonizados al 100% con el software desarrollado y verificado, garantizando consistencia absoluta entre lo que el usuario lee y lo que el sistema ejecuta.
