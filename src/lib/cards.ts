// ─────────────────────────────────────────────────────────────
// CardBench core — pure, offline structural validation.
// No network calls. Nothing leaves the browser.
// ─────────────────────────────────────────────────────────────

export type BrandId =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "jcb"
  | "diners"
  | "unionpay"
  | "maestro"
  | "mir"
  | "rupay"
  | "uatp";

interface PrefixRule {
  lo: string;
  hi?: string; // inclusive range, same length as lo
}

export interface BrandDef {
  id: BrandId;
  name: string;
  prefixes: PrefixRule[];
  lengths: number[];
  cvv: number[]; // accepted cvv lengths
  gaps: "amex" | "diners" | "std";
  /** card face gradient stops */
  face: [string, string];
  accent: string;
  iinLabel: string; // human readable IIN ranges
}

export const BRANDS: BrandDef[] = [
  {
    id: "visa",
    name: "Visa",
    prefixes: [{ lo: "4" }],
    lengths: [13, 16, 19],
    cvv: [3],
    gaps: "std",
    face: ["#10265c", "#1c3f8f"],
    accent: "#7ea4ff",
    iinLabel: "4",
  },
  {
    id: "mastercard",
    name: "Mastercard",
    prefixes: [
      { lo: "51", hi: "55" },
      { lo: "2221", hi: "2720" },
    ],
    lengths: [16],
    cvv: [3],
    gaps: "std",
    face: ["#3a1114", "#8f2430"],
    accent: "#ffb38a",
    iinLabel: "51–55 · 2221–2720",
  },
  {
    id: "amex",
    name: "American Express",
    prefixes: [{ lo: "34" }, { lo: "37" }],
    lengths: [15],
    cvv: [4],
    gaps: "amex",
    face: ["#0e3a3f", "#1f6d70"],
    accent: "#8fe8df",
    iinLabel: "34 · 37",
  },
  {
    id: "discover",
    name: "Discover",
    prefixes: [
      { lo: "6011" },
      { lo: "644", hi: "649" },
      { lo: "65" },
    ],
    lengths: [16, 17, 18, 19],
    cvv: [3],
    gaps: "std",
    face: ["#4a2a10", "#c25e1e"],
    accent: "#ffd3a1",
    iinLabel: "6011 · 644–649 · 65",
  },
  {
    id: "jcb",
    name: "JCB",
    prefixes: [{ lo: "3528", hi: "3589" }],
    lengths: [16, 17, 18, 19],
    cvv: [3],
    gaps: "std",
    face: ["#152642", "#31568f"],
    accent: "#a8c4f2",
    iinLabel: "3528–3589",
  },
  {
    id: "diners",
    name: "Diners Club",
    prefixes: [
      { lo: "300", hi: "305" },
      { lo: "309" },
      { lo: "36" },
      { lo: "38" },
      { lo: "39" },
    ],
    lengths: [14, 15, 16, 17, 18, 19],
    cvv: [3],
    gaps: "diners",
    face: ["#2c2f36", "#585f6e"],
    accent: "#cfd6e4",
    iinLabel: "300–305 · 309 · 36 · 38–39",
  },
  {
    id: "unionpay",
    name: "UnionPay",
    prefixes: [{ lo: "62" }],
    lengths: [16, 17, 18, 19],
    cvv: [3, 0],
    gaps: "std",
    face: ["#123a63", "#1f6fb8"],
    accent: "#b8dcff",
    iinLabel: "62",
  },
  {
    id: "maestro",
    name: "Maestro",
    prefixes: [
      { lo: "5018" },
      { lo: "5020" },
      { lo: "5038" },
      { lo: "5893" },
      { lo: "6304" },
      { lo: "6759" },
      { lo: "6761", hi: "6763" },
    ],
    lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    cvv: [3],
    gaps: "std",
    face: ["#0f2b4a", "#2857a4"],
    accent: "#9fc4f0",
    iinLabel: "5018 · 5020 · 5038 · 5893 · 6304 · 6759–6763",
  },
  {
    id: "mir",
    name: "Mir",
    prefixes: [{ lo: "2200", hi: "2204" }],
    lengths: [16, 17, 18, 19],
    cvv: [3],
    gaps: "std",
    face: ["#0d3d33", "#1e7a5f"],
    accent: "#9ff0d4",
    iinLabel: "2200–2204",
  },
  {
    id: "rupay",
    name: "RuPay",
    prefixes: [{ lo: "81" }, { lo: "82" }, { lo: "353" }, { lo: "356" }],
    lengths: [16],
    cvv: [3],
    gaps: "std",
    face: ["#1d4023", "#3f8a4d"],
    accent: "#b6ecbf",
    iinLabel: "81–82 · 353 · 356",
  },
  {
    id: "uatp",
    name: "UATP",
    prefixes: [{ lo: "1" }],
    lengths: [15],
    cvv: [0, 3],
    gaps: "std",
    face: ["#2e2a12", "#7a6a1f"],
    accent: "#f0e2a0",
    iinLabel: "1",
  },
];

