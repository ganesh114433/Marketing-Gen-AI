import { useState } from 'react';
import { format, parseISO, startOfWeek, addDays, addWeeks, eachDayOfInterval, isSameDay, isToday, subWeeks, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

type CalendarData = {
  date: string; // ISO date string
  value: number;
};

interface CalendarHeatmapProps {
  data: CalendarData[];
  startDate?: Date;
  endDate?: Date;
  colorRange?: string[];
  tooltipContent?: (date: Date, value: number) => React.ReactNode;
  onClick?: (date: Date, value: number) => void;
}

export default function CalendarHeatmap({
  data,
  startDate = subWeeks(new Date(), 12),
  endDate = new Date(),
  colorRange = ['#f3f4f6', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'],
  tooltipContent,
  onClick,
}: CalendarHeatmapProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Find min and max values for color scaling
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values, 1);

  // Generate weeks and days for the heatmap
  const weekCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  // Generate calendar cells
  const generateCalendarCells = () => {
    const cells = [];
    let currentDate = startOfWeek(startDate);

    // Generate days of week header
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    cells.push(
      <div key="header" className="grid grid-cols-7 text-xs text-gray-500 mb-1 ml-8">
        {daysOfWeek.map((day, i) => (
          <div key={`header-${i}`} className="text-center">{day}</div>
        ))}
      </div>
    );

    // Generate weeks
    for (let week = 0; week < weekCount; week++) {
      const weekStart = addWeeks(currentDate, week);
      const days = eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 6)
      });

      // Show month label at the beginning of each month
      const firstDayOfWeek = days[0];
      const monthLabel = week === 0 || firstDayOfWeek.getDate() <= 7 
        ? <div className="text-xs text-gray-500 w-8 text-right pr-2">{format(firstDayOfWeek, 'MMM')}</div> 
        : <div className="w-8"></div>;

      cells.push(
        <div key={`week-${week}`} className="flex items-center mb-1">
          {monthLabel}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              // Don't render future dates
              if (isAfter(day, endDate)) {
                return <div key={`empty-${i}`} className="h-4 w-4"></div>;
              }

              // Find data for this day
              const matchingData = data.find(d => isSameDay(parseISO(d.date), day));
              const value = matchingData ? matchingData.value : 0;
              
              // Determine color based on value
              const colorIndex = Math.min(
                Math.floor((value / maxValue) * (colorRange.length - 1)),
                colorRange.length - 1
              );
              const backgroundColor = value > 0 ? colorRange[colorIndex] : colorRange[0];

              return (
                <div
                  key={format(day, 'yyyy-MM-dd')}
                  className={cn(
                    "h-4 w-4 rounded-sm cursor-pointer border border-gray-100",
                    isToday(day) && "ring-1 ring-primary-500"
                  )}
                  style={{ backgroundColor }}
                  onMouseEnter={(e) => {
                    setHoveredDate(day);
                    setHoveredValue(value);
                    setTooltipPosition({
                      top: e.clientY + 10,
                      left: e.clientX + 10
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredDate(null);
                    setHoveredValue(null);
                  }}
                  onClick={() => onClick && onClick(day, value)}
                ></div>
              );
            })}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-2">
        {generateCalendarCells()}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end mt-2 space-x-2">
        <span className="text-xs text-gray-500">Less</span>
        {colorRange.map((color, i) => (
          <div 
            key={`legend-${i}`} 
            className="h-3 w-3 rounded-sm border border-gray-100"
            style={{ backgroundColor: color }}
          ></div>
        ))}
        <span className="text-xs text-gray-500">More</span>
      </div>
      
      {/* Tooltip */}
      {hoveredDate && hoveredValue !== null && (
        <div 
          className="absolute z-10 p-2 bg-white rounded-md shadow-lg text-sm border border-gray-200"
          style={{ 
            top: tooltipPosition.top, 
            left: tooltipPosition.left,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltipContent ? 
            tooltipContent(hoveredDate, hoveredValue) : 
            <>
              <div className="font-medium">{format(hoveredDate, 'MMM d, yyyy')}</div>
              <div>{hoveredValue} {hoveredValue === 1 ? 'activity' : 'activities'}</div>
            </>
          }
        </div>
      )}
    </div>
  );
}
