import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCalendar from "../components/calendar/EventCalendar";
import EventForm from "../components/calendar/EventForm";
import { Plus } from "lucide-react";
import { currentUser } from "../App";

const ContentCalendar = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const createNewEvent = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold font-heading">Content Calendar</h1>
        <Button onClick={createNewEvent}>
          <Plus className="h-4 w-4 mr-1" /> 
          New Event
        </Button>
      </div>
      
      <Tabs defaultValue="calendar">
        <TabsList className="mb-4">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-0">
          <EventCalendar />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <ListView userId={currentUser.id} />
        </TabsContent>
      </Tabs>
      
      {/* Dialog for creating new events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          
          <EventForm 
            event={{ userId: currentUser.id, startDate: new Date() }}
            mode="create"
            onDone={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// List view component for displaying events in a tabular format
const ListView = ({ userId }: { userId: number }) => {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["/api/events", { userId }],
  });
  
  // Group events by month
  const groupEventsByMonth = () => {
    if (!events.length) return {};
    
    return events.reduce((acc: any, event: any) => {
      const date = new Date(event.startDate);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      
      acc[monthYear].push(event);
      return acc;
    }, {});
  };
  
  const groupedEvents = groupEventsByMonth();
  
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-8 bg-slate-100 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded"></div>
            ))}
          </div>
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
  
  if (!events.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <i className="ri-calendar-line text-4xl text-slate-300 mb-3 block"></i>
          <h3 className="font-medium text-lg mb-2">No Events Scheduled</h3>
          <p className="text-slate-500 mb-4">Start by creating your first content event.</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> 
            Create Event
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([monthYear, monthEvents]: [string, any]) => (
        <Card key={monthYear}>
          <CardContent className="p-0">
            <div className="px-6 py-3 bg-slate-50 border-b">
              <h3 className="font-medium">{monthYear}</h3>
            </div>
            <div className="p-4">
              <div className="divide-y">
                {monthEvents.map((event: any) => {
                  const startDate = new Date(event.startDate);
                  const endDate = event.endDate ? new Date(event.endDate) : null;
                  
                  return (
                    <div key={event.id} className="py-3 px-2 hover:bg-slate-50 flex items-center">
                      <div className="w-14 text-center">
                        <div className="text-sm font-medium text-slate-900">
                          {startDate.getDate()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {startDate.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium text-slate-900">{event.title}</h4>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                          <span>
                            {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            {endDate && ` - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex items-center space-x-2">
                        {event.platform && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            event.platform === 'Facebook' ? 'bg-primary bg-opacity-10 text-primary' :
                            event.platform === 'Instagram' ? 'bg-accent bg-opacity-10 text-accent' :
                            event.platform === 'Twitter' ? 'bg-secondary bg-opacity-10 text-secondary' :
                            event.platform === 'Email' ? 'bg-secondary bg-opacity-10 text-secondary' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {event.platform}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          event.status === 'ready' ? 'bg-success bg-opacity-10 text-success' :
                          event.status === 'pending' ? 'bg-warning bg-opacity-10 text-warning' :
                          event.status === 'published' ? 'bg-primary bg-opacity-10 text-primary' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Import necessary dependencies
import { useQuery } from "@tanstack/react-query";

export default ContentCalendar;
