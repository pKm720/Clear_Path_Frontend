import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouteStore } from '../../store/routeStore';

const PHOTON_BASE = 'https://photon.komoot.io/api/';
const PHOTON_REVERSE = 'https://photon.komoot.io/reverse';
const BENGALURU_BBOX = '77.3,12.8,77.9,13.2'; // [minLon, minLat, maxLon, maxLat]

const LocationInput = ({ placeholder, onSelect, value, inputType }) => {
  const { activeInput, setActiveInput, currentPosition } = useRouteStore();
  const isActiveForMapClick = activeInput === inputType;
  const [query, setQuery] = useState(value?.label || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const textareaRef = useRef(null);
  const timeoutRef = useRef(null);

  // Only offer "Use Current Location" for the start input
  const canUseCurrentLocation = inputType === 'start' && currentPosition;

  const handleUseCurrentLocation = async () => {
    if (!currentPosition) return;
    setIsLocating(true);
    setShowDropdown(false);
    try {
      const resp = await axios.get(PHOTON_REVERSE, {
        params: { lat: currentPosition.lat, lon: currentPosition.lon },
        timeout: 5000
      });
      const feature = resp.data?.features?.[0];
      let label = 'My Location';
      if (feature) {
        const p = feature.properties;
        label = p.name || p.street || p.district || 'My Location';
      }
      setQuery(label);
      onSelect({ lat: currentPosition.lat, lon: currentPosition.lon, label });
    } catch {
      setQuery('My Location');
      onSelect({ lat: currentPosition.lat, lon: currentPosition.lon, label: 'My Location' });
    } finally {
      setIsLocating(false);
    }
  };

  // Auto-resize textarea height as query grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync internal text query if external value resets (e.g. from Clear button)
  useEffect(() => {
    if (!value) {
      setQuery('');
    } else if (value.label && value.label !== query) {
      setQuery(value.label);
    }
  }, [value]);

  const searchLocations = async (text) => {
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(PHOTON_BASE, {
        params: {
          q: text,
          bbox: BENGALURU_BBOX,
          limit: 5,
        }
      });
      setResults(response.data.features || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e) => {
    const text = e.target.value;
    setQuery(text);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => searchLocations(text), 300);
  };

  const handleSelect = (feature) => {
    const p = feature.properties;
    const label = p.name || p.street || p.city;
    const subtitle = [p.street, p.district, p.city].filter(Boolean).join(', ');
    
    setQuery(label); 
    setResults([]);
    setShowDropdown(false);
    onSelect({
      lat: parseFloat(feature.geometry.coordinates[1]),
      lon: parseFloat(feature.geometry.coordinates[0]),
      label: label
    });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={query}
          rows="1"
          onChange={handleChange}
          onFocus={() => {
            setActiveInput(inputType);
            if (results.length > 0 || canUseCurrentLocation) setShowDropdown(true);
          }}
          onBlur={() => {
            // Small delay so a map-click can register before we clear activeInput
            setTimeout(() => setActiveInput(null), 200);
          }}
          placeholder={isActiveForMapClick ? '📍 or click on map...' : placeholder}
          className={`w-full bg-gray-50/50 dark:bg-slate-800/80 border p-4 pl-12 pr-10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 resize-none min-h-[56px] overflow-hidden leading-tight ${
            isActiveForMapClick
              ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-300/30'
              : 'border-gray-200 dark:border-slate-700'
          }`}
        />
        <div className="absolute left-4 top-[18px] text-gray-400">
          <svg className="w-5 h-5 transition-colors group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        {isSearching && (
          <div className="absolute right-4 top-[18px]">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Spinning indicator while reverse geocoding */}
      {isLocating && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-4 z-20 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Getting your location…</p>
        </div>
      )}

      {showDropdown && (results.length > 0 || canUseCurrentLocation) && !isLocating && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-20 transition-colors duration-300">
          
          {/* ── Use Current Location pill ── */}
          {canUseCurrentLocation && (
            <button
              onClick={handleUseCurrentLocation}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-100 dark:border-slate-700/60 transition-colors duration-150 group"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-tight">Use Current Location</p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                  {currentPosition ? `${currentPosition.lat.toFixed(4)}, ${currentPosition.lon.toFixed(4)}` : 'GPS active'}
                </p>
              </div>
              <svg className="w-4 h-4 text-blue-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {results.map((feature, idx) => {
            const p = feature.properties;
            const title = p.name || p.street || p.city;
            const subtitle = [p.street, p.district, p.city, p.state].filter(Boolean).filter(s => s !== title).join(', ');
            
            return (
              <button
                key={p.osm_id || idx}
                onClick={() => handleSelect(feature)}
                className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 border-b border-gray-50 dark:border-slate-700/50 last:border-0 transition-colors duration-150 group"
              >
                <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 leading-snug">
                  {title}
                </p>
                {subtitle && (
                  <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 leading-normal truncate">
                    {subtitle}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
