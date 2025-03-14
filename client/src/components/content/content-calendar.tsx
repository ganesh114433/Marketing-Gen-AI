import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getEvents, createEvent, updateEvent, deleteEvent, getContents } from "@/lib/api";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ContentForm from "./content-form";

const localizer = dayjsLocalizer(dayjs);

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: any;
};

interface ContentCalendarProps {
  userId: number;
}

export default function ContentCalendar({ userId }: ContentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [isViewEventModalOpen, setIsViewEventModalOpen] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch events
  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ['/api/events', userId],
    queryFn: () => getEvents(userId),
    enabled: Boolean(userId),
  });

  // Fetch contents
  const { data: contentsData, isLoading: isContentsLoading } = useQuery({
    queryKey: ['/api/contents', userId],
    queryFn: () => getContents(userId),
    enabled: Boolean(userId),
  });

  // Format events for the calendar
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (eventsData && contentsData) {
      const formattedEvents: CalendarEvent[] = [];
      
      // Add regular events
      eventsData.forEach((event: any) => {
        formattedEvents.push({
          id: event.id,
          title: event.title,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          allDay: event.allDay,
          resource: { ...event, type: 'event' },
        });
      });
      
      // Add content with scheduled dates
      contentsData.forEach((content: any) => {
        if (content.scheduledDate) {
          const scheduledDate = new Date(content.scheduledDate);
          const endDate = new Date(scheduledDate);
          endDate.setHours(endDate.getHours() + 1);
          
          formattedEvents.push({
            id: content.id,
            title: content.title,
            start: scheduledDate,
            end: endDate,
            allDay: false,
            resource: { ...content, type: 'content' },
          });
        }
      });
      
      setCalendarEvents(formattedEvents);
    }
  }, [eventsData, contentsData]);

  // Event mutations
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', userId] });
      toast({
        title: "Event created",
        description: "The event has been created successfully.",
      });
      setIsAddEventModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create event",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', userId] });
      toast({
        title: "Event updated",
        description: "The event has been updated successfully.",
      });
      setIsViewEventModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update event",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', userId] });
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      setIsViewEventModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete event",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle calendar interactions
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setIsAddEventModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewEventModalOpen(true);
  };

  const handleAddEvent = (eventData: any) => {
    createEventMutation.mutate({
      ...eventData,
      userId,
    });
  };

  const handleUpdateEvent = (eventId: number, eventData: any) => {
    updateEventMutation.mutate({
      id: eventId,
      data: eventData,
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    deleteEventMutation.mutate(eventId);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const eventType = event.resource?.type;
    let backgroundColor = '';
    
    if (eventType === 'content') {
      const contentType = event.resource?.type;
      switch (contentType) {
        case 'blog_post':
          backgroundColor = '#4F46E5'; // primary
          break;
        case 'social_media':
          backgroundColor = '#10B981'; // green
          break;
        case 'email':
          backgroundColor = '#F59E0B'; // amber
          break;
        case 'video':
          backgroundColor = '#EF4444'; // red
          break;
        default:
          backgroundColor = '#6B7280'; // gray
      }
    } else {
      backgroundColor = '#4F46E5'; // primary
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="h-full">
      <div className="mb-4 flex justify-between items-center">
        <Button onClick={() => setIsAddEventModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
        <div>
          <Button variant="outline" className="mr-2">Today</Button>
          <Button variant="outline" className="mr-2">Month</Button>
          <Button variant="outline" className="mr-2">Week</Button>
          <Button variant="outline">Day</Button>
        </div>
      </div>

      <Card className="h-[calc(100vh-220px)]">
        <CardContent className="p-0 h-full">
          {isEventsLoading || isContentsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              defaultView="month"
            />
          )}
        </CardContent>
      </Card>

      {/* Add Event Modal */}
      <Dialog open={isAddEventModalOpen} onOpenChange={setIsAddEventModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <ContentForm
            initialData={{
              title: "",
              description: "",
              startDate: selectedDate || new Date(),
              endDate: selectedDate ? new Date(selectedDate.getTime() + 60 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000),
              allDay: false,
              type: "event",
            }}
            onSubmit={handleAddEvent}
            onCancel={() => setIsAddEventModalOpen(false)}
            isPending={createEventMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* View/Edit Event Modal */}
      <Dialog open={isViewEventModalOpen} onOpenChange={setIsViewEventModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <>
              <ContentForm
                initialData={{
                  title: selectedEvent.title,
                  description: selectedEvent.resource?.description || "",
                  startDate: selectedEvent.start,
                  endDate: selectedEvent.end,
                  allDay: selectedEvent.allDay,
                  type: selectedEvent.resource?.type || "event",
                }}
                onSubmit={(data) => handleUpdateEvent(selectedEvent.id, data)}
                onCancel={() => setIsViewEventModalOpen(false)}
                isPending={updateEventMutation.isPending}
              />
              <div className="flex justify-end">
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  disabled={deleteEventMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