export function matchBrand(digits: string): BrandDef | null {
  if (!digits) return null;
  for (const brand of BRANDS) {
    for (const rule of brand.prefixes) {
      const len = rule.lo.length;
      if (digits.length >= len) {
        const slice = digits.slice(0, len);
        if (slice >= rule.lo && slice <= (rule.hi ?? rule.lo)) return brand;
      }
    }
  }
  return null;
}

/** brands whose IIN *could* still match as the user types */
export function candidateBrands(digits: string): BrandDef[] {
  if (!digits) return [];
  const out: BrandDef[] = [];
  for (const brand of BRANDS) {
    const hit = brand.prefixes.some((rule) => {
      const len = rule.lo.length;
      if (digits.length < len) return rule.lo.startsWith(digits);
      const slice = digits.slice(0, len);
      return slice >= rule.lo && slice <= (rule.hi ?? rule.lo);
    });
    if (hit) out.push(brand);
  }
  return out;
}

// ── Luhn (ISO/IEC 7812-1) ────────────────────────────────────

export interface LuhnStep {
  digit: number;
  doubled: boolean;
  value: number; // after doubling / −9
  isCheck: boolean;
}

export interface LuhnResult {
  steps: LuhnStep[]; // left → right display order
  sum: number;
  mod: number;
  valid: boolean;
  /** the check digit that would make `digits` valid */
  suggestedCheck: number;
}

function luhnSumOnly(digits: string): number {
  const n = digits.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const d = Number(digits[i]);
    const doubled = (n - 1 - i) % 2 === 1;
    let v = d;
    if (doubled) {
      v = d * 2;
      if (v > 9) v -= 9;
    }
    sum += v;
  }
  return sum;
}

export function luhnAnalyze(digits: string): LuhnResult {
  const n = digits.length;
  const steps: LuhnStep[] = [];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const d = Number(digits[i]);
    const posFromRight = n - 1 - i;
    const doubled = posFromRight % 2 === 1;
    let v = d;
    if (doubled) {
      v = d * 2;
      if (v > 9) v -= 9;
    }
    sum += v;
    steps.push({ digit: d, doubled, value: v, isCheck: posFromRight === 0 });
  }
  return {
    steps,
    sum,
    mod: sum % 10,
    valid: n > 0 && sum % 10 === 0,
    suggestedCheck: checkDigitFor(digits.slice(0, -1) || "0"),
  };
}

/** check digit to append to `partial` so the full number passes Luhn */
export function checkDigitFor(partial: string): number {
  return (10 - (luhnSumOnly(partial + "0") % 10)) % 10;
}

// ── formatting ───────────────────────────────────────────────

export function groupDigits(digits: string, brand: BrandDef | null): string[] {
  if (brand?.gaps === "amex" && digits.length <= 15) {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean);
  }
  if (brand?.gaps === "diners" && digits.length <= 14) {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 14)].filter(Boolean);
  }
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) groups.push(digits.slice(i, i + 4));
  return groups;
}

export function formatCard(digits: string, brand: BrandDef | null): string {
  return groupDigits(digits, brand).join(" ");
}

// ── expiry ───────────────────────────────────────────────────

export type ExpiryStatus = "empty" | "short" | "bad-month" | "past" | "far-future" | "ok";

export interface ExpiryResult {
  status: ExpiryStatus;
  label: string;
}

