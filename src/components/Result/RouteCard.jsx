import React from 'react';

const RouteCard = ({ route, index, isSelected, onClick, modes = [], benefit = 0 }) => {
  const { distance, avgAQI, duration } = route;
  
  const distanceKm = parseFloat(distance).toFixed(1);
  const timeMins = duration; // Already calculated by backend in minutes

  const formatMode = (m) => m === 'cleanest' ? 'Cleanest' : m === 'fastest' ? 'Fastest' : 'Balanced';
  const modeLabel = modes.map(formatMode).join(' + ');

  // Determine health color
  const getHealthColor = (aqi) => {
    if (aqi <= 30) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800/50';
    if (aqi <= 80) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-100 dark:border-yellow-800/50';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800/50';
  };

  const healthClass = getHealthColor(avgAQI);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-[260px] md:w-[280px] shrink-0 text-left p-4 rounded-3xl transition-all duration-500 border overflow-hidden relative cursor-pointer group ${
        isSelected 
          ? 'bg-gradient-to-br from-indigo-500 to-blue-600 border-white/20 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] scale-[1.02] -translate-y-1' 
          : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/60 dark:border-white/10 hover:border-white/80 dark:hover:border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
      }`}
    >
      {/* Glossy inner reflection */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="mb-2 flex justify-between items-center relative z-10">
        <span className={`text-[10px] font-black uppercase tracking-widest truncate ${isSelected ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400'}`}>
          {modeLabel}
        </span>
        <div className={`px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest shadow-sm ${
          isSelected ? 'bg-white/20 border-white/30 text-white backdrop-blur-md' : healthClass
        }`}>
          AQI {avgAQI}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 overflow-hidden relative z-10">
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
              {timeMins} min
            </span>
            <span className={`text-[9px] font-bold uppercase ${isSelected ? 'text-indigo-100' : 'text-gray-400 dark:text-slate-400'}`}>
              {distanceKm} KM
            </span>
          </div>
          {benefit > 0 && (
            <p className={`text-[9px] font-black uppercase tracking-tight mt-1 ${
              isSelected ? 'text-green-300 animate-pulse' : 'text-green-600 dark:text-green-400'
            }`}>
              ~{benefit}% Less Exposure
            </p>
          )}
        </div>
        
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 shadow-inner ${
          isSelected 
            ? 'bg-white/20 text-white backdrop-blur-md border border-white/30' 
            : 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 border border-gray-100 dark:border-slate-700'
        }`}>
          <svg className="w-4 h-4 translate-x-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default RouteCard;
