import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, X, Check } from 'lucide-react';

interface CalendarPickerProps {
  value: string;
  onChange: (formattedDate: string) => void;
  placeholder?: string;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  value,
  onChange,
  placeholder = 'Select due date & time...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current viewing month/year from value or default to current date
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (!value) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  });
  const [selectedTime, setSelectedTime] = useState<string>('17:00');

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
  // Convert to Monday-first (0 = Mon, 6 = Sun)
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);

    // Format output string, e.g. "Oct 15, 2026 · 17:00"
    const monthShort = monthNames[viewMonth].substring(0, 3);
    const dateFormatted = `${monthShort} ${String(day).padStart(2, '0')}, ${viewYear} · ${selectedTime}`;
    onChange(dateFormatted);
    setIsOpen(false);
  };

  const handleSelectPreset = (daysOffset: number, label: string) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    setSelectedDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());

    const monthShort = monthNames[target.getMonth()].substring(0, 3);
    const dateFormatted = `${label} (${monthShort} ${String(target.getDate()).padStart(2, '0')}) · ${selectedTime}`;
    onChange(dateFormatted);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange('');
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger input field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#16171D] border border-white/10 hover:border-[#d4af37]/50 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F7] flex items-center justify-between cursor-pointer transition select-none group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="w-4 h-4 text-[#d4af37] shrink-0 group-hover:scale-105 transition-transform" />
          <span className={`truncate ${value ? 'text-[#F5F5F7] font-medium' : 'text-[#797C86]'}`}>
            {value || placeholder}
          </span>
        </div>

        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded hover:bg-white/10 text-[#797C86] hover:text-[#ffb4ab] transition"
            title="Clear due date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[10px] text-[#797C86] font-mono">Pick date</span>
        )}
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-80 mt-2 z-50 p-4 rounded-2xl bg-[#1A1B20] border border-[#d4af37]/30 shadow-2xl shadow-black/80 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header with Month/Year Navigation */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#B8BAC2] hover:text-white transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-white tracking-wide">
              {monthNames[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#B8BAC2] hover:text-white transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets Strip */}
          <div className="grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => handleSelectPreset(0, 'Today')}
              className="py-1 px-1.5 text-[10px] font-semibold rounded-lg bg-white/5 hover:bg-[#d4af37]/20 text-[#B8BAC2] hover:text-[#d4af37] transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset(1, 'Tomorrow')}
              className="py-1 px-1.5 text-[10px] font-semibold rounded-lg bg-white/5 hover:bg-[#d4af37]/20 text-[#B8BAC2] hover:text-[#d4af37] transition"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset(3, 'In 3 Days')}
              className="py-1 px-1.5 text-[10px] font-semibold rounded-lg bg-white/5 hover:bg-[#d4af37]/20 text-[#B8BAC2] hover:text-[#d4af37] transition"
            >
              +3 Days
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset(7, 'Next Week')}
              className="py-1 px-1.5 text-[10px] font-semibold rounded-lg bg-white/5 hover:bg-[#d4af37]/20 text-[#B8BAC2] hover:text-[#d4af37] transition"
            >
              +1 Week
            </button>
          </div>

          {/* Day of Week Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#797C86] uppercase">
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
            <span>Su</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Previous month padding */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <span
                key={`prev-${idx}`}
                className="py-1.5 text-[#797C86]/30 text-[11px] select-none"
              >
                {daysInPrevMonth - startOffset + idx + 1}
              </span>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    selected
                      ? 'bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#d4af37]/25'
                      : today
                      ? 'border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/15'
                      : 'text-[#F5F5F7] hover:bg-white/10'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time Picker & Done Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-[#797C86]">
              <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Time:</span>
              <select
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  if (selectedDate) {
                    const monthShort = monthNames[selectedDate.getMonth()].substring(0, 3);
                    onChange(`${monthShort} ${String(selectedDate.getDate()).padStart(2, '0')}, ${selectedDate.getFullYear()} · ${e.target.value}`);
                  }
                }}
                className="bg-[#16171D] border border-white/10 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
              >
                <option value="09:00">09:00 (Morning)</option>
                <option value="12:00">12:00 (Noon)</option>
                <option value="15:00">15:00 (Afternoon)</option>
                <option value="17:00">17:00 (Market Close)</option>
                <option value="20:00">20:00 (Evening)</option>
                <option value="23:59">23:59 (End of Day)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-[#d4af37] font-semibold text-xs rounded-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
