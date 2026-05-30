// Country list for the area "country" picker. We keep only ISO 3166-1 alpha-2
// codes here and derive the display names at runtime via Intl.DisplayNames, so
// we don't hand-maintain ~200 localized names. Stored value is the code.

// Common travel-destination codes first would be nice, but a plain sorted list
// keeps it predictable; the picker is searchable.
export const COUNTRY_CODES: string[] = [
  "AD","AE","AF","AG","AL","AM","AO","AR","AT","AU","AZ","BA","BB","BD","BE",
  "BF","BG","BH","BI","BJ","BN","BO","BR","BS","BT","BW","BY","BZ","CA","CD",
  "CF","CG","CH","CI","CL","CM","CN","CO","CR","CU","CV","CY","CZ","DE","DJ",
  "DK","DM","DO","DZ","EC","EE","EG","ER","ES","ET","FI","FJ","FM","FR","GA",
  "GB","GD","GE","GH","GM","GN","GQ","GR","GT","GW","GY","HN","HR","HT","HU",
  "ID","IE","IL","IN","IQ","IR","IS","IT","JM","JO","JP","KE","KG","KH","KI",
  "KM","KN","KP","KR","KW","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU",
  "LV","LY","MA","MC","MD","ME","MG","MH","MK","ML","MM","MN","MR","MT","MU",
  "MV","MW","MX","MY","MZ","NA","NE","NG","NI","NL","NO","NP","NR","NZ","OM",
  "PA","PE","PG","PH","PK","PL","PT","PW","PY","QA","RO","RS","RU","RW","SA",
  "SB","SC","SD","SE","SG","SI","SK","SL","SM","SN","SO","SR","SS","ST","SV",
  "SY","SZ","TD","TG","TH","TJ","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
  "UA","UG","US","UY","UZ","VA","VC","VE","VN","VU","WS","YE","ZA","ZM","ZW",
];

// Localized country name for a code (German by default). Falls back to the code
// if the runtime/Intl has no name for it.
export function countryName(code: string, locale = "de"): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

export type CountryOption = { code: string; name: string };

// Full option list, sorted by localized name. Computed once per locale.
const cache = new Map<string, CountryOption[]>();
export function countryOptions(locale = "de"): CountryOption[] {
  const hit = cache.get(locale);
  if (hit) return hit;
  const list = COUNTRY_CODES.map((code) => ({
    code,
    name: countryName(code, locale),
  })).sort((a, b) => a.name.localeCompare(b.name, locale));
  cache.set(locale, list);
  return list;
}
