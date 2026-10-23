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
  // Available lists based on hierarchy, all sorted in ascending order (A-Z)
  const countries = getCountries();
  const currentCountry = country && countries.includes(country) ? country : (countries.includes('India') ? 'India' : countries[0] || '');
  
  const states = getStates(currentCountry);
  const currentState = state && states.includes(state) ? state : (states.includes('Andhra Pradesh') ? 'Andhra Pradesh' : states[0] || '');
  
  const districts = getDistricts(currentCountry, currentState);
  const currentDistrict = district && districts.includes(district) ? district : (districts.includes('Guntur') ? 'Guntur' : districts[0] || '');
  
  // Strictly fetches ONLY the villages belonging to this exact district, sorted in ascending order
  const villages = getVillages(currentCountry, currentState, currentDistrict);
  
  // Track whether user explicitly chose "Other (specify below)"
  const [isOtherSelected, setIsOtherSelected] = useState(village === OTHER_OPTION);
  const [customVillageInput, setCustomVillageInput] = useState(
    village && !villages.filter(v => v !== OTHER_OPTION).includes(village) && village !== OTHER_OPTION
      ? village
      : ''
  );

  // If village prop changes externally and is not in the district's village list, sync custom state
  useEffect(() => {
    if (village && villages.includes(village)) {
      setIsOtherSelected(village === OTHER_OPTION);
    } else if (village && !villages.includes(village) && village !== OTHER_OPTION) {
      setCustomVillageInput(village);
    }
  }, [village, villages]);

  const handleCountryChange = (newCountry: string) => {
    setIsOtherSelected(false);
    setCustomVillageInput('');

    const newStates = getStates(newCountry);
    const firstState = newStates.includes('Andhra Pradesh') ? 'Andhra Pradesh' : (newStates[0] || '');
    const newDistricts = getDistricts(newCountry, firstState);
    const firstDistrict = newDistricts.includes('Guntur') ? 'Guntur' : (newDistricts[0] || '');
    const newVillages = getVillages(newCountry, firstState, firstDistrict);
    const firstVillage = newVillages.filter(v => v !== OTHER_OPTION)[0] || OTHER_OPTION;

    onChange({
      country: newCountry,
      state: firstState,
      district: firstDistrict,
      village: firstVillage
    });
  };

  const handleStateChange = (newState: string) => {
    setIsOtherSelected(false);
    setCustomVillageInput('');

    const newDistricts = getDistricts(currentCountry, newState);
    const firstDistrict = newDistricts.includes('Guntur') ? 'Guntur' : (newDistricts[0] || '');
    const newVillages = getVillages(currentCountry, newState, firstDistrict);
    const firstVillage = newVillages.filter(v => v !== OTHER_OPTION)[0] || OTHER_OPTION;

    onChange({
      country: currentCountry,
      state: newState,
      district: firstDistrict,
      village: firstVillage
    });
  };

  const handleDistrictChange = (newDistrict: string) => {
    setIsOtherSelected(false);
    setCustomVillageInput('');

    const newVillages = getVillages(currentCountry, currentState, newDistrict);
    // Strictly pick the first village belonging to the newly selected district
    const firstVillage = newVillages.filter(v => v !== OTHER_OPTION)[0] || OTHER_OPTION;

    onChange({
      country: currentCountry,
      state: currentState,
      district: newDistrict,
      village: firstVillage
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

  // The active village displayed in the dropdown
  const selectedDropdownValue = isOtherSelected
    ? OTHER_OPTION
    : (village && villages.includes(village) ? village : (villages[0] || OTHER_OPTION));

  // The resolved village string for display
  const resolvedVillageName = isOtherSelected
    ? (customVillageInput.trim() || 'Custom Village')
    : (village && villages.includes(village) ? village : (villages[0] || 'Village'));

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        
        {/* 1. Country Selection (Ascending A-Z) */}
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

        {/* 2. State Selection (Ascending A-Z) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
            State / Region
          </label>
          <div className="relative">
            <Map className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              disabled={disabled || states.length === 0}
              value={currentState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all appearance-none cursor-pointer disabled:opacity-60"
            >
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

        {/* 3. District Selection (Ascending A-Z) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
            District / County
          </label>
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              disabled={disabled || districts.length === 0}
              value={currentDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all appearance-none cursor-pointer disabled:opacity-60"
            >
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

        {/* 4. Village Selection (Strictly for this District only, Ascending A-Z) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
            Village / Mandal / Town
          </label>
          <div className="relative">
            <Home className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              disabled={disabled || villages.length === 0}
              value={selectedDropdownValue}
              onChange={(e) => handleVillageSelect(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all appearance-none cursor-pointer disabled:opacity-60"
            >
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
      {isOtherSelected && (
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
          {[
            resolvedVillageName,
            currentDistrict || 'District',
            currentState || 'State',
            currentCountry || 'Country'
          ].filter(Boolean).join(', ')}
        </span>
      </div>
    </div>
  );
}
