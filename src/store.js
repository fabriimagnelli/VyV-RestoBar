// store.js - Sistema Centralizado y Reactivo de Reservas y Gestión de Salón
// Persistencia local transparente en localStorage

const STORAGE_KEY = 'resto_cafe_boite_data_v1';

const DEFAULT_SETTINGS = {
  restaurantName: 'Café & Bistro La Boîte',
  restaurantTagline: 'Maison de Café & Cuisine de Terroir',
  address: 'Boulevard Saint-Germain 142',
  whatsappNumber: '5491145678900',
  toleranceMarginMinutes: 15,
  stayDurationMinutes: 90,
  shifts: {
    desayuno: {
      id: 'desayuno',
      name: 'Desayuno',
      hours: '08:00 - 11:30',
      slots: ['08:30', '09:15', '10:00', '10:45']
    },
    almuerzo: {
      id: 'almuerzo',
      name: 'Almuerzo',
      hours: '12:00 - 16:00',
      slots: ['12:30', '13:15', '14:00', '14:45', '15:15']
    },
    merienda: {
      id: 'merienda',
      name: 'Merienda',
      hours: '16:30 - 19:30',
      slots: ['16:45', '17:30', '18:15', '19:00']
    },
    cena: {
      id: 'cena',
      name: 'Cena',
      hours: '20:00 - 00:00',
      slots: ['20:15', '21:00', '21:45', '22:30', '23:15']
    }
  }
};

const DEFAULT_TABLES = [
  // Sector: Salón Principal
  { id: 't-01', number: 'M-01', name: 'Mesa 01 Alcôve', sector: 'salon', capacity: 2, minGuests: 1, active: true, status: 'ocupada', currentGuest: 'Fam. Rossi (2p)' },
  { id: 't-02', number: 'M-02', name: 'Mesa 02 Ventanal', sector: 'salon', capacity: 2, minGuests: 1, active: true, status: 'libre', currentGuest: null },
  { id: 't-03', number: 'M-03', name: 'Mesa 03 Salón Central', sector: 'salon', capacity: 4, minGuests: 2, active: true, status: 'reservada', currentGuest: 'Lucas Dupont (4p)' },
  { id: 't-04', number: 'M-04', name: 'Mesa 04 Espejo Dorado', sector: 'salon', capacity: 4, minGuests: 2, active: true, status: 'libre', currentGuest: null },
  { id: 't-05', number: 'M-05', name: 'Mesa 05 Banqueta Larga', sector: 'salon', capacity: 6, minGuests: 4, active: true, status: 'ocupada', currentGuest: 'Mesa Amigos (5p)' },
  { id: 't-06', number: 'M-06', name: 'Mesa 06 Mesa Redonda VIP', sector: 'salon', capacity: 8, minGuests: 5, active: true, status: 'libre', currentGuest: null },

  // Sector: Terraza d'Hiver / Exterior
  { id: 't-07', number: 'T-07', name: 'Terraza Jardín 01', sector: 'terraza', capacity: 2, minGuests: 1, active: true, status: 'libre', currentGuest: null },
  { id: 't-08', number: 'T-08', name: 'Terraza Pergola 02', sector: 'terraza', capacity: 4, minGuests: 2, active: true, status: 'ocupada', currentGuest: 'Dra. Méndez (3p)' },
  { id: 't-09', number: 'T-09', name: 'Terraza Rincón 03', sector: 'terraza', capacity: 4, minGuests: 2, active: true, status: 'reservada', currentGuest: 'Clara Varela (4p)' },
  { id: 't-10', number: 'T-10', name: 'Terraza Imperial 04', sector: 'terraza', capacity: 6, minGuests: 4, active: true, status: 'libre', currentGuest: null },

  // Sector: Comptoir Zinc / Barra
  { id: 't-11', number: 'B-11', name: 'Barra Espresso A', sector: 'barra', capacity: 2, minGuests: 1, active: true, status: 'ocupada', currentGuest: 'Gastón (1p)' },
  { id: 't-12', number: 'B-12', name: 'Barra Espresso B', sector: 'barra', capacity: 2, minGuests: 1, active: true, status: 'libre', currentGuest: null },
  { id: 't-13', number: 'B-13', name: 'Barra Bistro C', sector: 'barra', capacity: 2, minGuests: 1, active: true, status: 'libre', currentGuest: null }
];

