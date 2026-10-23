import { useState, useEffect } from 'react';
import { Globe, Map, Building2, Home } from 'lucide-react';
import {
  getCountries,
  getStates,
  getDistricts,
  getVillages,
  OTHER_OPTION
} from '../lib/locationData';

export interface CascadingLocationPickerProps {
  country: string;
  state: string;
  district: string;
  village: string;
  onChange: (loc: { country: string; state: string; district: string; village: string }) => void;
  disabled?: boolean;
  className?: string;
}

export function CascadingLocationPicker({
  country,
  state,
  district,
  village,
  onChange,
  disabled = false,
  className = ''
}: CascadingLocationPickerProps) {
  // Available lists based on hierarchy, strictly arranged A-Z
  const countries = getCountries();
  const currentCountry = country && countries.includes(country) ? country : '';

  const states = currentCountry ? getStates(currentCountry) : [];
  const currentState = currentCountry && state && states.includes(state) ? state : '';

  const districts = currentCountry && currentState ? getDistricts(currentCountry, currentState) : [];
  const currentDistrict = currentState && district && districts.includes(district) ? district : '';

  // Strictly fetches ONLY the villages belonging to this exact district
  const villages = currentCountry && currentState && currentDistrict
    ? getVillages(currentCountry, currentState, currentDistrict)
    : [];

  // Track whether user explicitly chose "Other (specify below)"
  const [isOtherSelected, setIsOtherSelected] = useState(village === OTHER_OPTION);
  const [customVillageInput, setCustomVillageInput] = useState(
    village && !villages.filter(v => v !== OTHER_OPTION).includes(village) && village !== OTHER_OPTION
      ? village
      : ''
  );

  // Sync custom input if an external custom village is passed
  useEffect(() => {
    if (village && villages.includes(village)) {
      setIsOtherSelected(village === OTHER_OPTION);
    } else if (village && !villages.includes(village) && village !== OTHER_OPTION && currentDistrict) {
      setCustomVillageInput(village);
      setIsOtherSelected(true);
    } else if (!village) {
      setIsOtherSelected(false);
      setCustomVillageInput('');
    }
  }, [village, villages, currentDistrict]);

  // NEVER auto-select child options on parent change
  const handleCountryChange = (newCountry: string) => {
    setIsOtherSelected(false);
    setCustomVillageInput('');
    onChange({
      country: newCountry,
      state: '',
      district: '',
      village: ''
    });
  };

  const handleStateChange = (newState: string) => {
    setIsOtherSelected(false);
    setCustomVillageInput('');
    onChange({
      country: currentCountry,
      state: newState,
      district: '',
      village: ''
    });
  };

  const handleDistrictChange = (newDistrict: string) => {
    setIsOtherSelected(false);
    setCustomVillageInput('');
    onChange({
      country: currentCountry,
      state: currentState,
      district: newDistrict,
      village: ''
    });
  };

  const handleVillageSelect = (newVillage: string) => {
    if (newVillage === OTHER_OPTION) {
      setIsOtherSelected(true);
      onChange({
        country: currentCountry,
        state: currentState,
        district: currentDistrict,
        village: customVillageInput.trim() || OTHER_OPTION
      });
    } else {
      setIsOtherSelected(false);
      onChange({
        country: currentCountry,
        state: currentState,
        district: currentDistrict,
        village: newVillage
      });
    }
  };

  const handleCustomVillageChange = (val: string) => {
    setCustomVillageInput(val);
    onChange({
      country: currentCountry,
      state: currentState,
      district: currentDistrict,
      village: val.trim() || OTHER_OPTION
    });
  };

  // The active village displayed in the dropdown (strictly empty if not chosen)
  const selectedDropdownValue = isOtherSelected
    ? OTHER_OPTION
    : (village && villages.includes(village) ? village : '');

  // Formatted summary
  const summaryParts = [
    isOtherSelected ? customVillageInput.trim() : (village && villages.includes(village) ? village : ''),
    currentDistrict,
    currentState,
    currentCountry
  ].filter(Boolean);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        
        {/* 1. Country Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
            Country
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              disabled={disabled}
              value={currentCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all appearance-none cursor-pointer disabled:opacity-60"
            >
              <option value="" className="text-slate-400 dark:text-neutral-500">
                -- Select Country --
              </option>
              {countries.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white">
                  {c}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. State Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
            State / Region
          </label>
          <div className="relative">
            <Map className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              disabled={disabled || !currentCountry || states.length === 0}
              value={currentState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="" className="text-slate-400 dark:text-neutral-500">
                {currentCountry ? '-- Select State / Region --' : '-- Select Country First --'}
              </option>
              {states.map((s) => (
                <option key={s} value={s} className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white">
                  {s}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. District Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
            District / County
          </label>
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              disabled={disabled || !currentState || districts.length === 0}
              value={currentDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="" className="text-slate-400 dark:text-neutral-500">
                {currentState ? '-- Select District --' : '-- Select State First --'}
              </option>
              {districts.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white">
                  {d}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4. Village Selection - Strictly for this selected district ONLY */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
            Village / Mandal / Town
          </label>
          <div className="relative">
            <Home className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              disabled={disabled || !currentDistrict || villages.length === 0}
              value={selectedDropdownValue}
              onChange={(e) => handleVillageSelect(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="" className="text-slate-400 dark:text-neutral-500">
                {currentDistrict ? '-- Select Village / Mandal --' : '-- Select District First --'}
              </option>
              {villages.map((v) => (
                <option key={v} value={v} className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white">
                  {v}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Village text input if 'Other' is explicitly chosen */}
      {isOtherSelected && currentDistrict && (
        <div className="pt-1">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
            Specify Your Village / Gram Panchayat Name in {currentDistrict}
          </label>
          <input
            type="text"
            required
            disabled={disabled}
            value={customVillageInput}
            onChange={(e) => handleCustomVillageChange(e.target.value)}
            placeholder={`Enter your village or gram panchayat in ${currentDistrict}`}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
          />
        </div>
      )}

      {/* Selected Location Summary Preview */}
      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-neutral-900/40 border border-slate-200/60 dark:border-neutral-800/60 text-[11px] text-slate-600 dark:text-neutral-400 flex items-center space-x-1.5">
        <span className="font-semibold text-slate-800 dark:text-neutral-200">Selected Location:</span>
        <span className="truncate">
          {summaryParts.length > 0 ? summaryParts.join(', ') : <span className="italic text-slate-400">Not selected yet</span>}
        </span>
      </div>
    </div>
  );
}
