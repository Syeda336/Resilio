import { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  minDate?: string;
}

export function DatePicker({ value, onChange, label = "Select Date", minDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  // Parse existing value if provided
  useEffect(() => {
    if (value) {
      // Parse date as local date to avoid timezone issues
      const [year, month, day] = value.split('-').map(Number);
      setSelectedYear(year);
      setSelectedMonth(month - 1); // Month is 0-indexed in JavaScript
      setSelectedDay(day);
    }
  }, [value]);

  // Generate years (current year to +10 years)
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i);

  // Month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate days based on selected month and year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const handleConfirm = () => {
    // 🔥 FIX: Don't use toISOString() for date-only values
    // toISOString() converts to UTC which causes timezone offset issues
    // Instead, format the date manually to preserve the selected date
    const year = selectedYear;
    const month = String(selectedMonth + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(selectedDay).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD format
    
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Not selected';
    // Parse as local date to avoid timezone offset issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    // Shorter format for compact display
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-black rounded-lg font-medium flex items-center justify-between hover:border-emerald-500 transition-all"
      >
        <span className={value ? 'text-black' : 'text-gray-400'}>
          {value ? formatDisplayDate(value) : label}
        </span>
        <Calendar className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border-2 border-gray-300 shadow-2xl z-50 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3">
            <h4 className="font-semibold text-center">Select Date</h4>
          </div>

          {/* Scrollable Pickers */}
          <div className="flex gap-2 p-4">
            {/* Year Picker */}
            <div className="flex-1">
              <div className="text-center text-gray-600 text-sm mb-2 font-medium">Year</div>
              <div 
                ref={yearRef}
                className="h-40 overflow-y-auto border-2 border-gray-200 rounded-lg bg-gray-50 scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={`w-full px-3 py-2 text-center transition-all ${
                      selectedYear === year
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'hover:bg-emerald-50 text-gray-700'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Picker */}
            <div className="flex-1">
              <div className="text-center text-gray-600 text-sm mb-2 font-medium">Month</div>
              <div 
                ref={monthRef}
                className="h-40 overflow-y-auto border-2 border-gray-200 rounded-lg bg-gray-50 scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                {months.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => setSelectedMonth(index)}
                    className={`w-full px-3 py-2 text-center transition-all ${
                      selectedMonth === index
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'hover:bg-emerald-50 text-gray-700'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Picker */}
            <div className="flex-1">
              <div className="text-center text-gray-600 text-sm mb-2 font-medium">Day</div>
              <div 
                ref={dayRef}
                className="h-40 overflow-y-auto border-2 border-gray-200 rounded-lg bg-gray-50 scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                {days.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`w-full px-3 py-2 text-center transition-all ${
                      selectedDay === day
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'hover:bg-emerald-50 text-gray-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="px-4 py-3 bg-gray-50 border-t-2 border-gray-200">
            <p className="text-center text-gray-700 font-medium">
              {new Date(selectedYear, selectedMonth, selectedDay).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 p-4 bg-white">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}