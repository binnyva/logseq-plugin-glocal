import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek
} from 'date-fns';

interface CalendarProps {
  initialDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({ initialDate = new Date() }) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  const weekDayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const prevMonth = (): void => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = (): void => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getDaysToDisplay = (): Date[] => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  const renderCalendar = (): JSX.Element => {
    const days = getDaysToDisplay();

    return (
      <div className="grid grid-cols-7 gap-1 h-full">
        {days.map((day, index) => (
          <div
            key={index}
            className={`border border border-gray-600 ${
              !isSameMonth(day, currentDate) ? 'text-gray-600 .opacity-40' : ''
            }`}
          >
            <span className={`text-sm p-1
              ${isSameDay(day, new Date()) ? 'bg-blue-500 text-white rounded-full' : ''}`}>
              {format(day, 'd')}
            </span>
            <div>Title of {format(day, 'Y m d')} goes here</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
      <button onClick={prevMonth}>
          <span className="h-4 w-4">&lt;</span>
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={nextMonth}>
          <span className="h-4 w-4">&gt;</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDayLabels.map(day => (
          <div key={day} className="font-medium text-sm">{day}</div>
        ))}
      </div>
      {renderCalendar()}
    </div>
  );
};

export default Calendar;