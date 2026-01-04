import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { TargetLanguage } from '../types';
import { Globe } from 'lucide-react';

interface LanguageDropdownProps {
  selectedLanguage: TargetLanguage;
  onChange: (lang: TargetLanguage) => void;
  disabled?: boolean;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  selectedLanguage,
  onChange,
  disabled = false
}) => {
  return (
    <div className="relative w-full max-w-md">
      <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
        <Globe size={16} />
        Target Language
      </label>
      <div className="relative">
        <select
          value={selectedLanguage}
          onChange={(e) => onChange(e.target.value as TargetLanguage)}
          disabled={disabled}
          className="block w-full pl-3 pr-10 py-3 text-base border-slate-600 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-lg bg-slate-800 text-slate-200 shadow-sm appearance-none cursor-pointer hover:bg-slate-750 transition-colors disabled:opacity-50"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};