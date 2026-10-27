// main.js - Orquestador de la Aplicación y Flujos Cliente / Staff
import { store, getTodayIso } from './store.js';

// --- ESTADO LOCAL DE LA INTERFAZ ---
let currentView = 'client'; // 'client' | 'staff'
let staffTab = 'map'; // 'map' | 'reservations' | 'tables' | 'settings'

// Estado del formulario de reserva del cliente
let bookingState = {
  date: getTodayIso(),
  guests: 2,
  shift: 'almuerzo',
  slot: '13:15',
  sector: 'todos', // 'todos' | 'salon' | 'terraza' | 'barra'
  preferredTableId: null,
  fullName: '',
  phone: '',
  notes: '',
  confirmedReservation: null // objeto con la reserva una vez confirmada
};

// Filtros para la vista Staff
let staffFilters = {
  date: getTodayIso(),
  shift: 'almuerzo',
  sector: 'todos',
  search: '',
  status: 'todas'
};

// Helper SVG Icons limpios
const ICONS = {
  user: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  calendar: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  clock: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  checkCircle: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  whatsapp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.76-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.45.06-.68.32-.23.25-.89.87-.89 2.12s.91 2.46 1.04 2.63c.13.17 1.79 2.74 4.34 3.84.61.26 1.08.42 1.45.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/></svg>`,
  table: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
  mapPin: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  search: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  plus: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  gear: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
};

// Determina el turno actual del reloj
function getCurrentShiftId() {
  const hour = new Date().getHours();
  if (hour >= 8 && hour < 12) return 'desayuno';
  if (hour >= 12 && hour < 16) return 'almuerzo';
  if (hour >= 16 && hour < 20) return 'merienda';
  return 'cena';
}

// Inicializar reloj
function updateLiveClock() {
  const el = document.getElementById('liveClockText');
  if (el) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const shift = getCurrentShiftId();
    el.textContent = `${timeStr} · Turno ${shift.charAt(0).toUpperCase() + shift.slice(1)}`;
  }
}
setInterval(updateLiveClock, 1000);

// --- RENDERIZADO PRINCIPAL ---
function renderApp() {
  const root = document.getElementById('app');
  if (!root) return;

  const state = store.getState();
  const settings = state.settings;

  root.innerHTML = `
    <header class="app-header">
      <div class="brand-wrapper">
        <div class="brand-monogram">
          <svg class="monogram-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" stroke="var(--brass-gold)" stroke-width="1" stroke-dasharray="2 1.5" opacity="0.6"/>
            <circle cx="24" cy="24" r="19.5" stroke="var(--brass-gold)" stroke-width="1.2"/>
            <path d="M19 13C19 13 20 11.5 19.5 9.5M24 13C24 13 25 11.5 24.5 9.5M29 13C29 13 30 11.5 29.5 9.5" stroke="var(--brass-gold)" stroke-width="1" stroke-linecap="round"/>
            <path d="M16 15H32V23C32 27.4 28.4 31 24 31C19.6 31 16 27.4 16 23V15Z" fill="#241f1a" stroke="var(--brass-gold)" stroke-width="1.2"/>
            <path d="M32 17H34C35.6 17 37 18.4 37 20C37 21.6 35.6 23 34 23H32" stroke="var(--brass-gold)" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M14 34H34" stroke="var(--brass-gold)" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="9" cy="24" r="1.2" fill="var(--brass-gold)"/>
            <circle cx="39" cy="24" r="1.2" fill="var(--brass-gold)"/>
          </svg>
        </div>
        <div class="brand-text">
          <h1>${settings.restaurantName}</h1>
          <p>${settings.restaurantTagline}</p>
        </div>
      </div>

      <div class="header-meta">
        <div class="clock-live">
          <div class="pulse-dot"></div>
          <span id="liveClockText">Cargando horario...</span>
        </div>

        <div class="mode-toggle-group">
          <button id="btnModeClient" class="mode-btn ${currentView === 'client' ? 'active' : ''}">
            ${ICONS.user}
            <span>Modo Cliente</span>
          </button>
          <button id="btnModeStaff" class="mode-btn ${currentView === 'staff' ? 'active' : ''}">
            ${ICONS.table}
            <span>Panel Staff (Host)</span>
          </button>
        </div>
      </div>
    </header>

    <main class="main-app-content">
      ${currentView === 'client' ? renderClientView(state) : renderStaffView(state)}
    </main>
  `;

  updateLiveClock();
  attachEvents();
}

// =========================================================================
// VISTA CLIENTE: RESERVAS
// =========================================================================
function renderClientView(state) {
  // Si ya se confirmó la reserva, mostramos el comprobante
  if (bookingState.confirmedReservation) {
    return renderConfirmationReceipt(bookingState.confirmedReservation, state.settings);
  }

  const { date, guests, shift, slot, sector, preferredTableId } = bookingState;
  const shiftSlots = store.getSlotsStatus({ date, shift, guests, sector });
  
  // Disponibilidad global del slot actualmente elegido
  const currentSlotAvail = store.getAvailability({ date, shift, slot, guests, sector });

  // Lista de mesas para el croquis visual
  const tables = state.tables.filter(t => t.active);

  // Agrupar mesas por sector
  const sectors = [
    { id: 'salon', label: 'Salón Principal', desc: 'Ambiente clásico, lámparas de bronce y banquetas' },
    { id: 'terraza', label: "Terraza d'Hiver", desc: 'Exterior semicubierto con pérgola y vegetación' },
    { id: 'barra', label: 'Comptoir Zinc & Barra', desc: 'Mesas altas junto al barista y coctelería' }
  ];

  return `
    <div class="client-cockpit">
      <!-- Columna Izquierda: El Libro Mayor de Reservas -->
      <section class="ledger-card">
        <div class="stamp-badge">
          ${ICONS.check}
          <span>Reserva Inmediata</span>
        </div>

        <h2 class="section-title-display">Reserva de Mesa</h2>
        <p class="section-quote">"Elija su turno y disfrute de la cocina de estación sin demoras ni llamadas."</p>

        <form id="bookingForm" class="booking-form" onsubmit="return false;">
          <!-- 1. Fecha y Comensales -->
          <div class="field-group">
            <label class="field-label" for="bookingDateInput">
              <span>1. Fecha del Servicio</span>
              <span class="note">Disponibilidad en vivo</span>
            </label>
            <div class="date-selector-row">
              <input type="date" id="bookingDateInput" class="date-input-custom" value="${date}" min="${getTodayIso()}">
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">
              <span>2. Cantidad de Personas</span>
              <span class="note">${guests} comensal${guests > 1 ? 'es' : ''}</span>
            </label>
            <div class="guest-pills-grid">
              ${[1, 2, 3, 4, 5, 6, 8].map(n => `
                <button type="button" class="guest-btn ${guests === n ? 'active' : ''}" data-guests="${n}">
                  ${n === 8 ? '8+ pers' : `${n} p`}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 2. Turno y Franja Horaria (Slots) -->
          <div class="field-group">
            <label class="field-label">
              <span>3. Turno & Franja Horaria</span>
              <span class="note">Slots de 60-90 min</span>
            </label>
            
            <div class="shift-tabs">
              ${Object.values(state.settings.shifts).map(s => `
                <button type="button" class="shift-tab ${shift === s.id ? 'active' : ''}" data-shift="${s.id}">
                  ${s.name}
                </button>
              `).join('')}
            </div>

            <div class="slots-container" style="margin-top: 10px;">
              ${shiftSlots.map(s => {
                const isSelected = slot === s.slot;
                const isDisabled = !s.isAvailable;
                let statusText = `${s.availableCount} mesa${s.availableCount === 1 ? '' : 's'}`;
                let statusClass = 'status-avail';

                if (isDisabled) {
                  statusText = 'Agotado';
                  statusClass = '';
                } else if (s.availableCount === 1) {
                  statusText = 'Última mesa';
                  statusClass = 'status-low';
                }

                return `
                  <div class="slot-card ${isSelected ? 'active' : ''} ${isDisabled ? 'disabled' : ''}" data-slot="${s.slot}">
                    <span class="slot-time">${s.slot}</span>
                    <span class="slot-status-text ${statusClass}">${statusText}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 3. Sector Preferido -->
          <div class="field-group">
            <label class="field-label">
              <span>4. Sector Preferido</span>
              <span class="note">${sector === 'todos' ? 'Cualquier Sector' : sector.toUpperCase()}</span>
            </label>
            <div class="sector-pills">
              <button type="button" class="sector-pill-btn ${sector === 'todos' ? 'active' : ''}" data-sector="todos">
                <span>Cualquiera</span>
                <span style="font-size: 10px; color: var(--text-muted);">Asignación auto</span>
              </button>
              <button type="button" class="sector-pill-btn ${sector === 'salon' ? 'active' : ''}" data-sector="salon">
                <span>Salón</span>
                <span style="font-size: 10px; color: var(--text-muted);">Clásico y cálido</span>
              </button>
              <button type="button" class="sector-pill-btn ${sector === 'terraza' ? 'active' : ''}" data-sector="terraza">
                <span>Terraza</span>
                <span style="font-size: 10px; color: var(--text-muted);">Exterior</span>
              </button>
            </div>
          </div>

          <!-- 4. Datos de Contacto -->
          <div class="field-group" style="border-top: 1px solid var(--border-subtle); padding-top: 18px;">
            <label class="field-label" for="clientNameInput">
              <span>5. Datos del Titular</span>
              <span class="note">Confirmación directa por WhatsApp</span>
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="text" id="clientNameInput" class="input-text" placeholder="Nombre y Apellido *" value="${bookingState.fullName}" required>
              <input type="tel" id="clientPhoneInput" class="input-text" placeholder="Teléfono / WhatsApp *" value="${bookingState.phone}" required>
            </div>
            <textarea id="clientNotesInput" class="input-textarea" placeholder="Notas especiales (cumpleaños, accesibilidad, requerimientos dietarios)...">${bookingState.notes}</textarea>
          </div>

          <!-- Botón de Envío -->
          <button type="button" id="btnSubmitBooking" class="btn-brass-primary" ${!currentSlotAvail.isAvailable ? 'disabled' : ''}>
            ${ICONS.check}
            <span>${currentSlotAvail.isAvailable ? `Confirmar Reserva ${slot} hs` : 'Sin Aforo en este horario'}</span>
          </button>
        </form>
      </section>

      <!-- Columna Derecha: Plano de Salón & Mesas en Mármol -->
      <section class="marble-panel">
        <div class="marble-header">
          <div>
            <h2 class="section-title-display">Plano de Salón & Ocupación</h2>
            <div style="font-family: var(--font-quote); font-style: italic; font-size: 14px; color: var(--text-secondary); margin-top: 2px;">
              Servicio de ${shift.toUpperCase()} · ${tables.filter(t => t.status === 'libre').length} Mesas libres de ${tables.length}
            </div>
          </div>
          <div class="legend-group">
            <div class="legend-item"><span class="status-dot dot-libre"></span>Libre</div>
            <div class="legend-item"><span class="status-dot dot-reservada"></span>Reservada</div>
            <div class="legend-item"><span class="status-dot dot-ocupada"></span>Ocupada</div>
          </div>
        </div>

        <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
          Puede hacer clic sobre una mesa <b>Libre</b> para solicitarla como preferencia de ubicación para su reserva.
        </div>

        ${sectors.map(sec => {
          const secTables = tables.filter(t => t.sector === sec.id);
          if (secTables.length === 0) return '';

          return `
            <div class="sector-block">
              <div class="sector-name-bar">
                <span>${sec.label}</span>
                <span style="font-size: 12px; font-weight: normal; color: var(--text-muted);">${sec.desc}</span>
              </div>
              <div class="tables-row-grid">
                ${secTables.map(t => {
                  const isSelected = preferredTableId === t.id;
                  const canFit = t.capacity >= guests;
                  const isLibre = t.status === 'libre';

                  return `
                    <div class="table-token-card ${isSelected ? 'selected-preferred' : ''} ${!canFit ? 'table-dimmed' : ''}" 
                         data-table-id="${t.id}"
                         title="${isLibre ? 'Haga clic para elegir esta mesa' : 'Mesa ocupada/reservada'}">
                      <div class="table-card-top">
                        <span class="table-number-label">${t.number}</span>
                        <span class="table-capacity-tag">
                          ${ICONS.user}
                          <span>${t.capacity}p</span>
                        </span>
                      </div>

                      <div style="font-size: 11px; color: var(--text-secondary); margin: 6px 0;">
                        ${t.name}
                      </div>

                      <span class="table-pill-state pill-${t.status}">
                        ${isSelected ? 'Tu Selección' : t.status}
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </section>
    </div>
  `;
}

// Pantalla de Confirmación Inmediata con Código y WhatsApp
function renderConfirmationReceipt(res, settings) {
  const whatsappText = encodeURIComponent(
    `¡Hola ${settings.restaurantName}! Quiero confirmar mi reserva:\n` +
    `Código: ${res.code}\n` +
    `Nombre: ${res.fullName}\n` +
    `Fecha: ${res.date}\n` +
    `Turno: ${res.shift.toUpperCase()} (${res.slot} hs)\n` +
    `Personas: ${res.guests}\n` +
    `Mesa: ${res.tableNumber} (${res.sector})\n` +
    (res.notes ? `Notas: ${res.notes}\n` : '') +
    `¡Muchas gracias!`
  );

  const whatsappLink = `https://wa.me/${settings.whatsappNumber}?text=${whatsappText}`;

  return `
    <div class="confirmation-container">
      <div class="confirmation-seal">
        ${ICONS.checkCircle}
      </div>

      <h2 class="section-title-display">¡Reserva Confirmada!</h2>
      <p class="section-quote">"Su mesa ha quedado debidamente reservada en el libro de turno."</p>

      <div class="confirm-code-box">
        <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-secondary);">Código Único de Reserva</span>
        <span class="confirm-code-num">${res.code}</span>
      </div>

      <div class="confirm-details-list">
        <div class="confirm-row">
          <span class="confirm-label">Titular:</span>
          <span class="confirm-val">${res.fullName}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">Fecha & Horario:</span>
          <span class="confirm-val">${res.date} · ${res.slot} hs (${res.shift})</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">Comensales:</span>
          <span class="confirm-val">${res.guests} personas</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">Mesa Asignada:</span>
          <span class="confirm-val">${res.tableNumber} (${res.sector.toUpperCase()})</span>
        </div>
        ${res.notes ? `
          <div class="confirm-row">
            <span class="confirm-label">Notas Especiales:</span>
            <span class="confirm-val" style="font-style: italic;">${res.notes}</span>
          </div>
        ` : ''}
        <div class="confirm-row">
          <span class="confirm-label">Tolerancia de Espera:</span>
          <span class="confirm-val">${settings.toleranceMarginMinutes} minutos</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-direct">
          ${ICONS.whatsapp}
          <span>Enviar Confirmación por WhatsApp al Local</span>
        </a>

        <button type="button" id="btnNewBooking" class="btn-small-action" style="padding: 12px; font-size: 13px;">
          ← Realizar otra reserva
        </button>
      </div>
    </div>
  `;
}

// =========================================================================
// VISTA STAFF / ADMINISTRACIÓN (HOST STAND & SALÓN)
// =========================================================================
function renderStaffView(state) {
  const { tables, reservations, settings } = state;

  // Cálculo de KPIs
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'ocupada').length;
  const reservedTables = tables.filter(t => t.status === 'reservada').length;
  const freeTables = tables.filter(t => t.status === 'libre').length;
  const occupancyPercent = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  // Reservas del día
  const todayReservations = reservations.filter(r => r.date === staffFilters.date);
  const checkInsCount = todayReservations.filter(r => r.status === 'check_in').length;
  const noShowCount = todayReservations.filter(r => r.status === 'no_show').length;

  return `
    <div class="staff-dashboard">
      <!-- 1. Banner de Métricas en Vivo -->
      <div class="metrics-banner">
        <div class="metric-card">
          <div>
            <div class="metric-number">${occupancyPercent}%</div>
            <div class="metric-label">Aforo Ocupado (${occupiedTables}/${totalTables})</div>
          </div>
          <div class="metric-icon-wrap" style="background: var(--wine-burgundy-light); color: var(--wine-burgundy);">
            ${ICONS.table}
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-number">${freeTables}</div>
            <div class="metric-label">Mesas Disponibles</div>
          </div>
          <div class="metric-icon-wrap" style="background: var(--forest-green-light); color: var(--forest-green);">
            ${ICONS.check}
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-number">${checkInsCount}</div>
            <div class="metric-label">Check-ins Realizados Hoy</div>
          </div>
          <div class="metric-icon-wrap" style="background: var(--brass-gold-light); color: var(--brass-gold-hover);">
            ${ICONS.user}
          </div>
        </div>

        <div class="metric-card">
          <div>
            <div class="metric-number">${noShowCount}</div>
            <div class="metric-label">Ausencias (No-Show)</div>
          </div>
          <div class="metric-icon-wrap" style="background: var(--amber-gold-light); color: var(--amber-gold);">
            ${ICONS.clock}
          </div>
        </div>
      </div>

      <!-- 2. Sub-navegación de Administración -->
      <nav class="staff-subnav">
        <button class="subnav-tab ${staffTab === 'map' ? 'active' : ''}" data-staff-tab="map">
          ${ICONS.table}
          <span>Mapa Visual de Mesas</span>
        </button>
        <button class="subnav-tab ${staffTab === 'reservations' ? 'active' : ''}" data-staff-tab="reservations">
          ${ICONS.calendar}
          <span>Control de Reservas (${todayReservations.length})</span>
        </button>
        <button class="subnav-tab ${staffTab === 'tables' ? 'active' : ''}" data-staff-tab="tables">
          ${ICONS.gear}
          <span>Gestión de Mesas (${totalTables})</span>
        </button>
        <button class="subnav-tab ${staffTab === 'settings' ? 'active' : ''}" data-staff-tab="settings">
          ${ICONS.mapPin}
          <span>Configuración Local</span>
        </button>
      </nav>

      <!-- 3. Contenido según Sub-tab -->
      ${renderStaffTabContent(state)}
    </div>
  `;
}

function renderStaffTabContent(state) {
  if (staffTab === 'map') return renderStaffMapTab(state);
  if (staffTab === 'reservations') return renderStaffReservationsTab(state);
  if (staffTab === 'tables') return renderStaffTablesTab(state);
  if (staffTab === 'settings') return renderStaffSettingsTab(state);
  return '';
}

// Sub-Tab 1: Mapa Visual de Mesas con Acciones Rápidas
function renderStaffMapTab(state) {
  const { tables } = state;
  const filteredTables = tables.filter(t => {
    if (staffFilters.sector !== 'todos' && t.sector !== staffFilters.sector) return false;
    return true;
  });

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="staff-filters-bar">
        <div style="display: flex; gap: 10px; align-items: center;">
          <span style="font-size: 13px; font-weight: 700; color: var(--text-secondary);">Filtrar Sector:</span>
          <div class="guest-pills-grid" style="grid-template-columns: repeat(4, auto); gap: 6px;">
            <button class="guest-btn ${staffFilters.sector === 'todos' ? 'active' : ''}" data-staff-sec="todos">Todos</button>
            <button class="guest-btn ${staffFilters.sector === 'salon' ? 'active' : ''}" data-staff-sec="salon">Salón</button>
            <button class="guest-btn ${staffFilters.sector === 'terraza' ? 'active' : ''}" data-staff-sec="terraza">Terraza</button>
            <button class="guest-btn ${staffFilters.sector === 'barra' ? 'active' : ''}" data-staff-sec="barra">Barra</button>
          </div>
        </div>

        <div style="font-size: 13px; color: var(--text-secondary);">
          Cambie el estado de cualquier mesa con un solo clic.
        </div>
      </div>

      <div class="staff-table-grid">
        ${filteredTables.map(t => {
          let borderClass = 'active-free';
          if (t.status === 'ocupada') borderClass = 'active-busy';
          if (t.status === 'reservada') borderClass = 'active-res';

          return `
            <div class="staff-table-card ${borderClass}">
              <div class="staff-card-header">
                <div>
                  <span style="font-family: var(--font-display); font-size: 18px; font-weight: 700;">${t.number}</span>
                  <div style="font-size: 12px; color: var(--text-secondary);">${t.name} · ${t.sector.toUpperCase()}</div>
                </div>
                <span class="table-pill-state pill-${t.status}">${t.status}</span>
              </div>

              <div style="font-size: 13px; color: var(--text-primary); display: flex; justify-content: space-between;">
                <span>Capacidad: <b>${t.capacity} personas</b></span>
                <span>${t.active ? 'Activa' : 'Inactiva'}</span>
              </div>

              <div style="font-size: 12px; color: var(--text-secondary); min-height: 18px;">
                ${t.currentGuest ? `<b>Comensal:</b> ${t.currentGuest}` : 'Sin ocupación actual'}
              </div>

              <div class="action-buttons-row">
                ${t.status !== 'ocupada' ? `
                  <button type="button" class="btn-small-action btn-action-checkin" data-table-action="ocupar" data-table-id="${t.id}">
                    Marcar Ocupada
                  </button>
                ` : ''}

                ${t.status !== 'reservada' ? `
                  <button type="button" class="btn-small-action" data-table-action="reservar" data-table-id="${t.id}">
                    Reservar
                  </button>
                ` : ''}

                ${t.status !== 'libre' ? `
                  <button type="button" class="btn-small-action btn-action-liberar" data-table-action="liberar" data-table-id="${t.id}">
                    Liberar
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Sub-Tab 2: Control de Reservas & Grilla
function renderStaffReservationsTab(state) {
  let list = state.reservations.filter(r => {
    if (staffFilters.date && r.date !== staffFilters.date) return false;
    if (staffFilters.status !== 'todas' && r.status !== staffFilters.status) return false;
    if (staffFilters.search) {
      const q = staffFilters.search.toLowerCase();
      const matchName = r.fullName.toLowerCase().includes(q);
      const matchCode = r.code.toLowerCase().includes(q);
      const matchPhone = r.phone.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchPhone) return false;
    }
    return true;
  });

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="staff-filters-bar">
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Fecha:</label>
            <input type="date" id="staffFilterDate" class="input-text" style="padding: 7px 10px; width: 150px;" value="${staffFilters.date}">
          </div>

          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Estado:</label>
            <select id="staffFilterStatus" class="input-text" style="padding: 7px 10px; width: 140px;">
              <option value="todas" ${staffFilters.status === 'todas' ? 'selected' : ''}>Todas</option>
              <option value="confirmada" ${staffFilters.status === 'confirmada' ? 'selected' : ''}>Confirmadas</option>
              <option value="check_in" ${staffFilters.status === 'check_in' ? 'selected' : ''}>Check-in</option>
              <option value="cancelada" ${staffFilters.status === 'cancelada' ? 'selected' : ''}>Canceladas</option>
              <option value="no_show" ${staffFilters.status === 'no_show' ? 'selected' : ''}>No-show</option>
            </select>
          </div>
        </div>

        <div class="search-input-wrap">
          <span class="search-icon-pos">${ICONS.search}</span>
          <input type="text" id="staffSearchInput" placeholder="Buscar por nombre, código o WhatsApp..." value="${staffFilters.search}">
        </div>
      </div>

      <div class="table-data-wrapper">
        <table class="res-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Titular & Teléfono</th>
              <th>Horario</th>
              <th>Comensales</th>
              <th>Mesa</th>
              <th>Notas</th>
              <th>Estado</th>
              <th>Acciones Host</th>
            </tr>
          </thead>
          <tbody>
            ${list.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">
                  No se encontraron reservas con los filtros seleccionados.
                </td>
              </tr>
            ` : list.map(r => `
              <tr>
                <td><b style="font-family: var(--font-display); letter-spacing: 1px;">${r.code}</b></td>
                <td>
                  <div><b>${r.fullName}</b></div>
                  <div style="font-size: 11px; color: var(--text-secondary);">${r.phone}</div>
                </td>
                <td>
                  <div><b>${r.slot} hs</b></div>
                  <div style="font-size: 11px; color: var(--text-muted);">${r.shift}</div>
                </td>
                <td><b>${r.guests} pers.</b></td>
                <td><b>${r.tableNumber}</b> <span style="font-size: 11px; color: var(--text-muted);">(${r.sector})</span></td>
                <td style="max-width: 180px; font-size: 12px; color: var(--text-secondary);">${r.notes || '-'}</td>
                <td>
                  <span class="table-pill-state pill-${r.status === 'check_in' ? 'ocupada' : (r.status === 'confirmada' ? 'reservada' : 'libre')}">
                    ${r.status}
                  </span>
                </td>
                <td>
                  <div style="display: flex; gap: 4px;">
                    ${r.status === 'confirmada' ? `
                      <button class="btn-small-action btn-action-checkin" data-res-action="check_in" data-res-id="${r.id}" title="Marcar ingreso del comensal">
                        Check-in
                      </button>
                      <button class="btn-small-action btn-action-danger" data-res-action="no_show" data-res-id="${r.id}" title="Marcar inasistencia">
                        No-show
                      </button>
                      <button class="btn-small-action" data-res-action="cancelada" data-res-id="${r.id}" title="Cancelar reserva">
                        Cancelar
                      </button>
                    ` : ''}

                    ${r.status === 'check_in' ? `
                      <button class="btn-small-action btn-action-liberar" data-res-action="liberar" data-res-id="${r.id}" title="Comensal finalizó">
                        Liberar Mesa
                      </button>
                    ` : ''}

                    ${(r.status === 'cancelada' || r.status === 'no_show') ? `
                      <span style="font-size: 11px; color: var(--text-muted); font-style: italic;">Completada</span>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Sub-Tab 3: Gestión de Mesas
function renderStaffTablesTab(state) {
  const { tables } = state;

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="staff-filters-bar">
        <div>
          <h3 style="font-family: var(--font-display); font-size: 17px; font-weight: 700;">Gestión & Capacidad de Mesas</h3>
          <div style="font-size: 12px; color: var(--text-secondary);">Configure capacidad máxima, sector o desactive mesas por mantenimiento.</div>
        </div>

        <button type="button" id="btnOpenNewTableModal" class="btn-small-action btn-action-checkin" style="padding: 10px 16px; font-size: 12px;">
          ${ICONS.plus}
          <span>Agregar Nueva Mesa</span>
        </button>
      </div>

      <div class="table-data-wrapper">
        <table class="res-table">
          <thead>
            <tr>
              <th>Identificador</th>
              <th>Nombre / Ubicación</th>
              <th>Sector</th>
              <th>Capacidad Máx</th>
              <th>Estado Operativo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${tables.map(t => `
              <tr>
                <td><b style="font-family: var(--font-display);">${t.number}</b></td>
                <td>${t.name}</td>
                <td><span style="text-transform: uppercase; font-size: 11px; font-weight: 700;">${t.sector}</span></td>
                <td><b>${t.capacity} comensales</b></td>
                <td>
                  <span class="table-pill-state ${t.active ? 'pill-libre' : 'pill-ocupada'}">
                    ${t.active ? 'Activa / Disponible' : 'Inactiva'}
                  </span>
                </td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn-small-action" data-table-manage="toggle-active" data-table-id="${t.id}">
                      ${t.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button class="btn-small-action btn-action-danger" data-table-manage="delete" data-table-id="${t.id}">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Sub-Tab 4: Configuración del Local
function renderStaffSettingsTab(state) {
  const s = state.settings;

  return `
    <div class="ledger-card" style="max-width: 680px; margin: 0 auto;">
      <h2 class="section-title-display">Configuración del Resto-Café</h2>
      <p class="section-quote">"Ajuste los datos comerciales, tolerancia horaria y parámetros de aforo."</p>

      <form id="settingsForm" class="booking-form" onsubmit="return false;">
        <div class="field-group">
          <label class="field-label" for="settingName">Nombre del Comercio</label>
          <input type="text" id="settingName" class="input-text" value="${s.restaurantName}" required>
        </div>

        <div class="field-group">
          <label class="field-label" for="settingTagline">Lema / Subtítulo</label>
          <input type="text" id="settingTagline" class="input-text" value="${s.restaurantTagline}">
        </div>

        <div class="field-group">
          <label class="field-label" for="settingWhatsapp">Teléfono WhatsApp para Recepción de Reservas</label>
          <input type="tel" id="settingWhatsapp" class="input-text" value="${s.whatsappNumber}" required>
          <span style="font-size: 11px; color: var(--text-muted);">Incluir código de país sin '+' ni espacios (ej: 5491145678900).</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="field-group">
            <label class="field-label" for="settingStay">Duración Estancia (minutos)</label>
            <input type="number" id="settingStay" class="input-text" value="${s.stayDurationMinutes}" min="30" max="240">
          </div>

          <div class="field-group">
            <label class="field-label" for="settingTolerance">Margen de Tolerancia (minutos)</label>
            <input type="number" id="settingTolerance" class="input-text" value="${s.toleranceMarginMinutes}" min="5" max="60">
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 10px;">
          <button type="button" id="btnSaveSettings" class="btn-brass-primary" style="flex: 2;">
            Guardar Configuración
          </button>
          <button type="button" id="btnResetDemoData" class="btn-small-action btn-action-danger" style="flex: 1; padding: 14px;">
            Restablecer Demo
          </button>
        </div>
      </form>
    </div>
  `;
}

// Modal para agregar nueva mesa
function renderNewTableModal() {
  const existing = document.getElementById('newTableModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'newTableModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 style="font-family: var(--font-display); font-size: 18px; font-weight: 700;">Nueva Mesa de Salón</h3>
        <button type="button" class="btn-close-modal" id="btnCloseTableModal">✕</button>
      </div>

      <form id="newTableForm" class="booking-form" onsubmit="return false;">
        <div class="field-group">
          <label class="field-label" for="newTableNumber">Código / Número (ej: M-15)</label>
          <input type="text" id="newTableNumber" class="input-text" placeholder="M-15" required>
        </div>

        <div class="field-group">
          <label class="field-label" for="newTableName">Nombre Descriptivo</label>
          <input type="text" id="newTableName" class="input-text" placeholder="Mesa Rincón Iluminado" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="field-group">
            <label class="field-label" for="newTableSector">Sector</label>
            <select id="newTableSector" class="input-text">
              <option value="salon">Salón Principal</option>
              <option value="terraza">Terraza Exterior</option>
              <option value="barra">Comptoir & Barra</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label" for="newTableCap">Capacidad Máxima</label>
            <input type="number" id="newTableCap" class="input-text" value="4" min="1" max="20" required>
          </div>
        </div>

        <button type="button" id="btnConfirmAddTable" class="btn-brass-primary" style="margin-top: 10px;">
          Crear Mesa y Activar en Salón
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('btnCloseTableModal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  document.getElementById('btnConfirmAddTable').addEventListener('click', () => {
    const num = document.getElementById('newTableNumber').value;
    const name = document.getElementById('newTableName').value;
    const sector = document.getElementById('newTableSector').value;
    const cap = document.getElementById('newTableCap').value;

    if (!num || !name) {
      alert('Por favor complete número y nombre de mesa.');
      return;
    }

    store.addTable({ number: num, name, sector, capacity: cap });
    modal.remove();
  });
}

// =========================================================================
// GESTIÓN DE EVENTOS E INTERACCIÓN
// =========================================================================
function attachEvents() {
  // 1. Selector de Modo Principal (Cliente vs Staff)
  document.getElementById('btnModeClient')?.addEventListener('click', () => {
    currentView = 'client';
    renderApp();
  });

  document.getElementById('btnModeStaff')?.addEventListener('click', () => {
    currentView = 'staff';
    renderApp();
  });

  // 2. Eventos Modo Cliente
  if (currentView === 'client') {
    // Selector de Fecha
    document.getElementById('bookingDateInput')?.addEventListener('change', (e) => {
      bookingState.date = e.target.value;
      renderApp();
    });

    // Selector de Comensales
    document.querySelectorAll('.guest-btn[data-guests]').forEach(btn => {
      btn.addEventListener('click', () => {
        bookingState.guests = parseInt(btn.dataset.guests, 10);
        renderApp();
      });
    });

    // Selector de Turno
    document.querySelectorAll('.shift-tab[data-shift]').forEach(btn => {
      btn.addEventListener('click', () => {
        bookingState.shift = btn.dataset.shift;
        // Seleccionar el primer slot disponible del turno
        const slots = store.getState().settings.shifts[bookingState.shift].slots;
        bookingState.slot = slots[0];
        renderApp();
      });
    });

    // Selector de Franja Horaria (Slots)
    document.querySelectorAll('.slot-card[data-slot]:not(.disabled)').forEach(card => {
      card.addEventListener('click', () => {
        bookingState.slot = card.dataset.slot;
        renderApp();
      });
    });

    // Selector de Sector
    document.querySelectorAll('.sector-pill-btn[data-sector]').forEach(btn => {
      btn.addEventListener('click', () => {
        bookingState.sector = btn.dataset.sector;
        bookingState.preferredTableId = null;
        renderApp();
      });
    });

    // Click en Mesa del Plano para seleccionarla como preferida
    document.querySelectorAll('.table-token-card[data-table-id]').forEach(card => {
      card.addEventListener('click', () => {
        const tableId = card.dataset.tableId;
        const table = store.getState().tables.find(t => t.id === tableId);
        if (table && table.status === 'libre') {
          bookingState.preferredTableId = bookingState.preferredTableId === tableId ? null : tableId;
          renderApp();
        }
      });
    });

    // Input Nombre / Teléfono / Notas
    const nameInput = document.getElementById('clientNameInput');
    if (nameInput) nameInput.addEventListener('input', (e) => bookingState.fullName = e.target.value);

    const phoneInput = document.getElementById('clientPhoneInput');
    if (phoneInput) phoneInput.addEventListener('input', (e) => bookingState.phone = e.target.value);

    const notesInput = document.getElementById('clientNotesInput');
    if (notesInput) notesInput.addEventListener('input', (e) => bookingState.notes = e.target.value);

    // Botón Confirmar Reserva
    document.getElementById('btnSubmitBooking')?.addEventListener('click', () => {
      if (!bookingState.fullName.trim() || !bookingState.phone.trim()) {
        alert('Por favor complete su Nombre y Teléfono (WhatsApp) para confirmar la reserva.');
        return;
      }

      try {
        const newRes = store.createReservation({
          fullName: bookingState.fullName,
          phone: bookingState.phone,
          guests: bookingState.guests,
          date: bookingState.date,
          shift: bookingState.shift,
          slot: bookingState.slot,
          sector: bookingState.sector,
          notes: bookingState.notes,
          preferredTableId: bookingState.preferredTableId
        });

        bookingState.confirmedReservation = newRes;
        renderApp();
      } catch (err) {
        alert(err.message || 'Error al procesar la reserva.');
      }
    });

    // Botón Hacer Otra Reserva
    document.getElementById('btnNewBooking')?.addEventListener('click', () => {
      bookingState.confirmedReservation = null;
      bookingState.preferredTableId = null;
      bookingState.fullName = '';
      bookingState.phone = '';
      bookingState.notes = '';
      renderApp();
    });
  }

  // 3. Eventos Modo Staff
  if (currentView === 'staff') {
    // Pestañas de Navegación Staff
    document.querySelectorAll('.subnav-tab[data-staff-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        staffTab = btn.dataset.staffTab;
        renderApp();
      });
    });

    // Filtros Mapa
    document.querySelectorAll('.guest-btn[data-staff-sec]').forEach(btn => {
      btn.addEventListener('click', () => {
        staffFilters.sector = btn.dataset.staffSec;
        renderApp();
      });
    });

    // Acciones de Mesas en Mapa (Ocupar, Reservar, Liberar)
    document.querySelectorAll('[data-table-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.tableAction;
        const tableId = btn.dataset.tableId;

        if (action === 'ocupar') store.setTableStatus(tableId, 'ocupada', 'Ocupación Directa Host');
        if (action === 'reservar') store.setTableStatus(tableId, 'reservada', 'Reserva en Mostrador');
        if (action === 'liberar') store.setTableStatus(tableId, 'libre');
      });
    });

    // Filtros Reservas
    document.getElementById('staffFilterDate')?.addEventListener('change', (e) => {
      staffFilters.date = e.target.value;
      renderApp();
    });

    document.getElementById('staffFilterStatus')?.addEventListener('change', (e) => {
      staffFilters.status = e.target.value;
      renderApp();
    });

    document.getElementById('staffSearchInput')?.addEventListener('input', (e) => {
      staffFilters.search = e.target.value;
      renderApp();
    });

    // Acciones sobre Reservas (Check-in, No-show, Cancelar, Liberar)
    document.querySelectorAll('[data-res-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.resAction;
        const resId = btn.dataset.resId;

        if (action === 'check_in') store.updateReservationStatus(resId, 'check_in');
        if (action === 'no_show') store.updateReservationStatus(resId, 'no_show');
        if (action === 'cancelada') store.updateReservationStatus(resId, 'cancelada');
        if (action === 'liberar') store.updateReservationStatus(resId, 'no_show'); // libera la mesa
      });
    });

    // Gestión de Mesas (Activar/Desactivar, Eliminar)
    document.querySelectorAll('[data-table-manage]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.tableManage;
        const tableId = btn.dataset.tableId;

        if (action === 'toggle-active') store.toggleTableActive(tableId);
        if (action === 'delete') {
          if (confirm('¿Está seguro de eliminar esta mesa?')) {
            store.deleteTable(tableId);
          }
        }
      });
    });

    // Modal Nueva Mesa
    document.getElementById('btnOpenNewTableModal')?.addEventListener('click', renderNewTableModal);

    // Guardar Configuración
    document.getElementById('btnSaveSettings')?.addEventListener('click', () => {
      const name = document.getElementById('settingName')?.value;
      const tagline = document.getElementById('settingTagline')?.value;
      const whatsapp = document.getElementById('settingWhatsapp')?.value;
      const stay = document.getElementById('settingStay')?.value;
      const tolerance = document.getElementById('settingTolerance')?.value;

      store.updateSettings({
        restaurantName: name,
        restaurantTagline: tagline,
        whatsappNumber: whatsapp,
        stayDurationMinutes: parseInt(stay, 10) || 90,
        toleranceMarginMinutes: parseInt(tolerance, 10) || 15
      });

      alert('Configuración actualizada con éxito.');
    });

    // Resetear Demo
    document.getElementById('btnResetDemoData')?.addEventListener('click', () => {
      if (confirm('¿Desea restablecer todas las mesas y reservas a los datos de prueba iniciales?')) {
        store.resetAll();
        alert('Datos restablecidos.');
      }
    });
  }
}

// Suscripción al store para renderizado reactivo automático
store.subscribe(() => {
  renderApp();
});

// Inicialización inicial
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});

renderApp();
