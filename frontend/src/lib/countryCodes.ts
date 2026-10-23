export interface CountryCode {
  code: string;
  iso: string;
  name: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', iso: 'IN', name: 'India', flag: '🇮🇳' },
  { code: '+1', iso: 'US', name: 'United States', flag: '🇺🇸' },
  { code: '+44', iso: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', iso: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: '+61', iso: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: '+971', iso: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+966', iso: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+49', iso: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', iso: 'FR', name: 'France', flag: '🇫🇷' },
  { code: '+65', iso: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: '+60', iso: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+64', iso: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: '+880', iso: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+977', iso: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: '+94', iso: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+92', iso: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+81', iso: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: '+86', iso: 'CN', name: 'China', flag: '🇨🇳' },
  { code: '+55', iso: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: '+27', iso: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: '+234', iso: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', iso: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: '+39', iso: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: '+34', iso: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: '+31', iso: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+41', iso: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+46', iso: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: '+47', iso: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: '+45', iso: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: '+7', iso: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: '+62', iso: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', iso: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: '+84', iso: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+66', iso: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: '+82', iso: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: '+20', iso: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: '+52', iso: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: '+54', iso: 'AR', name: 'Argentina', flag: '🇦🇷' },
];

export function parsePhoneWithCountryCode(rawPhone?: string): { countryCode: string; digits: string } {
  if (!rawPhone || !rawPhone.trim()) {
    return { countryCode: '+91', digits: '' };
  }
  const clean = rawPhone.trim();
  // Find longest matching country code
  const match = COUNTRY_CODES.find(c => clean.startsWith(c.code));
  if (match) {
    const digits = clean.slice(match.code.length).trim().replace(/^[-\s]+/, '');
    return { countryCode: match.code, digits };
  }
  if (clean.startsWith('+')) {
    const parts = clean.split(/\s+/);
    if (parts.length > 1) {
      return { countryCode: parts[0], digits: parts.slice(1).join('') };
    }
  }
  return { countryCode: '+91', digits: clean };
}

export function formatPhoneWithCountryCode(countryCode: string, digits: string): string {
  const cleanDigits = digits.trim();
  if (!cleanDigits) return '';
  return `${countryCode} ${cleanDigits}`;
}
