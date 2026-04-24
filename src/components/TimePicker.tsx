import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label = "Select Time" }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  // Parse existing value if provided
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      if (hours >= 12) {
        setSelectedHour(hours === 12 ? 12 : hours - 12);
        setSelectedPeriod('PM');
      } else {
        setSelectedHour(hours === 0 ? 12 : hours);
        setSelectedPeriod('AM');
      }
      setSelectedMinute(minutes);
    }
  }, [value]);

  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  // Generate minutes (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = () => {
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    } else if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }
    
    const formattedTime = `${String(hour24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onChange(formattedTime);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return 'Not selected';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-black rounded-lg font-medium flex items-center justify-between hover:border-emerald-500 transition-all"
      >
        <span className={value ? 'text-black' : 'text-gray-400'}>
          {value ? formatDisplayTime(value) : label}
        </span>
        <Clock className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border-2 border-gray-300 shadow-2xl z-50 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3">
            <h4 className="font-semibold text-center">Select Time</h4>
          </div>

          {/* Scrollable Pickers */}
          <div className="flex gap-2 p-4">
            {/* Hour Picker */}
            <div className="flex-1">
              <div className="text-center text-gray-600 text-sm mb-2 font-medium">Hour</div>
              <div 
                ref={hourRef}
                className="h-40 overflow-y-auto border-2 border-gray-200 rounded-lg bg-gray-50 scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => setSelectedHour(hour)}
                    className={`w-full px-3 py-2 text-center transition-all ${
                      selectedHour === hour
                        ? 'bg-blue-600 text-white font-bold'
                        : 'hover:bg-blue-50 text-gray-700'
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute Picker */}
            <div className="flex-1">
              <div className="text-center text-gray-600 text-sm mb-2 font-medium">Minute</div>
              <div 
                ref={minuteRef}
                className="h-40 overflow-y-auto border-2 border-gray-200 rounded-lg bg-gray-50 scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => setSelectedMinute(minute)}
                    className={`w-full px-3 py-2 text-center transition-all ${
                      selectedMinute === minute
                        ? 'bg-blue-600 text-white font-bold'
                        : 'hover:bg-blue-50 text-gray-700'
                    }`}
                  >
                    {String(minute).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Period Picker (AM/PM) */}
            <div className="flex-1">
              <div className="text-center text-gray-600 text-sm mb-2 font-medium">Period</div>
              <div className="h-40 flex flex-col gap-2 pt-12">
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('AM')}
                  className={`w-full px-3 py-3 text-center rounded-lg transition-all ${
                    selectedPeriod === 'AM'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-gray-100 hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('PM')}
                  className={`w-full px-3 py-3 text-center rounded-lg transition-all ${
                    selectedPeriod === 'PM'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-gray-100 hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="px-4 py-3 bg-gray-50 border-t-2 border-gray-200">
            <p className="text-center text-gray-700 font-medium text-lg">
              {selectedHour}:{String(selectedMinute).padStart(2, '0')} {selectedPeriod}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
