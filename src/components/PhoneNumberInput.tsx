import React from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import './PhoneNumberInput.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  countryButtonClassName?: string;
  dropdownClassName?: string;
  heightPx?: number;
  fontSizePx?: number;
  dropdownFontSizePx?: number;
};

export default function PhoneNumberInput({
  value,
  onChange,
  defaultCountry = 've',
  placeholder,
  disabled,
  required,
  className,
  inputClassName,
  countryButtonClassName,
  dropdownClassName,
  heightPx = 48,
  fontSizePx = 16,
  dropdownFontSizePx = 14,
}: Props) {
  const themeVars = {
    ['--react-international-phone-height' as unknown as string]: `${heightPx}px`,
    ['--react-international-phone-font-size' as unknown as string]: `${fontSizePx}px`,
    ['--react-international-phone-dropdown-item-font-size' as unknown as string]: `${dropdownFontSizePx}px`,
    ['--react-international-phone-background-color' as unknown as string]: 'rgba(255,255,255,0.08)',
    ['--react-international-phone-text-color' as unknown as string]: 'rgba(255,255,255,0.92)',
    ['--react-international-phone-border-color' as unknown as string]: 'rgba(255,255,255,0.12)',

    ['--react-international-phone-country-selector-background-color' as unknown as string]: 'rgba(255,255,255,0.08)',
    ['--react-international-phone-country-selector-background-color-hover' as unknown as string]: 'rgba(249,115,22,0.10)',
    ['--react-international-phone-country-selector-border-color' as unknown as string]: 'rgba(255,255,255,0.12)',
    ['--react-international-phone-country-selector-arrow-color' as unknown as string]: 'rgba(255,255,255,0.6)',

    ['--react-international-phone-dropdown-item-background-color' as unknown as string]: '#0b0b0b',
    ['--react-international-phone-dropdown-item-text-color' as unknown as string]: 'rgba(255,255,255,0.92)',
    ['--react-international-phone-selected-dropdown-item-background-color' as unknown as string]: 'rgba(249,115,22,0.18)',
    ['--react-international-phone-selected-dropdown-item-text-color' as unknown as string]: 'rgba(255,255,255,0.98)',
    ['--react-international-phone-dropdown-item-dial-code-color' as unknown as string]: 'rgba(255,255,255,0.55)',
    ['--react-international-phone-selected-dropdown-item-dial-code-color' as unknown as string]: 'rgba(255,255,255,0.8)',
    ['--react-international-phone-dropdown-shadow' as unknown as string]: '0 12px 32px rgba(0,0,0,0.55)',

    ['--react-international-phone-border-radius' as unknown as string]: '0.5rem',
  } as React.CSSProperties;

  return (
    <div className={["ec-phone-input", className].filter(Boolean).join(' ')} style={themeVars}>
      <PhoneInput
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        inputProps={{ required }}
        className="w-full"
        inputClassName={
          inputClassName ??
          'w-full rounded-lg bg-white/10 border border-white/10 px-5 py-3 text-lg text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400/40 transition'
        }
        countrySelectorStyleProps={{
          buttonClassName:
            countryButtonClassName ??
            'rounded-lg bg-white/10 border border-white/10 px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400/40 transition',
          dropdownStyleProps: {
            className:
              dropdownClassName ??
              'bg-[#0b0b0b] border border-white/10 text-white shadow-xl rounded-lg overflow-hidden',
          },
        }}
      />
    </div>
  );
}
