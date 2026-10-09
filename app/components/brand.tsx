import Image from "next/image";
import Link from "next/link";
import styles from "./brand.module.css";
export function BrandLogo() { return <Image src="/brand/logo.svg" alt="Barwaqt" width={84} height={55} loading="eager" unoptimized/>; }
export function BrandAnnouncement() { return <div className={styles.announcement}><div><span className={styles.badge}>FAST</span><span>Everyday essentials, <strong>right on time.</strong></span></div><Link href="/profile">My account →</Link></div>; }
