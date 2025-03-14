import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Event } from '@shared/schema';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarEventProps {
  event: Event;
}

function CalendarEvent({ event }: CalendarEventProps) {
  let dotColor = "bg-primary-500";

  switch (event.type) {
    case 'marketing':
      dotColor = "bg-primary-500";
      break;
    case 'sale':
      dotColor = "bg-secondary-500";
      break;
    case 'email':
      dotColor = "bg-accent-500";
      break;
    default:
      dotColor = "bg-gray-500";
  }

  return (
    <div className="flex items-center p-2 rounded-md hover:bg-gray-50">
      <div className={`w-2 h-2 rounded-full ${dotColor} mr-3`}></div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{event.title}</p>
        <p className="text-xs text-gray-500">
          {format(new Date(event.date), 'MMM d, h:mm a')}
        </p>
      </div>
      <button className="text-gray-400 hover:text-gray-600">
        <i className="ri-more-2-fill"></i>
      </button>
    </div>
  );
}

export default function CalendarEvents() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch('/api/events?userId=1');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      return response.json();
    }
  });

  // Calendar generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add days from previous month to fill the first row
  const startDayOfWeek = monthStart.getDay();
  const prevMonthDays = Array.from({ length: startDayOfWeek }, (_, i) => {
    const day = new Date(monthStart);
    day.setDate(day.getDate() - (startDayOfWeek - i));
    return day;
  });
  
  // Add days from next month to fill the last row
  const endDayOfWeek = monthEnd.getDay();
  const nextMonthDays = Array.from({ length: 6 - endDayOfWeek }, (_, i) => {
    const day = new Date(monthEnd);
    day.setDate(day.getDate() + i + 1);
    return day;
  });
  
  // Combine all days
  const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];
  
  // Group into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }
  
  // Filter events for this month
  const upcomingEvents = events?.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= new Date();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
  
  // Navigation functions
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };
  
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Calendar Events</h2>
          <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View Calendar
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            className="text-gray-600 hover:text-gray-900"
            onClick={prevMonth}
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>
          <h3 className="text-base font-medium text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button 
            className="text-gray-600 hover:text-gray-900"
            onClick={nextMonth}
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs">
          {weeks.flat().map((day, i) => {
            // Check if there's an event on this day
            const hasEvent = events?.some(event => {
              const eventDate = new Date(event.date);
              return eventDate.getDate() === day.getDate() && 
                     eventDate.getMonth() === day.getMonth() && 
                     eventDate.getFullYear() === day.getFullYear();
            });
            
            // Determine event type for dot color
            let eventDotColor = "";
            if (hasEvent) {
              const event = events?.find(event => {
                const eventDate = new Date(event.date);
                return eventDate.getDate() === day.getDate() && 
                       eventDate.getMonth() === day.getMonth() && 
                       eventDate.getFullYear() === day.getFullYear();
              });
              
              switch (event?.type) {
                case 'marketing':
                  eventDotColor = "bg-primary-500";
                  break;
                case 'sale':
                  eventDotColor = "bg-secondary-500";
                  break;
                case 'email':
                  eventDotColor = "bg-accent-500";
                  break;
                default:
                  eventDotColor = "bg-gray-500";
              }
            }
            
            return (
              <div 
                key={i} 
                className={cn(
                  "h-8 flex items-center justify-center",
                  !isSameMonth(day, currentMonth) && "text-gray-400",
                  isToday(day) && "bg-primary-100 text-primary-700 font-medium rounded-full",
                  "relative"
                )}
              >
                {day.getDate()}
                {hasEvent && (
                  <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-1 ${eventDotColor} rounded-full`}></span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Upcoming Events</h4>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center p-2">
                  <div className="w-2 h-2 rounded-full bg-gray-200 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <CalendarEvent key={event.id} event={event} />
            ))
          ) : (
            <p className="text-sm text-gray-500 py-2">No upcoming events</p>
          )}
        </div>
      </div>
    </div>
  );
}
