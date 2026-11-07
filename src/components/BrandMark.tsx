import type { BrandId } from "../lib/cards";

/** Compact inline-SVG network marks — drawn, not images. */
export function BrandMark({ brand, className }: { brand: BrandId | null; className?: string }) {
  const common = { className, "aria-hidden": true as const };
  switch (brand) {
    case "visa":
      return (
        <svg viewBox="0 0 64 22" {...common}>
          <text x="0" y="17" fontFamily="Space Grotesk, sans-serif" fontStyle="italic" fontWeight="700" fontSize="19" fill="#e8eeff" letterSpacing="1">
            VISA
          </text>
        </svg>
      );
    case "mastercard":
      return (
        <svg viewBox="0 0 56 34" {...common}>
          <circle cx="21" cy="17" r="14" fill="#eb001b" />
          <circle cx="35" cy="17" r="14" fill="#f79e1b" fillOpacity="0.92" />
          <path d="M28 6.2a14 14 0 0 1 0 21.6 14 14 0 0 1 0-21.6Z" fill="#ff5f00" />
        </svg>
      );
    case "amex":
      return (
        <svg viewBox="0 0 56 34" {...common}>
          <rect x="1" y="4" width="54" height="26" rx="4" fill="#2e77bc" />
          <text x="28" y="21.5" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="12" fill="#eaf6ff" letterSpacing="1">
            AMEX
          </text>
        </svg>
      );
    case "discover":
      return (
        <svg viewBox="0 0 84 22" {...common}>
          <text x="0" y="16" fontFamily="Space Grotesk, sans-serif" fontWeight="600" fontSize="13" fill="#f4f7fb">
            Discover
          </text>
          <circle cx="74" cy="11" r="8" fill="#f48120" />
        </svg>
      );
    case "jcb":
      return (
        <svg viewBox="0 0 56 34" {...common}>
          <rect x="2" y="5" width="16" height="24" rx="3" fill="#0e4c92" />
          <rect x="20" y="5" width="16" height="24" rx="3" fill="#be0028" />
          <rect x="38" y="5" width="16" height="24" rx="3" fill="#007b40" />
          <text x="10" y="21.5" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="10" fill="#fff">J</text>
          <text x="28" y="21.5" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="10" fill="#fff">C</text>
          <text x="46" y="21.5" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="10" fill="#fff">B</text>
        </svg>
      );
    case "diners":
      return (
        <svg viewBox="0 0 60 34" {...common}>
          <circle cx="17" cy="17" r="13" fill="#0079be" />
          <path d="M17 4a13 13 0 0 1 0 26Z" fill="#00587e" />
          <path d="M13 8.5v17M21 8.5v17" stroke="#dfe9f2" strokeWidth="1.6" />
          <text x="34" y="21" fontFamily="Space Grotesk" fontWeight="600" fontSize="9.5" fill="#e6edf5">
            Diners
          </text>
        </svg>
      );
    case "unionpay":
      return (
        <svg viewBox="0 0 80 30" {...common}>
          <path d="M4 4h20l-6 22H0Z" fill="#e21836" />
          <path d="M26 4h20l-6 22H22Z" fill="#00447c" />
          <path d="M48 4h20l-6 22H44Z" fill="#007b40" />
          <text x="52" y="20" fontFamily="Space Grotesk" fontWeight="600" fontSize="8.5" fill="#eaf2f8">
            UnionPay
          </text>
        </svg>
      );
    case "maestro":
      return (
        <svg viewBox="0 0 64 34" {...common}>
          <circle cx="24" cy="15" r="12" fill="#0099df" />
          <circle cx="40" cy="15" r="12" fill="#eb001b" fillOpacity="0.9" />
          <text x="32" y="32" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="600" fontSize="8" fill="#dfe9f2">
            Maestro
          </text>
        </svg>
      );
    case "mir":
      return (
        <svg viewBox="0 0 60 24" {...common}>
          <text x="0" y="17" fontFamily="Space Grotesk" fontWeight="700" fontSize="16" fill="#eef4f0">
            MIR
          </text>
          <path d="M38 6c6 0 10 3 12 8-4-2-8-3-12-3Z" fill="#4db45e" />
          <path d="M40 13h14c-1 4-5 7-10 7 3-2 4-4 4-7Z" fill="#28a3e8" />
        </svg>
      );
    case "rupay":
      return (
        <svg viewBox="0 0 70 24" {...common}>
          <text x="0" y="17" fontFamily="Space Grotesk" fontWeight="700" fontStyle="italic" fontSize="15" fill="#f0f6f2">
            Ru<tspan fill="#f2871d">Pay</tspan>
          </text>
          <path d="M52 8h14l-4 9h-9Z" fill="#199a4e" />
        </svg>
      );
    case "uatp":
      return (
        <svg viewBox="0 0 60 24" {...common}>
          <rect x="1" y="3" width="58" height="18" rx="4" fill="none" stroke="#c9b45a" strokeWidth="1.6" />
          <text x="30" y="16.5" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="11" fill="#e9dcab" letterSpacing="2">
            UATP
          </text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 28" {...common}>
          <rect x="2" y="2" width="36" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          <rect x="7" y="9" width="10" height="7" rx="1.5" fill="currentColor" opacity="0.45" />
          <path d="M22 11h11M22 15h7" stroke="currentColor" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
        </svg>
      );
  }
}
