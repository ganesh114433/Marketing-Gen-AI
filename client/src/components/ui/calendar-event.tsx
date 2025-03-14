import React from "react";
import { CalendarEvent } from "@shared/schema";
import { format } from "date-fns";

interface CalendarEventCardProps {
  event: CalendarEvent;
}

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ event }) => {
  // Format date for display
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return {
      month: format(dateObj, 'MMM').toUpperCase(),
      day: format(dateObj, 'd'),
      time: format(dateObj, 'h:mm a')
    };
  };

  const dateDisplay = formatDate(event.startDate);
  
  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
        return 'bg-success bg-opacity-10 text-success';
      case 'pending':
        return 'bg-warning bg-opacity-10 text-warning';
      case 'published':
        return 'bg-primary bg-opacity-10 text-primary';
      default:
        return 'bg-slate-200 text-slate-600';
    }
  };
  
  // Get platform badge styling
  const getPlatformBadge = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'facebook':
        return 'bg-primary bg-opacity-10 text-primary';
      case 'instagram':
        return 'bg-accent bg-opacity-10 text-accent';
      case 'twitter':
        return 'bg-secondary bg-opacity-10 text-secondary';
      case 'email':
        return 'bg-secondary bg-opacity-10 text-secondary';
      default:
        return 'bg-slate-200 text-slate-600';
    }
  };
  
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-slate-100">
      <div className="flex-shrink-0 w-12 flex flex-col items-center justify-center">
        <span className="text-slate-400 text-xs font-medium">{dateDisplay.month}</span>
        <span className="text-slate-800 text-xl font-semibold">{dateDisplay.day}</span>
      </div>
      
      <div className="flex-1">
        <h4 className="font-medium text-slate-800">{event.title}</h4>
        <div className="flex items-center text-xs text-slate-500 mt-1">
          <span className="flex items-center"><i className="ri-time-line mr-1"></i> {dateDisplay.time}</span>
          {event.platform && (
            <>
              <span className="mx-2">•</span>
              <span className={`px-1.5 py-0.5 rounded ${getPlatformBadge(event.platform)} font-medium`}>{event.platform}</span>
            </>
          )}
        </div>
      </div>
      
      <div>
        <span className={`inline-flex px-2 py-1 rounded-full ${getStatusBadge(event.status)} text-xs font-medium`}>
          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default CalendarEventCard;
