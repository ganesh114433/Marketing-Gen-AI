import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "../../App";
import { CalendarEventCard } from "../ui/calendar-event";
import { CalendarIcon, Plus } from "lucide-react";

interface ContentCalendarProps {
  userId: number;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ userId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/events", { userId }],
  });

  // Filter and sort upcoming events
  const getUpcomingEvents = () => {
    if (!data || !Array.isArray(data)) return [];
    
    const now = new Date();
    return data
      .filter(event => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3); // Get only the nearest 3 events
  };

  const upcomingEvents = getUpcomingEvents();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-red-600">Error loading calendar events: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg font-heading">Upcoming Content</h3>
          <Link href="/content-calendar">
            <Button variant="link" className="text-primary p-0 h-auto">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>View Calendar</span>
            </Button>
          </Link>
        </div>
        
        {/* Calendar events list */}
        <div className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <CalendarEventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="text-center py-6 text-slate-500">
              <CalendarIcon className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p>No upcoming events scheduled</p>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <Link href="/content-calendar">
            <Button 
              variant="outline"
              className="w-full py-2.5 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Add New Content</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentCalendar;
