"use client";

import Image from "next/image";
import { HomeSections, HomeFooter } from "./components/home-sections";
import Link from "next/link";
import CategoryNavigation from "./components/category-navigation";
import { BrandLogo, BrandAnnouncement } from "./components/brand";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "./components/shop-store";
import data from "./shop-data.json";
import { AuthButton } from "./components/auth-provider";
import s from "./page.module.css";

type Product = (typeof data.products)[number];
const money = (n: number) => n.toLocaleString("en-AE");
function Art({ src, alt, className, eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return <Image src={src} alt={alt} width={600} height={400} className={className} loading={eager ? "eager" : "lazy"} unoptimized />;
}
function Icon({ name }: { name: "search" | "cart" | "heart" | "user" | "pin" }) {
  const paths = { search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>, cart: <><path d="M2 3h3l3 13h11l3-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/></>, heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>, user: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="9" r="3"/><path d="M5 19c1-6 13-6 14 0"/></>, pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></> };
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
const subscribeToLocation = (listener: () => void) => { window.addEventListener("popstate", listener); return () => window.removeEventListener("popstate", listener); };
const getSearch = () => new URLSearchParams(window.location.search).get("q") || "";
export default function Home() {
  const query = useSyncExternalStore(subscribeToLocation, getSearch, () => "");
  return <Storefront key={query} initialQuery={query}/>;
}
function Storefront({ initialQuery }: { initialQuery: string }) {
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const { cart, setCart, saved, setSaved } = useShop();
  const router = useRouter();
  const [panel, setPanel] = useState<"cart" | "wishlist">("cart");
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
 // Cached routes can hide a page without removing its native modal from the top layer.
 useEffect(() => {
  const element = dialog.current;
  return () => element?.close();
 }, []);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = data.products.reduce((a, p) => a + p.price * (cart[p.id] || 0), 0);
  function add(p: Product) { setCart(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 })); setNotice(`${p.name} added to cart`); }
  function openPanel(p: typeof panel) { setPanel(p); dialog.current?.showModal(); }
  function toggleSave(p: Product) { setSaved(c => c.includes(p.id) ? c.filter(id => id !== p.id) : [...c, p.id]); }
  function search(value: string) { setQuery(value.trim()); setInput(value); requestAnimationFrame(() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })); }
  function card(p: Product) {
    return <article className={s.product} key={p.id}>
      <div className={s.productArt}><span className={s.best}>{Math.round((1-p.price/p.old)*100)}% OFF</span><button className={`${s.save} ${saved.includes(p.id) ? s.saved : ""}`} aria-label={`${saved.includes(p.id) ? "Remove" : "Save"} ${p.name}`} aria-pressed={saved.includes(p.id)} onClick={() => toggleSave(p)}><Icon name="heart"/></button><button className={s.imageButton} onClick={() => router.push(`/product/${p.id}`)} aria-label={`View ${p.name}`}><Art src={p.image} alt={p.name}/></button></div>
      <div className={s.productBody}><button className={s.productName} onClick={() => router.push(`/product/${p.id}`)}>{p.name}</button><p className={s.rating}>★ <b>{p.rating}</b></p><p className={s.price}><small>AED</small> {money(p.price)} <del>{money(p.old)}</del> <span>{Math.round((1-p.price/p.old)*100)}%</span></p><button className={s.cartCta} onClick={()=>add(p)} aria-label={`Add ${p.name} to cart`}>ϟ Add to cart</button></div>
    </article>;
  }
  const matching = data.products.filter(p => `${p.name} ${p.section}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <a className={s.skip} href="#main">Skip to content</a>
    <BrandAnnouncement/><header className={s.header}><Link className={s.logo} href="/" aria-label="Barwaqt home"><BrandLogo/></Link><div className={s.location}><Icon name="pin"/><span><small>Deliver to</small><b>Dubai, UAE</b></span></div><form className={s.search} onSubmit={e => { e.preventDefault(); search(input); }}><button aria-label="Search"><Icon name="search"/></button><input type="search" aria-label="Search products" placeholder="What are you looking for?" value={input} onChange={e => setInput(e.target.value)}/></form><AuthButton/><Link className={s.headerAction} href="/wishlist"><Icon name="heart"/><span>Wishlist</span>{saved.length > 0 && <b>{saved.length}</b>}</Link><button className={s.headerAction} onClick={() => openPanel("cart")}><Icon name="cart"/><span>Cart</span>{count > 0 && <b>{count}</b>}</button></header>
    <CategoryNavigation/>
    <main id="main" className={s.main}>
{query?<section className={s.section} id="products"><div className={s.sectionHeading}><h1>Results for “{query}” <small>({matching.length})</small></h1><button onClick={()=>{setQuery("");setInput("");}}>CLEAR SEARCH</button></div>{matching.length?<div className={s.results}>{matching.map(card)}</div>:<div className={s.empty}><h2>No products found</h2><p>Try another product or category.</p></div>}</section>:<HomeSections card={card}/>}
    </main><HomeFooter/>
    <div className={s.notice} role="status">{notice && <><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></>}</div>
    <dialog ref={dialog} className={s.dialog} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><div className={s.dialogHeading}><h2>{panel === "cart" ? `Your cart (${count})` : panel === "wishlist" ? "Your wishlist" : "Product details"}</h2><button onClick={() => dialog.current?.close()} aria-label="Close dialog">×</button></div>
      {<>{data.products.filter(p => panel === "cart" ? cart[p.id] > 0 : saved.includes(p.id)).map(p => <div className={s.cartItem} key={p.id}><Art src={p.image} alt={p.name}/><div><h3>{p.name}</h3><b>AED {money(p.price)}</b>{panel === "cart" ? <div className={s.quantity}><button aria-label={`Decrease quantity of ${p.name}`} onClick={() => setCart(c => ({ ...c, [p.id]: Math.max(0, c[p.id] - 1) }))}>−</button><span>{cart[p.id]}</span><button aria-label={`Increase quantity of ${p.name}`} onClick={() => add(p)}>+</button></div> : <div className={s.quantity}><button onClick={() => add(p)}>Add to cart</button><button onClick={() => toggleSave(p)}>Remove</button></div>}</div></div>)}{(panel === "cart" ? count === 0 : saved.length === 0) && <div className={s.empty}><Icon name={panel === "cart" ? "cart" : "heart"}/><h3>{panel === "cart" ? "Your cart is empty" : "Save something you love"}</h3><p>{panel === "cart" ? "Explore the deals and add your favourites." : "Tap the heart on any product to save it here."}</p></div>}{panel === "cart" && count > 0 && <div className={s.total}><b>Subtotal</b><strong>AED {money(total)}</strong><Link href="/checkout" onNavigate={() => dialog.current?.close()} className={s.primary}>VIEW CART &amp; CHECKOUT</Link></div>}</>}
    </dialog>
  </>;
}
