import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react'
import type { evento } from "../../../types/evento"
import { useAtomValue } from 'jotai'
import { userRolAtom } from '../../store/jotaiStore'

interface Props {
  misEventos: evento[]
  eventosIM: evento[]
}

interface DayInfo {
  day: number
  isCurrentMonth: boolean
  date: Date
}

interface EventoConTipo extends evento {
  tipo: 'mis-inscripciones' | 'eventos-instituto'
  esPasado?: boolean
}

export default function CalendarioEventos({ misEventos, eventosIM }: Props) {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredEvent, setHoveredEvent] = useState<{evento: EventoConTipo, x: number, y: number} | null>(null)
  const rolUsuario = useAtomValue(userRolAtom)

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]

  const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

  const getDaysInMonth = (date: Date): DayInfo[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() // 0 = domingo, 1 = lunes, etc.

    const days: DayInfo[] = []
    
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      })
    }

    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      })
    }

    return days
  }

  const getEventsForDate = (date: Date): EventoConTipo[] => {
    const dateStr = date.toISOString().split('T')[0]
    const ahora = new Date()
    
    const misEventosDelDia = misEventos
      .filter(e => new Date(e.fecha).toISOString().split('T')[0] === dateStr)
      .map(e => ({ 
        ...e, 
        tipo: 'mis-inscripciones' as const,
        esPasado: new Date(e.fecha) < ahora
      }))
    
    const eventosIMDelDia = eventosIM
      .filter(e => new Date(e.fecha).toISOString().split('T')[0] === dateStr)
      .map(e => ({ 
        ...e, 
        tipo: 'eventos-instituto' as const,
        esPasado: new Date(e.fecha) < ahora
      }))
    
    return [...misEventosDelDia, ...eventosIMDelDia]
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const handleEventClick = (event: EventoConTipo) => {
    // Si es secretaria grupal (rol 5), siempre va a modificar evento
    if (rolUsuario === 5) {
      navigate(`/modificar-evento/${event.id_evento}`)
    } else {
      // Para usuarios normales:
      // Si ya está inscrito (evento azul - mis-inscripciones), agregar parámetro inscrito=true
      if (event.tipo === 'mis-inscripciones') {
        navigate(`/eventos/${event.id_evento}?inscrito=true`)
      } else {
        // Si es evento del instituto (rojo), va a la página de inscripción normal
        navigate(`/eventos/${event.id_evento}`)
      }
    }
  }

  const handleEventMouseEnter = (event: EventoConTipo, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredEvent({
      evento: event,
      x: rect.left + rect.width / 2,
      y: rect.top
    })
  }

  const handleEventMouseLeave = () => {
    setHoveredEvent(null)
  }

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha)
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day} de ${month} - ${hours}:${minutes}hs`
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="w-full relative">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header compacto */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-1"
              >
                Hoy
              </button>
            </div>

            <h2 className="text-base font-semibold text-gray-800 capitalize">
              {monthNames[currentDate.getMonth()]} de {currentDate.getFullYear()}
            </h2>

            <div className="w-24"></div>
          </div>
        </div>

        {/* Calendar Grid compacto */}
        <div className="p-3">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {dayNames.map((day, index) => (
              <div
                key={day}
                className={`text-center py-2 text-[10px] font-semibold uppercase tracking-wider ${
                  index === 0 ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days - más compacto */}
          <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {days.map((dayInfo, index) => {
              const events = getEventsForDate(dayInfo.date)
              const isTodayDate = isToday(dayInfo.date)
              const isSunday = index % 7 === 0

              return (
                <div
                  key={index}
                  className={`min-h-20 p-1.5 ${
                    isSunday 
                      ? 'bg-gray-200' 
                      : !dayInfo.isCurrentMonth 
                        ? 'bg-gray-50' 
                        : 'bg-white'
                  }`}
                >
                  <div
                    className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isTodayDate
                        ? 'bg-yellow-100 text-gray-900 font-bold'
                        : dayInfo.isCurrentMonth
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {dayInfo.day}
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5">
                    {events.slice(0, 2).map((event) => (
                      <div
                        key={event.id_evento}
                        onClick={() => handleEventClick(event)}
                        onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                        onMouseLeave={handleEventMouseLeave}
                        className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                          event.esPasado
                            ? 'bg-gray-400 text-white hover:bg-gray-500'
                            : event.tipo === 'mis-inscripciones'
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        <div className="font-medium truncate">{event.nombre}</div>
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-[9px] text-gray-500 text-center">
                        +{events.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tooltip flotante con zoom */}
      {hoveredEvent && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${hoveredEvent.x}px`,
            top: `${hoveredEvent.y - 10}px`,
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-4 max-w-sm animate-in fade-in zoom-in duration-200">
            {/* Flecha del tooltip */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="border-8 border-transparent border-t-white"></div>
            </div>

            {/* Contenido del tooltip */}
            <div className={`inline-block px-3 py-1 rounded-md text-xs font-semibold mb-2 ${
              hoveredEvent.evento.esPasado
                ? 'bg-gray-400 text-white'
                : hoveredEvent.evento.tipo === 'mis-inscripciones'
                ? 'bg-blue-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {hoveredEvent.evento.esPasado 
                ? 'Evento Transcurrido' 
                : hoveredEvent.evento.tipo === 'mis-inscripciones' 
                ? 'Mi Inscripción' 
                : 'Evento del Instituto'}
            </div>

            <h3 className="font-bold text-gray-900 text-base mb-2">
              {hoveredEvent.evento.nombre}
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>{formatFecha(hoveredEvent.evento.fecha.toString())}</span>
              </div>

              {hoveredEvent.evento.lugar && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>{hoveredEvent.evento.lugar}</span>
                </div>
              )}

              {hoveredEvent.evento.descripcion && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {hoveredEvent.evento.descripcion}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-400 italic">
              Clic para ver más detalles
            </div>
          </div>
        </div>
      )}
    </div>
  )
}