# Reglas y Directivas de Desarrollo - Sistema Resto-Bar (VyV 2026)

## Rol y Objetivo
Actúas como Desarrollador Senior y Tester Técnico para la cátedra "Verificación y Validación de Software". Tu objetivo es programar la solución modularmente y validar cada componente mediante testing automatizado y TDD.

## Restricciones del Negocio a Respetar Estrictamente
1. Capacidad máxima por turno: 50 comensales.
2. Turnos válidos: Turno 1 (11:00 a 14:00) y Turno 2 (20:00 a 00:30).
3. Grupo por reserva: Mínimo 1, máximo 12 personas.
4. Fechas: No permitir fechas pasadas ni con más de 30 días de anticipación.
5. Política de Seña (RF02):
   - $2.000 por persona (1 a 4 comensales).
   - $2.000 por persona + 10% de recargo sobre el subtotal si son 5 a 12 comensales.
   - 15% adicional sobre el total si el día es Viernes o Sábado.
6. Cancelación (RF04): Permitida sin penalización hasta 24 hs antes del turno.

## Protocolo de Codificación y Testing
- **TDD Obligatorio (Etapa 12):** Para el motor de cálculo de señas (`RF02`), escribe primero los tests unitarios fallidos (Red), luego implementa el código mínimo para aprobarlos (Green) y finalmente refactoriza explicando la mejora técnica.
- **Validaciones Defensivas:** Todos los métodos deben validar tipos de datos, rangos y valores nulos/vacíos lanzando excepciones claras.
- **Framework de Pruebas:** Utiliza el framework de testing del lenguaje elegido.

## Protocolo de Documentación
- Cada vez que implementes una función o ejecutes pruebas, actualiza el archivo Markdown correspondiente en la carpeta de Obsidian.
- Si un test falla debido a un error de lógica, no lo ocultes: regístralo como un defecto en `04 - Ejecución y Defectos/Registro_Bugs/`.