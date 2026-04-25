import { RetailStore } from "@/types";

export const GOLD_PURITIES = [
  { value: 999, label: "999 (24K)", description: "Pure Gold" },
  { value: 916, label: "916 (22K)", description: "Standard Jewelry" },
  { value: 750, label: "750 (18K)", description: "Fine Jewelry" },
] as const;

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
] as const;

export const WEIGHT_UNITS = [
  { code: "g", name: "Grams", toGrams: 1 },
  { code: "oz", name: "Troy Ounce", toGrams: 31.1035 },
  { code: "kg", name: "Kilograms", toGrams: 1000 },
] as const;

export const TROY_OUNCE_IN_GRAMS = 31.1035;

export const RETAIL_STORES: RetailStore[] = [
  {
    id: "poh-kong",
    name: "Poh Kong",
    country: "Malaysia",
    website: "https://www.pohkong.com.my",
    spreadEstimate: "2-4%",
    locations: [
      { address: "Suria KLCC, Kuala Lumpur", city: "Kuala Lumpur", lat: 3.1588, lng: 101.7116 },
      { address: "Pavilion KL, Bukit Bintang", city: "Kuala Lumpur", lat: 3.1489, lng: 101.7131 },
      { address: "Mid Valley Megamall", city: "Kuala Lumpur", lat: 3.1181, lng: 101.6773 },
    ],
  },
  {
    id: "tomei",
    name: "Tomei",
    country: "Malaysia",
    website: "https://www.tomei.com.my",
    spreadEstimate: "2-5%",
    locations: [
      { address: "1 Utama Shopping Centre", city: "Petaling Jaya", lat: 3.1506, lng: 101.6154 },
      { address: "Sunway Pyramid", city: "Petaling Jaya", lat: 3.0716, lng: 101.6073 },
    ],
  },
  {
    id: "habib-jewels",
    name: "Habib Jewels",
    country: "Malaysia",
    website: "https://www.habib.com.my",
    spreadEstimate: "3-5%",
    locations: [
      { address: "KLCC, Kuala Lumpur", city: "Kuala Lumpur", lat: 3.1579, lng: 101.7117 },
      { address: "The Gardens Mall", city: "Kuala Lumpur", lat: 3.1175, lng: 101.6774 },
    ],
  },
  {
    id: "bullionstar",
    name: "BullionStar",
    country: "Singapore",
    website: "https://www.bullionstar.com",
    spreadEstimate: "1-2%",
    locations: [
      { address: "45 New Bridge Road", city: "Singapore", lat: 1.2872, lng: 103.8468 },
    ],
  },
  {
    id: "goldsilver-central",
    name: "GoldSilver Central",
    country: "Singapore",
    website: "https://www.goldsilvercentral.com.sg",
    spreadEstimate: "1-3%",
    locations: [
      { address: "2 Gemmill Lane", city: "Singapore", lat: 1.2812, lng: 103.8481 },
    ],
  },
  {
    id: "uob-gold",
    name: "UOB Gold",
    country: "Singapore",
    website: "https://www.uob.com.sg",
    spreadEstimate: "1-2%",
    locations: [
      { address: "80 Raffles Place, UOB Plaza", city: "Singapore", lat: 1.2845, lng: 103.8510 },
    ],
  },
];

export const TIMEFRAMES = [
  { value: "1H", label: "1H" },
  { value: "1D", label: "1D" },
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "ALL" },
] as const;

export const API_REFRESH_INTERVAL = 10000; // 10 seconds
export const CHART_REFRESH_INTERVAL = 30000; // 30 seconds
