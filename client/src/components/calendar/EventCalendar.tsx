import React, { useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addHours } from "date-fns";
import { enUS } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "../../App";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EventForm from "./EventForm";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DragAndDropCalendar = withDragAndDrop(BigCalendar);

const EventCalendar = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "edit" | "create">("view");
  
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["/api/events", { userId: currentUser.id }],
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, event }: { id: number, event: any }) => {
      const response = await apiRequest("PATCH", `/api/events/${id}`, event);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Updated",
        description: "Your event has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Format events for calendar
  const calendarEvents = events.map((event: any) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startDate),
    end: event.endDate ? new Date(event.endDate) : addHours(new Date(event.startDate), 1),
    platform: event.platform,
    status: event.status,
    allDay: false,
    resource: event,
  }));
  
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setDialogMode("view");
    setIsDialogOpen(true);
  };
  
  const handleSelectSlot = (slotInfo: any) => {
    setSelectedEvent({
      startDate: slotInfo.start,
      endDate: slotInfo.end,
      userId: currentUser.id,
    });
    setDialogMode("create");
    setIsDialogOpen(true);
  };
  
  const handleEditEvent = () => {
    setDialogMode("edit");
  };
  
  const handleEventChange = (changeData: any) => {
    const { event, start, end } = changeData;
    updateEventMutation.mutate({
      id: event.id,
      event: {
        startDate: start,
        endDate: end,
      },
    });
  };
  
  const handleEventResize = (resizeData: any) => {
    const { event, start, end } = resizeData;
    updateEventMutation.mutate({
      id: event.id,
      event: {
        startDate: start,
        endDate: end,
      },
    });
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };
  
  const eventStyleGetter = (event: any) => {
    let backgroundColor;
    
    switch (event.platform?.toLowerCase()) {
      case 'facebook':
        backgroundColor = '#4F46E5';
        break;
      case 'instagram':
        backgroundColor = '#F59E0B';
        break;
      case 'twitter':
        backgroundColor = '#0EA5E9';
        break;
      case 'email':
        backgroundColor = '#0EA5E9';
        break;
      default:
        backgroundColor = '#64748B';
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

  if (isLoading) {
    return (
      <Card className="animate-pulse h-[600px]">
        <CardContent className="p-6">
          <div className="h-full bg-slate-100 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading calendar events: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <DragAndDropCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            selectable
            resizable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onEventDrop={handleEventChange}
            onEventResize={handleEventResize}
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day"]}
            defaultView="month"
          />
        </CardContent>
      </Card>
      
      {/* Dialog for viewing, editing, or creating events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "view" 
                ? selectedEvent?.title || "Event Details" 
                : dialogMode === "edit" 
                ? "Edit Event" 
                : "Create New Event"}
            </DialogTitle>
          </DialogHeader>
          
          {dialogMode === "view" && selectedEvent && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-medium text-lg">{selectedEvent.title}</h3>
                <p className="text-slate-500 text-sm">
                  {format(new Date(selectedEvent.startDate), "PPP p")}
                  {selectedEvent.endDate && ` - ${format(new Date(selectedEvent.endDate), "p")}`}
                </p>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {selectedEvent.platform && (
                  <span className="px-2 py-1 text-xs rounded-full bg-primary bg-opacity-10 text-primary">
                    {selectedEvent.platform}
                  </span>
                )}
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedEvent.status === "ready"
                    ? "bg-success bg-opacity-10 text-success"
                    : selectedEvent.status === "pending"
                    ? "bg-warning bg-opacity-10 text-warning"
                    : "bg-slate-200 text-slate-700"
                }`}>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={closeDialog}>Close</Button>
                <Button onClick={handleEditEvent}>Edit</Button>
              </div>
            </div>
          )}
          
          {(dialogMode === "edit" || dialogMode === "create") && (
            <EventForm 
              event={selectedEvent} 
              mode={dialogMode}
              onDone={() => {
                closeDialog();
                queryClient.invalidateQueries({ queryKey: ["/api/events"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Import Button separately to avoid TypeScript errors
import { Button } from "@/components/ui/button";

export default EventCalendar;
