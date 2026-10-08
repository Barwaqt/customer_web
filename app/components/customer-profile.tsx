"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthButton, useAccount, type CustomerDetails } from "./auth-provider";
import { useShop } from "./shop-store";
import data from "../shop-data.json";
import s from "./profile.module.css";

const groups = [
  { title: "", items: ["Orders", "Returns", "noon Credits", "Wishlist"] },
  { title: "MY ACCOUNT", items: ["Profile", "Addresses", "Payments", "Warranty Claims", "Gift Cards", "Digital Cards"] },
  { title: "OTHERS", items: ["Notifications", "Security Settings", "QR Code"] },
];
const descriptions: Record<string, [string, string]> = {
  Orders: ["No orders yet", "Your orders will appear here when order history is connected. Demo checkout does not place real orders."],
  Returns: ["No returns to track", "There are no purchased items eligible for a return in this demo."],
  "noon Credits": ["AED 0.00", "No credits have been added to this demo account."],
  Addresses: ["Your delivery addresses", "You can enter a delivery address during checkout. Saved-address management is not connected yet."],
  Payments: ["No saved payment methods", "Payments are not connected in this demo. No card details are collected."],
  "Warranty Claims": ["No warranty claims", "Claims will appear here for eligible purchases once order services are connected."],
  "Gift Cards": ["No gift cards", "Gift-card purchases and redemption are not connected in this demo."],
  "Digital Cards": ["No digital cards", "Your digital cards will appear here when the service is available."],
  Notifications: ["You’re all caught up", "There are no account notifications in this demo."],
  "Security Settings": ["Demo account security", "This is a local interface preview. Password changes and verified account security require an authentication backend."],
  "QR Code": ["Account QR code", "A personal QR code will be available when verified accounts are connected."],
};
function NavIcon({ name }: { name: string }) {
 const path = name === "Wishlist" ? "M12 20 4 12C-2 5 7 1 12 7c5-6 14-2 8 5Z" : name === "Profile" ? "M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0" : name === "Addresses" ? "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 7v5" : name === "Sign out" ? "M12 2v10M6 5a9 9 0 1 0 12 0" : name === "Notifications" ? "M5 17h14l-2-3V9a5 5 0 0 0-10 0v5ZM10 21h4" : name === "Security Settings" ? "m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6ZM9 12l2 2 4-4" : "M4 4h16v16H4ZM8 4v7l4-2 4 2V4";
 return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="#fff584" stroke="none"/><path d={path}/></svg>;
}
export default function CustomerProfile() {
 const account = useAccount();
 return <ProfileForm key={account.identity || "guest"}/>;
}
function ProfileForm() {
 const { profile, saveProfile, identity, signedIn, signOut, open } = useAccount();
 const { cart, saved, setSaved } = useShop();
 const router = useRouter();
 const [draft, setDraft] = useState<CustomerDetails>(profile);
 const [active, setActive] = useState("Profile");
 const [message, setMessage] = useState("");
 const [error, setError] = useState("");
 const [phone, setPhone] = useState(profile.phone);
 const [phoneError, setPhoneError] = useState("");
 const phoneDialog = useRef<HTMLDialogElement>(null);
 const helpDialog = useRef<HTMLDialogElement>(null);
 const count = Object.values(cart).reduce((sum,n)=>sum+n,0);
 const email = identity.includes("@") ? identity : "";
 const loginPhone = identity && !identity.includes("@") ? identity : "";
 const completion = Math.round(([email || loginPhone, ...Object.values(profile)].filter(Boolean).length / 8) * 100);
 const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
 const wishlist = data.products.filter(p=>saved.includes(p.id));
 function today() { return new Date().toISOString().slice(0,10); }
 function change(field: keyof CustomerDetails, value: string) {setDraft(previous=>({...previous,[field]:value}));setMessage("");setError("");}
 function choose(name: string) { setActive(name);setMessage(""); }
 function choices(label: string, field: "gender" | "tourist", values: string[]) {return <fieldset className={s.choices}><legend>{label}</legend>{field==="tourist"&&<p>Helps personalise your offers</p>}<div>{values.map(value=><label key={value} className={draft[field]===value?s.chosen:""}><input type="radio" name={field} value={value} checked={draft[field]===value} onChange={()=>change(field,value)}/>{value}</label>)}</div></fieldset>;}
 return <><header className={s.header}><div className={s.headerInner}><Link href="/" className={s.logo} aria-label="noon home">noon</Link><span className={s.accountLabel}>account</span><form action="/" className={s.search}><button aria-label="Search">⌕</button><input type="search" name="q" aria-label="Search products" placeholder="What are you looking for?"/></form><AuthButton/><Link href="/checkout" className={s.cart}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 3h3l3 13h11l3-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/></svg><span>Cart</span>{count>0&&<b>{count}</b>}</Link></div></header>
 <main className={s.layout}><aside className={s.sidebar}><section className={s.welcome}><h2>Hala{profile.first ? `, ${profile.first}` : ""} !</h2><p className={s.email}>{email || loginPhone || "Welcome to your demo profile"}</p><p className={s.progressLabel}>Profile Completion <strong>{completion}%</strong></p><progress aria-label="Profile completion" max={100} value={completion}/><button className={s.membership} onClick={()=>{choose("noon Credits");}}>Discover <b>noon <i>one</i></b><span>›</span></button></section>{groups.map(group=><div key={group.title || "shopping"}>{group.title&&<p className={s.groupTitle}>{group.title}</p>}<nav className={s.navGroup} aria-label={group.title || "Shopping account"}>{group.items.map(name=><button key={name} className={active===name?s.active:""} aria-current={active===name?"page":undefined} onClick={()=>choose(name)}><NavIcon name={name}/><span>{name}</span>{name==="Wishlist"&&<small>{saved.length} items</small>}</button>)}</nav></div>)}<button className={s.signOut} onClick={()=>{signOut();router.push("/");}}><NavIcon name="Sign out"/>Sign out</button></aside>
 <section className={s.content}><h1>{active}</h1><p className={s.subtitle}>{active==="Profile"?"View & Update Your Personal and Contact Information":active==="Wishlist"?"All your favourites, saved in one place":"Manage your account"}</p>{active==="Profile"?<form onSubmit={e=>{e.preventDefault();if(draft.birthday&&draft.birthday>today()){setError("Birthday cannot be in the future.");return;}const cleaned={...draft,first:draft.first.trim(),last:draft.last.trim()};saveProfile(cleaned);setDraft(cleaned);setMessage("Profile updated for this demo session.");setError("");}}><section className={s.card}><h2>Contact Information</h2><div className={s.contactGrid}><label className={s.field}>Email<input aria-label="Email" value={email} readOnly placeholder="Log in to add your email" className={s.readonly}/>{!signedIn&&<button type="button" className={s.inlineLink} onClick={open}>Log in to your demo account</button>}</label><div className={s.field}><span>Phone number</span><button type="button" className={s.phoneButton} onClick={()=>{setPhone(draft.phone || loginPhone);setPhoneError("");phoneDialog.current?.showModal();}}><span>{draft.phone || loginPhone}</span><b>{draft.phone || loginPhone?"Edit":"+Add"}</b></button><small>Contact number for your profile. Not verified in this demo.</small></div></div></section><section className={`${s.card} ${s.personal}`}><h2>Personal Information</h2><div className={s.formGrid}><label className={s.field}>First name<div className={s.editField}><input autoComplete="given-name" aria-label="First name" value={draft.first} onChange={e=>change("first",e.target.value)} maxLength={80}/><span aria-hidden="true">✎</span></div></label><label className={s.field}>Last name<div className={s.editField}><input autoComplete="family-name" aria-label="Last name" value={draft.last} onChange={e=>change("last",e.target.value)} maxLength={80}/><span aria-hidden="true">✎</span></div></label><label className={s.field}>Birthday<input type="date" aria-label="Birthday" value={draft.birthday} onFocus={e=>{e.currentTarget.max=today();}} min="1900-01-01" onChange={e=>change("birthday",e.target.value)}/><small>Used to personalise your experience</small></label>{choices("Gender","gender",["Male","Female"])}<label className={s.field}>Nationality<select aria-label="Nationality" value={draft.nationality} onChange={e=>change("nationality",e.target.value)}><option value="">Select Nationality</option>{["Emirati","Pakistani","Indian","Bangladeshi","Filipino","Egyptian","Saudi","British","American","Canadian","Australian","Other","Prefer not to say"].map(value=><option key={value}>{value}</option>)}</select></label>{choices("Are you a tourist in UAE?","tourist",["Yes","No"])}</div></section><p className={s.error} role="alert">{error}</p><button className={s.save} disabled={!dirty} type="submit">UPDATE PROFILE</button><p className={s.success} role="status">{message}</p><p className={s.demo}>Demo profile · Changes last for this session and reset on refresh.</p></form>:active==="Wishlist"?<section className={s.card}>{wishlist.length?<div className={s.wishlist}>{wishlist.map(p=><article key={p.id}><Link href={`/product/${p.id}`}><Image src={p.image} alt={p.name} width={220} height={240} unoptimized/><h2>{p.name}</h2><p>AED {p.price.toFixed(2)}</p></Link><button onClick={()=>setSaved(previous=>previous.filter(id=>id!==p.id))} aria-label={`Remove ${p.name} from wishlist`}>Remove</button></article>)}</div>:<div className={s.empty}><NavIcon name="Wishlist"/><h2>Your wishlist is empty</h2><p>Tap the heart on a product to save it here.</p><Link href="/">Explore products →</Link></div>}</section>:<section className={`${s.card} ${s.empty}`}><NavIcon name={active}/><h2>{descriptions[active][0]}</h2><p>{descriptions[active][1]}</p><Link href={active==="Addresses"?"/checkout":"/"}>{active==="Addresses"?"Go to checkout":"Continue shopping"} →</Link></section>}</section></main>
 <button className={s.help} onClick={()=>helpDialog.current?.showModal()}>ⓘ Need Help?</button><dialog ref={phoneDialog} className={s.dialog} aria-labelledby="phone-heading"><button className={s.close} aria-label="Close phone dialog" onClick={()=>phoneDialog.current?.close()}>×</button><h2 id="phone-heading">{draft.phone?"Edit":"Add"} phone number</h2><p>Include the country code, for example +971501234567.</p><form onSubmit={e=>{e.preventDefault();const value=phone.replace(/[\s()-]/g,"");if(!/^\+[1-9][0-9]{8,14}$/.test(value)){setPhoneError("Enter a valid number with a country code (9–15 digits).");return;}change("phone",value);phoneDialog.current?.close();}}><label className={s.field}>Phone number<input aria-label="Phone number" type="tel" autoComplete="tel" value={phone} onChange={e=>{setPhone(e.target.value);setPhoneError("");}} placeholder="+971501234567" required maxLength={24}/></label><p className={s.error} role="alert">{phoneError}</p><button className={s.save}>SAVE PHONE NUMBER</button><small>Save your profile to keep this change for the current session.</small></form></dialog><dialog ref={helpDialog} className={s.dialog} aria-labelledby="help-heading"><button className={s.close} aria-label="Close help" onClick={()=>helpDialog.current?.close()}>×</button><h2 id="help-heading">How can we help?</h2><p>Edit your personal details, add a phone number, then select Update Profile. Your wishlist is shared with the storefront.</p><p>This is a demo. Profile changes reset when you refresh; no account services or customer-support messaging are connected.</p><button className={s.save} onClick={()=>helpDialog.current?.close()}>GOT IT</button></dialog></>;
}
