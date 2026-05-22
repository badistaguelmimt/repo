import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configure moment en français
moment.locale('fr');
const localizer = momentLocalizer(moment);

/**
 * AvailabilityCalendar
 *
 * Affiche les disponibilités d'un prestataire.
 * - Créneaux verts = disponible
 * - Créneaux rouges = indisponible
 *
 * Props :
 *   disponibilites   {Array}    — données DB
 *   onSlotClick      {Function} — callback sur clic plage vide (mode édition)
 *   onEventClick     {Function} — callback sur clic événement (mode édition)
 *   readOnly         {boolean}  — si true, désactive sélection et masque le hint "cliquer pour ajouter"
 */
const AvailabilityCalendar = ({ disponibilites = [], onSlotClick, onEventClick, readOnly = false }) => {
  const [view, setView]   = useState('month');
  const [date, setDate]   = useState(new Date());

  // Normalise la valeur Disponibilite (peut être 0/1 depuis MySQL ou true/false)
  const isAvailable = (val) => val === true || val === 1 || val === '1';

  // Transformer les disponibilités en événements calendrier
  const events = useMemo(() =>
    disponibilites
      .filter(d => d.DateDebut)
      .map((dispo) => ({
        id:    dispo.Id,
        title: isAvailable(dispo.Disponibilite) ? 'Disponible' : 'Indisponible',
        start: new Date(dispo.DateDebut),
        end:   dispo.DateFin ? new Date(dispo.DateFin) : moment(dispo.DateDebut).add(1, 'hour').toDate(),
        allDay: false,
        resource: dispo,
      })),
  [disponibilites]);

  // Style couleur dynamique par type
  const eventStyleGetter = (event) => {
    const available = isAvailable(event.resource?.Disponibilite);
    return {
      style: {
        backgroundColor:  available ? '#16a34a' : '#dc2626',
        borderLeft:       `4px solid ${available ? '#15803d' : '#b91c1c'}`,
        borderRadius:     '6px',
        opacity:          0.92,
        color:            'white',
        border:           'none',
        fontWeight:       '700',
        fontSize:         '11px',
        padding:          '2px 8px',
        cursor:           onEventClick && !readOnly ? 'pointer' : 'default',
      },
    };
  };

  const slotPropGetter = () => ({
    style: { cursor: onSlotClick && !readOnly ? 'crosshair' : 'default' },
  });

  // Composant titre d'événement avec icône
  const EventComponent = ({ event }) => {
    const available = isAvailable(event.resource?.Disponibilite);
    return (
      <span className="flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
        <span style={{ fontSize: '10px' }}>{available ? '●' : '○'}</span>
        {event.title}
      </span>
    );
  };

  // Traductions françaises
  const messages = {
    allDay:          'Journée',
    previous:        '‹',
    next:            '›',
    today:           "Aujourd'hui",
    month:           'Mois',
    week:            'Semaine',
    day:             'Jour',
    agenda:          'Agenda',
    date:            'Date',
    time:            'Heure',
    event:           'Créneau',
    noEventsInRange: 'Aucun créneau sur cette période.',
    showMore:        (total) => `+ ${total} autres`,
  };

  // Statistiques rapides
  const nbDispo    = events.filter(e => isAvailable(e.resource?.Disponibilite)).length;
  const nbInDispo  = events.length - nbDispo;

  return (
    <div className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

      {/* En-tête : légende + stats */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b-2 border-black bg-surface-container">
        {/* Légende */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
            <span className="w-3 h-3 rounded-full bg-green-600 border border-black/20 flex-shrink-0" />
            Disponible
            <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-[10px] font-extrabold border border-green-300">
              {nbDispo}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-black/20 flex-shrink-0" />
            Indisponible
            <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-extrabold border border-red-300">
              {nbInDispo}
            </span>
          </span>
        </div>

        {/* Hint mode édition */}
        {!readOnly && onSlotClick && (
          <span className="text-[11px] text-on-surface-variant italic ml-auto hidden sm:inline">
            💡 Cliquez-glissez sur une plage pour ajouter un créneau
          </span>
        )}
      </div>

      {/* Calendrier */}
      <div style={{ height: '560px' }} className="p-3">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          messages={messages}
          eventPropGetter={eventStyleGetter}
          slotPropGetter={slotPropGetter}
          components={{ event: EventComponent }}
          onSelectSlot={!readOnly && onSlotClick ? onSlotClick : undefined}
          onSelectEvent={!readOnly && onEventClick ? onEventClick : undefined}
          selectable={!readOnly && !!onSlotClick}
          popup
          culture="fr"
        />
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
