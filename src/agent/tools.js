/**
 * Declaraciones de herramientas (Function Calling) para Google Gen AI SDK (@google/genai)
 * Mapean los endpoints esenciales del sistema de gestión de turnos/reservas.
 */

export const bookingToolDeclarations = [
  {
    name: 'consultar_disponibilidad',
    description: 'Consulta los slots o rangos horarios libres de un profesional para una fecha y servicio específico.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        fecha: {
          type: 'string',
          description: 'Fecha a consultar en formato ISO YYYY-MM-DD (ej: 2026-10-25)',
        },
        profesional_id: {
          type: 'string',
          description: 'Identificador único del profesional (ej: prof_101, dr_martinez)',
        },
        servicio_id: {
          type: 'string',
          description: 'Identificador del tipo de servicio o consulta (ej: consulta_gral, limpieza_dental)',
        },
      },
      required: ['fecha', 'profesional_id', 'servicio_id'],
    },
  },
  {
    name: 'reservar_turno',
    description: 'Intenta crear y confirmar una reserva de turno para un cliente en un horario y fecha específicos.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        fecha: {
          type: 'string',
          description: 'Fecha del turno en formato YYYY-MM-DD',
        },
        hora: {
          type: 'string',
          description: 'Hora del turno en formato HH:mm (ej: 09:00, 10:30)',
        },
        cliente: {
          type: 'object',
          description: 'Datos del cliente que solicita el turno',
          properties: {
            nombre: { type: 'string', description: 'Nombre completo del cliente' },
            email: { type: 'string', description: 'Correo electrónico de contacto' },
            telefono: { type: 'string', description: 'Teléfono de contacto' },
          },
          required: ['nombre'],
        },
        profesional_id: {
          type: 'string',
          description: 'Identificador del profesional asignado',
        },
        servicio_id: {
          type: 'string',
          description: 'Identificador del servicio solicitado',
        },
      },
      required: ['fecha', 'hora', 'cliente', 'profesional_id', 'servicio_id'],
    },
  },
  {
    name: 'reprogramar_turno',
    description: 'Cambia la fecha y/o hora de un turno existente hacia un nuevo slot.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        turno_id: {
          type: 'string',
          description: 'Identificador único del turno a reprogramar (ej: t_1001)',
        },
        nueva_fecha: {
          type: 'string',
          description: 'Nueva fecha deseada en formato YYYY-MM-DD',
        },
        nueva_hora: {
          type: 'string',
          description: 'Nueva hora deseada en formato HH:mm',
        },
      },
      required: ['turno_id', 'nueva_fecha', 'nueva_hora'],
    },
  },
  {
    name: 'cancelar_turno',
    description: 'Da de baja un turno existente y libera el cupo o slot correspondiente en la agenda.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        turno_id: {
          type: 'string',
          description: 'Identificador único del turno que se desea cancelar',
        },
        motivo: {
          type: 'string',
          description: 'Motivo o justificación de la cancelación',
        },
      },
      required: ['turno_id', 'motivo'],
    },
  },
  {
    name: 'obtener_agenda_diaria',
    description: 'Consulta el cronograma consolidado de todos los turnos del día para un profesional (estados, slots ocupados y clientes).',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        fecha: {
          type: 'string',
          description: 'Fecha de la agenda en formato YYYY-MM-DD',
        },
        profesional_id: {
          type: 'string',
          description: 'Identificador del profesional a consultar',
        },
      },
      required: ['fecha', 'profesional_id'],
    },
  },
  {
    name: 'cierre_jornada',
    description: 'Simula el cierre contable/operativo del día para auditar el balance de turnos (atendidos, ausentes, cancelados, pendientes).',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        fecha: {
          type: 'string',
          description: 'Fecha de la jornada a cerrar en formato YYYY-MM-DD',
        },
      },
      required: ['fecha'],
    },
  },
];