export function validateExpiry(raw: string, now = new Date()): ExpiryResult {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return { status: "empty", label: "no expiry entered" };
  if (digits.length < 4) return { status: "short", label: "enter MM/YY" };
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2, 4));
  if (month < 1 || month > 12) return { status: "bad-month", label: `month "${digits.slice(0, 2)}" doesn't exist` };
  const nowIdx = now.getFullYear() * 12 + now.getMonth();
  const expIdx = year * 12 + (month - 1);
  if (expIdx < nowIdx) return { status: "past", label: `expired ${month.toString().padStart(2, "0")}/${year % 100}` };
  if (expIdx - nowIdx > 12 * 15) return { status: "far-future", label: "unusually far in the future" };
  return { status: "ok", label: `valid thru ${month.toString().padStart(2, "0")}/${year % 100}` };
}

// ── CVV ──────────────────────────────────────────────────────

export interface CvvResult {
  ok: boolean;
  label: string;
  expected: string;
}

export function validateCvv(cvv: string, brand: BrandDef | null): CvvResult {
  const expected = brand ? brand.cvv.filter((n) => n > 0).map(String).join(" or ") : "3 (4 for Amex)";
  if (!cvv) return { ok: false, label: "no CVV entered", expected };
  if (!brand) return { ok: cvv.length === 3 || cvv.length === 4, label: `${cvv.length} digits`, expected };
  if (brand.cvv.includes(0) && cvv.length === 0) return { ok: true, label: "optional on this network", expected };
  const ok = brand.cvv.includes(cvv.length);
  return {
    ok,
    label: ok ? `${cvv.length} digits — matches ${brand.name}` : `${cvv.length} digits — ${brand.name} uses ${expected}`,
    expected,
  };
}

// ── combined result (used by bulk checker) ───────────────────

export interface NumberCheck {
  raw: string;
  digits: string;
  brand: BrandDef | null;
  luhn: LuhnResult;
  lengthOk: boolean;
  lengthLabel: string;
  verdict: "valid-format" | "bad-luhn" | "bad-length" | "unknown-iin";
}

export function checkNumber(raw: string): NumberCheck {
  const digits = raw.replace(/\D/g, "");
  const brand = matchBrand(digits);
  const luhn = luhnAnalyze(digits);
  const lengthOk = brand ? brand.lengths.includes(digits.length) : digits.length >= 12 && digits.length <= 19;
  const lengthLabel = brand
    ? `${digits.length}/${brand.lengths.join("·")} digits`
    : `${digits.length} digits (ISO 7812: 12–19)`;
  let verdict: NumberCheck["verdict"] = "valid-format";
  if (!brand) verdict = "unknown-iin";
  else if (!lengthOk) verdict = "bad-length";
  if (!luhn.valid) verdict = "bad-luhn";
  return { raw, digits, brand, luhn, lengthOk, lengthLabel, verdict };
}

// ── published sandbox test numbers (PSP documentation) ──────

export interface TestCard {
  brandId: BrandId;
  number: string;
  note: string;
}

export const TEST_CARDS: TestCard[] = [
  { brandId: "visa", number: "4242424242424242", note: "Stripe docs — generic Visa" },
  { brandId: "visa", number: "4111111111111111", note: "Classic sandbox Visa" },
  { brandId: "visa", number: "4000056655665556", note: "Visa debit (Stripe)" },
  { brandId: "mastercard", number: "5555555555554444", note: "Classic sandbox MC" },
  { brandId: "mastercard", number: "2223003122003222", note: "MC 2-series (Stripe)" },
  { brandId: "mastercard", number: "5105105105105100", note: "Braintree docs MC" },
  { brandId: "amex", number: "378282246310005", note: "Stripe / Braintree Amex" },
  { brandId: "amex", number: "371449635398431", note: "Stripe Amex" },
  { brandId: "discover", number: "6011111111111117", note: "Stripe / Braintree Discover" },
  { brandId: "discover", number: "6011000990139424", note: "Braintree Discover" },
  { brandId: "jcb", number: "3530111333300000", note: "Stripe JCB" },
  { brandId: "jcb", number: "3566002020360505", note: "Braintree JCB" },
  { brandId: "diners", number: "3056930009020004", note: "Stripe Diners 14-digit" },
  { brandId: "diners", number: "36227206271667", note: "Braintree Diners" },
  { brandId: "unionpay", number: "6200000000000005", note: "Stripe UnionPay" },
  { brandId: "maestro", number: "6759649826438453", note: "Maestro (Stripe/Adyen)" },
];
