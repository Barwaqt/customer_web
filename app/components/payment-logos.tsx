import Image from "next/image";

export function EasypaisaLogo() {
  return <Image src="/payment/easypaisa.png" alt="" width={266} height={266} unoptimized />;
}

export function JazzCashLogo() {
  return <Image src="/payment/jazzcash.png" alt="" width={480} height={377} unoptimized />;
}

export function CardLogo() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#E8EEFB"/><rect x="4.5" y="8" width="23" height="16" rx="2.5" fill="#2B57C4"/><rect x="4.5" y="11.5" width="23" height="3.2" fill="#16307A"/><rect x="8" y="18.5" width="7" height="2.8" rx="0.9" fill="#F4C430"/></svg>;
}

export function CashLogo() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#E7F6EC"/><rect x="4" y="9" width="24" height="14" rx="2.2" fill="#1F9D55"/><circle cx="16" cy="16" r="4.2" fill="none" stroke="#ffffff" strokeWidth="2"/><circle cx="7.6" cy="16" r="1.4" fill="#ffffff"/><circle cx="24.4" cy="16" r="1.4" fill="#ffffff"/></svg>;
}