// Helper fecha ISO hoy (YYYY-MM-DD)
function getTodayIso() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_RESERVATIONS = [
  {
    id: 'res-101',
    code: 'LB-8492',
    fullName: 'Lucas Dupont',
    phone: '+5491155443322',
    guests: 4,
    date: getTodayIso(),
    shift: 'almuerzo',
    slot: '13:15',
    sector: 'salon',
    tableId: 't-03',
    tableNumber: 'M-03',
    notes: 'Aniversario de casados. Si es posible mesa tranquila.',
    status: 'confirmada', // 'confirmada' | 'check_in' | 'cancelada' | 'no_show'
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'res-102',
    code: 'LB-9120',
    fullName: 'Clara Varela',
    phone: '+5491144889900',
    guests: 4,
    date: getTodayIso(),
    shift: 'almuerzo',
    slot: '14:00',
    sector: 'terraza',
    tableId: 't-09',
    tableNumber: 'T-09',
    notes: 'Asistiremos con un carrito de bebé.',
    status: 'confirmada',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'res-103',
    code: 'LB-3351',
    fullName: 'Fam. Rossi',
    phone: '+5491166778899',
    guests: 2,
    date: getTodayIso(),
    shift: 'almuerzo',
    slot: '12:30',
    sector: 'salon',
    tableId: 't-01',
    tableNumber: 'M-01',
    notes: '',
    status: 'check_in',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'res-104',
    code: 'LB-7740',
    fullName: 'Dra. Méndez',
    phone: '+5491133221100',
    guests: 3,
    date: getTodayIso(),
    shift: 'almuerzo',
    slot: '12:30',
    sector: 'terraza',
    tableId: 't-08',
    tableNumber: 'T-08',
    notes: 'Almuerzo de trabajo.',
    status: 'check_in',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'res-105',
    code: 'LB-1289',
    fullName: 'Martín Benítez',
    phone: '+5491199887766',
    guests: 2,
    date: getTodayIso(),
    shift: 'desayuno',
    slot: '09:15',
    sector: 'barra',
    tableId: 't-11',
    tableNumber: 'B-11',
    notes: '',
    status: 'check_in',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'res-106',
    code: 'LB-5502',
    fullName: 'Sofía Navarro',
    phone: '+5491122334455',
    guests: 2,
    date: getTodayIso(),
    shift: 'desayuno',
    slot: '10:00',
    sector: 'salon',
    tableId: 't-02',
    tableNumber: 'M-02',
    notes: 'Canceló por aviso telefónico.',
    status: 'cancelada',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString()
  }
];

class RestaurantStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.tables && parsed.reservations) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading state from localStorage:', e);
    }

    const initialState = {
      settings: DEFAULT_SETTINGS,
      tables: DEFAULT_TABLES,
      reservations: DEFAULT_RESERVATIONS
    };
    this.persist(initialState);
    return initialState;
  }

  persist(state = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.persist();
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Error in listener:', e);
      }
    }
  }

  // --- MOTOR DE DISPONIBILIDAD Y PREVENCIÓN DE SOBRETURNOS (OVERBOOKING) ---
  getAvailability({ date, shift, slot, guests, sector }) {
    const numGuests = parseInt(guests, 10) || 1;
    
    // Mesas activas que coinciden con el sector (o todas si sector es 'todos')
    const candidateTables = this.state.tables.filter(t => {
      if (!t.active) return false;
      if (sector && sector !== 'todos' && t.sector !== sector) return false;
      return t.capacity >= numGuests;
    });

    // Reservas activas para esa fecha y horario exacto (excluyendo canceladas)
    const activeReservations = this.state.reservations.filter(r => 
      r.date === date &&
      r.slot === slot &&
      r.status !== 'cancelada'
    );

    const reservedTableIds = new Set(activeReservations.map(r => r.tableId).filter(Boolean));

    // Mesas libres para este slot
    const freeTables = candidateTables.filter(t => !reservedTableIds.has(t.id));

    return {
      totalFitTables: candidateTables.length,
      availableTables: freeTables,
      availableCount: freeTables.length,
      isAvailable: freeTables.length > 0,
      occupiedCount: candidateTables.length - freeTables.length
    };
  }

  // Comprueba la disponibilidad de todos los slots para un turno, fecha y comensales
  getSlotsStatus({ date, shift, guests, sector }) {
    const shiftData = this.state.settings.shifts[shift];
    if (!shiftData) return [];

    return shiftData.slots.map(slot => {
      const avail = this.getAvailability({ date, shift, slot, guests, sector });
      return {
        slot,
        availableCount: avail.availableCount,
        isAvailable: avail.isAvailable,
        totalFitTables: avail.totalFitTables
      };
    });
  }

  // --- CREACIÓN DE RESERVAS CON ASIGNACIÓN INTELIGENTE ---
  createReservation({ fullName, phone, guests, date, shift, slot, sector, notes, preferredTableId = null }) {
    const avail = this.getAvailability({ date, shift, slot, guests, sector });
    
    if (!avail.isAvailable) {
      throw new Error('No hay disponibilidad en este horario para la cantidad de personas seleccionada.');
    }

    // Si el usuario eligió una mesa preferida y está libre, la asignamos; de lo contrario, elegimos la más ajustada a la capacidad
    let assignedTable = null;
    if (preferredTableId) {
      assignedTable = avail.availableTables.find(t => t.id === preferredTableId);
    }
    if (!assignedTable) {
      // Ordenar por capacidad ascendente para no desperdiciar mesas grandes en grupos chicos
      const sorted = [...avail.availableTables].sort((a, b) => a.capacity - b.capacity);
      assignedTable = sorted[0];
    }

    const code = 'LB-' + Math.floor(1000 + Math.random() * 9000);
    const newReservation = {
      id: 'res-' + Date.now(),
      code,
      fullName: fullName.trim(),
      phone: phone.trim(),
      guests: parseInt(guests, 10),
      date,
      shift,
      slot,
      sector: assignedTable ? assignedTable.sector : sector,
      tableId: assignedTable ? assignedTable.id : null,
      tableNumber: assignedTable ? assignedTable.number : 'Sin Asignar',
      notes: (notes || '').trim(),
      status: 'confirmada',
      createdAt: new Date().toISOString()
    };

    this.state.reservations.unshift(newReservation);

    // Si la reserva es para hoy, actualizar el estado visual de la mesa
    if (date === getTodayIso() && assignedTable) {
      assignedTable.status = 'reservada';
      assignedTable.currentGuest = `${newReservation.fullName} (${newReservation.guests}p)`;
    }

    this.notify();
    return newReservation;
  }

  // --- CONTROL DE RESERVAS POR STAFF ---
  updateReservationStatus(reservationId, newStatus) {
    const res = this.state.reservations.find(r => r.id === reservationId);
    if (!res) return false;

    res.status = newStatus;
    const table = this.state.tables.find(t => t.id === res.tableId);

    if (table) {
      if (newStatus === 'check_in') {
        table.status = 'ocupada';
        table.currentGuest = `${res.fullName} (${res.guests}p)`;
      } else if (newStatus === 'cancelada' || newStatus === 'no_show') {
        table.status = 'libre';
        table.currentGuest = null;
      } else if (newStatus === 'confirmada') {
        table.status = 'reservada';
        table.currentGuest = `${res.fullName} (${res.guests}p)`;
      }
    }

    this.notify();
    return true;
  }

  // Asignar o reasignar mesa a una reserva existente
  reassignTable(reservationId, newTableId) {
    const res = this.state.reservations.find(r => r.id === reservationId);
    const newTable = this.state.tables.find(t => t.id === newTableId);
    if (!res || !newTable) return false;

    // Liberar mesa vieja si era de hoy
    const oldTable = this.state.tables.find(t => t.id === res.tableId);
    if (oldTable && res.date === getTodayIso()) {
      oldTable.status = 'libre';
      oldTable.currentGuest = null;
    }

    res.tableId = newTable.id;
    res.tableNumber = newTable.number;
    res.sector = newTable.sector;

    if (res.date === getTodayIso()) {
      newTable.status = res.status === 'check_in' ? 'ocupada' : 'reservada';
      newTable.currentGuest = `${res.fullName} (${res.guests}p)`;
    }

    this.notify();
    return true;
  }

  // --- GESTIÓN DIRECTA DE MESAS (HOST / STAFF) ---
  setTableStatus(tableId, newStatus, guestName = null) {
    const table = this.state.tables.find(t => t.id === tableId);
    if (!table) return false;

    table.status = newStatus;
    if (newStatus === 'libre') {
      table.currentGuest = null;
    } else if (guestName) {
      table.currentGuest = guestName;
    }

    this.notify();
    return true;
  }

  addTable({ number, name, sector, capacity, minGuests = 1 }) {
    const id = 't-' + Date.now();
    const newTable = {
      id,
      number: number.trim(),
      name: (name || number).trim(),
      sector,
      capacity: parseInt(capacity, 10),
      minGuests: parseInt(minGuests, 10) || 1,
      active: true,
      status: 'libre',
      currentGuest: null
    };

    this.state.tables.push(newTable);
    this.notify();
    return newTable;
  }

  updateTable(tableId, updates) {
    const table = this.state.tables.find(t => t.id === tableId);
    if (!table) return false;

    if (updates.number) table.number = updates.number.trim();
    if (updates.name) table.name = updates.name.trim();
    if (updates.sector) table.sector = updates.sector;
    if (updates.capacity !== undefined) table.capacity = parseInt(updates.capacity, 10);
    if (updates.minGuests !== undefined) table.minGuests = parseInt(updates.minGuests, 10);
    if (updates.active !== undefined) table.active = Boolean(updates.active);

    this.notify();
    return true;
  }

  toggleTableActive(tableId) {
    const table = this.state.tables.find(t => t.id === tableId);
    if (!table) return false;
    table.active = !table.active;
    this.notify();
    return table.active;
  }

  deleteTable(tableId) {
    const index = this.state.tables.findIndex(t => t.id === tableId);
    if (index === -1) return false;
    this.state.tables.splice(index, 1);
    this.notify();
    return true;
  }

  // --- CONFIGURACIÓN DEL LOCAL ---
  updateSettings(newSettings) {
    this.state.settings = {
      ...this.state.settings,
      ...newSettings
    };
    this.notify();
  }

  resetAll() {
    this.state = {
      settings: DEFAULT_SETTINGS,
      tables: DEFAULT_TABLES,
      reservations: DEFAULT_RESERVATIONS
    };
    this.persist();
    this.notify();
  }
}

export const store = new RestaurantStore();
export { getTodayIso };
