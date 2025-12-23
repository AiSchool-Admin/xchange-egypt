'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  step?: number;
  formatValue?: (value: number) => string;
}

const QUICK_RANGES = [
  { label: 'أقل من 1,000', min: 0, max: 1000 },
  { label: '1,000 - 5,000', min: 1000, max: 5000 },
  { label: '5,000 - 10,000', min: 5000, max: 10000 },
  { label: '10,000 - 50,000', min: 10000, max: 50000 },
  { label: '50,000 - 100,000', min: 50000, max: 100000 },
  { label: 'أكثر من 100,000', min: 100000, max: 10000000 },
];

export default function PriceRangeSlider({
  min = 0,
  max = 1000000,
  minValue,
  maxValue,
  onChange,
  step = 100,
  formatValue = (v) => v.toLocaleString('ar-EG'),
}: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(minValue || min);
  const [localMax, setLocalMax] = useState(maxValue || max);
  const [isDragging, setIsDragging] = useState(false);

  // Sync with external values
  useEffect(() => {
    setLocalMin(minValue || min);
    setLocalMax(maxValue || max);
  }, [minValue, maxValue, min, max]);

  // Debounce the onChange callback
  useEffect(() => {
    if (isDragging) return;

    const timer = setTimeout(() => {
      if (localMin !== minValue || localMax !== maxValue) {
        onChange(localMin, localMax);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localMin, localMax, isDragging]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), localMax - step);
    setLocalMin(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), localMin + step);
    setLocalMax(value);
  };

  const handleQuickRange = (rangeMin: number, rangeMax: number) => {
    setLocalMin(rangeMin);
    setLocalMax(rangeMax);
    onChange(rangeMin, rangeMax);
  };

  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  const minPercent = getPercent(localMin);
  const maxPercent = getPercent(localMax);

  return (
    <div className="space-y-4">
      {/* Quick Range Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_RANGES.map((range, i) => {
          const isActive = localMin === range.min && localMax === range.max;
          return (
            <button
              key={i}
              onClick={() => handleQuickRange(range.min, range.max)}
              className={`px-2 py-1 text-xs rounded-lg transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          );
        })}
      </div>

      {/* Slider Track */}
      <div className="relative h-2 bg-gray-200 rounded-full mt-6 mb-4">
        {/* Active Track */}
        <div
          className="absolute h-full bg-emerald-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-emerald-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-emerald-500
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:pointer-events-auto"
        />

        {/* Max Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-emerald-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-emerald-500
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:pointer-events-auto"
        />
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <label className="block text-xs text-gray-500 mb-1">من</label>
          <input
            type="number"
            value={localMin}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= min && val < localMax) {
                setLocalMin(val);
              }
            }}
            onBlur={() => onChange(localMin, localMax)}
            min={min}
            max={localMax - step}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
          <span className="absolute left-3 bottom-2.5 text-xs text-gray-400">ج.م</span>
        </div>
        <div className="relative">
          <label className="block text-xs text-gray-500 mb-1">إلى</label>
          <input
            type="number"
            value={localMax}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val <= max && val > localMin) {
                setLocalMax(val);
              }
            }}
            onBlur={() => onChange(localMin, localMax)}
            min={localMin + step}
            max={max}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
          <span className="absolute left-3 bottom-2.5 text-xs text-gray-400">ج.م</span>
        </div>
      </div>

      {/* Display Selected Range */}
      <div className="text-center text-sm text-gray-600 bg-emerald-50 rounded-lg py-2">
        <span className="font-medium text-emerald-700">
          {formatValue(localMin)} - {formatValue(localMax)} ج.م
        </span>
      </div>
    </div>
  );
}
