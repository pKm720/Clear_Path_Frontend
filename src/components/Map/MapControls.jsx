import React from 'react';
import { useRouteStore } from '../../store/routeStore';

const MapControls = ({ isMenuOpen, isShelfOpen }) => {
  const { 
    showHeatmap, setShowHeatmap,
    is3D, toggle3D,
    isDarkMode, toggleDarkMode
  } = useRouteStore();

  return (
    <div className={`md:hidden absolute left-1/2 -translate-x-1/2 z-30 flex flex-row gap-3 items-center pointer-events-auto transition-all duration-500 ease-in-out ${
      isMenuOpen ? 'opacity-0 pointer-events-none scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
    } ${isShelfOpen ? 'bottom-64' : 'bottom-16 md:bottom-28'}`}>
      <button
        onClick={toggleDarkMode}
        className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 text-lg shadow-lg active:scale-95 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md ${
          isDarkMode ? 'border-slate-700 text-amber-300' : 'border-white/50 text-gray-700'
        }`}
      >
        <span>{isDarkMode ? '🌙' : '☀️'}</span>
      </button>

      <button
        onClick={toggle3D}
        className={`flex items-center justify-center px-4 h-10 rounded-full border transition-all duration-300 text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 backdrop-blur-md ${
          is3D 
            ? 'bg-indigo-600/90 border-indigo-500 text-white shadow-indigo-500/20' 
            : 'bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-700 text-gray-500 dark:text-gray-300'
        }`}
      >
        <span>{is3D ? '3D' : '2D'}</span>
      </button>

      <button
        onClick={() => setShowHeatmap(!showHeatmap)}
        className={`flex items-center justify-center px-4 h-10 rounded-full border transition-all duration-300 text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 backdrop-blur-md ${
          showHeatmap 
            ? 'bg-orange-500/90 border-orange-400 text-white shadow-orange-500/20' 
            : 'bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-700 text-gray-500 dark:text-gray-300'
        }`}
      >
        <span>AQI Map</span>
      </button>
    </div>
  );
};

export default MapControls;
