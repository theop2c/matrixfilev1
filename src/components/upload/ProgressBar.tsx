import React from 'react';

interface BarreProgressionProps {
  progression: number;
  className?: string;
}

export function BarreProgression({ progression, className = '' }: BarreProgressionProps) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${progression}%` }}
      />
    </div>
  );
}