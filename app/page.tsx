"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
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
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = data.products.reduce((a, p) => a + p.price * (cart[p.id] || 0), 0);
  function add(p: Product) { setCart(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 })); setNotice(`${p.name} added to cart`); }
  function openPanel(p: typeof panel) { setPanel(p); dialog.current?.showModal(); }
  function toggleSave(p: Product) { setSaved(c => c.includes(p.id) ? c.filter(id => id !== p.id) : [...c, p.id]); }
  function search(value: string) { setQuery(value.trim()); setInput(value); requestAnimationFrame(() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })); }
  function card(p: Product) {
    return <article className={s.product} key={p.id}>
      <div className={s.productArt}><span className={s.best}>Best Seller</span><button className={`${s.save} ${saved.includes(p.id) ? s.saved : ""}`} aria-label={`${saved.includes(p.id) ? "Remove" : "Save"} ${p.name}`} aria-pressed={saved.includes(p.id)} onClick={() => toggleSave(p)}><Icon name="heart"/></button><button className={s.imageButton} onClick={() => router.push(`/product/${p.id}`)} aria-label={`View ${p.name}`}><Art src={p.image} alt={p.name}/></button><button className={s.add} onClick={() => add(p)} aria-label={`Add ${p.name} to cart`}>+</button></div>
      <div className={s.productBody}><button className={s.productName} onClick={() => router.push(`/product/${p.id}`)}>{p.name}</button><p className={s.rating}>★ <b>{p.rating}</b> <span>(1.2K)</span></p><p className={s.price}><small>AED</small> {money(p.price)} <del>{money(p.old)}</del> <span>19%</span></p><p className={s.stock}>↗ Selling out fast</p><span className={s.express}>express</span><span className={s.tomorrow}>Tomorrow</span></div>
    </article>;
  }
  function row(group: number) {
    const products = data.products.filter(p => p.group === group);
    return <section className={s.section} key={group} id={`row-${group}`}><div className={s.sectionHeading}><h2>{products[0].section}</h2><button onClick={() => search(products[0].section.includes("mobiles") ? "iPhone" : products[0].name.split(" ")[0])}>VIEW ALL</button></div><div className={s.productRow}>{products.map(card)}</div></section>;
  }
  const matching = data.products.filter(p => `${p.name} ${p.section}`.toLowerCase().includes(query.toLowerCase()));
  const nav = ["Electronics", "Beauty & Fragrance", "Home & Kitchen", "Grocery", "Men’s Fashion", "Women’s Fashion", "Mom & Baby", "Toys", "Kids’ Fashion", "Sports & Outdoors", "Health & Nutrition"];
  const navTargets = ["row-1", "category-2", "category-3", "row-6", "category-1", "category-0", "category-13", "category-14", "category-8", "category-17", "category-9"];
  return <>
    <a className={s.skip} href="#main">Skip to content</a>
    <header className={s.header}><Link className={s.logo} href="/" aria-label="noon home">noon</Link><div className={s.location}><Icon name="pin"/><span><small>Deliver to</small><b>Dubai, UAE</b></span></div><form className={s.search} onSubmit={e => { e.preventDefault(); search(input); }}><button aria-label="Search"><Icon name="search"/></button><input type="search" aria-label="Search products" placeholder="What are you looking for?" value={input} onChange={e => setInput(e.target.value)}/></form><AuthButton/><button className={s.headerAction} onClick={() => openPanel("wishlist")}><Icon name="heart"/><span>Wishlist</span>{saved.length > 0 && <b>{saved.length}</b>}</button><button className={s.headerAction} onClick={() => openPanel("cart")}><Icon name="cart"/><span>Cart</span>{count > 0 && <b>{count}</b>}</button></header>
    <nav className={s.nav} aria-label="Shop departments">{nav.map((n, i) => <a key={n} href={`#${navTargets[i]}`} onClick={() => setQuery("")}>{n}</a>)}<span className={s.delivery}>Get <b>Free Delivery</b> with <strong>noon one ›</strong></span></nav>
    <main id="main" className={s.main}>
      {!query && <><div className={s.hero}><Art src="/shop/pride.webp" alt="Our pride. Our UAE." eager className={s.pride}/><div className={s.heroGrid}><a href="#row-0"><Art src="/shop/hero.webp" alt="GoPro Mission 1 Pro — 14 stops of dynamic range" eager/></a><a href="#category-0"><Art src="/shop/fashion.webp" alt="Every style. One place. Shop women’s and men’s fashion" eager/></a></div></div>
      <div className={s.quick}>{data.quick.map((name, i) => <a key={name} href={i === 0 ? "#spotlight" : i === 6 ? "#category-0" : i === 7 ? "#category-1" : i === 4 ? "#category-2" : "#products"}><Art src={`/shop/quick-${i}.webp`} alt=""/><span>{name}</span></a>)}</div>
      <div className={s.features}><section className={s.reasons}><h2>More reasons to shop</h2><div className={s.reasonGrid}>{[ ["Grocery", "Top deals, wide selection", "#row-6"], ["Bestsellers", "Shop our top picks", "#products"], ["New arrivals", "The latest, curated for you", "#row-1"], ["Mahali", "Discover everyday essentials", "#category-6"] ].map(([title, description, link], i) => <a href={link} key={title}><Art src={`/shop/reason-${i}.webp`} alt=""/><div><h3>{title}</h3><p>{description}</p></div></a>)}</div></section>
      <section className={s.mega}><div className={s.megaHeading}><h2>Mega Deals</h2><span>Limited-time offers</span><a href="#spotlight">Shop deals</a></div><div className={s.megaGrid}>{data.products.filter(p => p.group === -1).map((p, i) => <article key={p.id}><span className={s.dealLabel}>{["Mobile deals", "Heating Pad deals", "Notebook Laptop deals", "Home Care deals"][i]}</span><div className={s.megaArt}><Art src={p.image} alt={p.name}/><button className={s.add} onClick={() => add(p)} aria-label={`Add ${p.name} to cart`}>+</button></div><p>{p.name}</p><strong><del>{money(p.old)}</del> AED {money(p.price)}</strong></article>)}</div></section>
      <section className={s.focus}><h2>In focus</h2><a href="#row-4"><Art src="/shop/focus-0.webp" alt="A breeze of freshness — discover fragrances"/></a><a href="#category-2"><Art src="/shop/focus-1.webp" alt="Refresh your blonde this summer with care"/></a></section></div></>}
      <div id="products">{query ? <section className={s.section}><div className={s.sectionHeading}><h1>Results for “{query}” <small>({matching.length})</small></h1><button onClick={() => { setQuery(""); setInput(""); }}>CLEAR SEARCH</button></div>{matching.length ? <div className={s.results}>{matching.map(card)}</div> : <div className={s.empty}><h2>No products found</h2><p>Try searching for iPhone, camera, TV, or fragrance.</p></div>}</section> : <>{row(0)}<a className={s.banner} href="#row-4"><Art src="/shop/freshness.webp" alt="A breeze of freshness — shop fragrances"/></a><section className={`${s.section} ${s.spotlight}`} id="spotlight"><h2>Spotlight <span>⚡ Deals</span></h2><div className={s.productRow}>{[data.products[12],data.products[2],data.products[24],data.products[30],data.products[6],data.products[38]].map(card)}</div></section>{[1,2,3,4,5].map(row)}<a className={s.banner} href="#category-18"><Art src="/shop/vehicles.webp" alt="Searching for a vehicle? Explore automotive essentials"/></a>{row(6)}{data.categories.map((category, i) => <section className={s.categorySection} id={`category-${i}`} key={category.title}><h2>{category.title}</h2><div className={s.categoryGrid}>{category.labels.map((label, j) => <figure key={label}><Art src={`/shop/category-${i}-${j}.webp`} alt={label}/><figcaption>{label}</figcaption></figure>)}</div></section>)}<div className={s.banner}><Art src="/shop/emaar.webp" alt="Emaar — discover exceptional waterfront living"/></div></>}</div>
      <section className={s.about}><h2>Shop your everyday favourites, all in one place</h2><p>Discover electronics, fashion, beauty, home essentials and more. Explore the latest arrivals, find your favourite brands, and make more of every day with great deals across our collections.</p><details><summary>Explore more at noon</summary><p>From a new phone to a fresh look for your home, browse our departments to find what you need. Use search to explore the featured products, save your favourites to your wishlist, or add them to your cart.</p></details></section>
    </main>
    <footer className={s.footer}><div className={s.support}><div><h2>We’re always here to help</h2><p>Find your next favourite in our collections.</p></div><a href="#main">Back to top ↑</a></div><div className={s.footerLinks}>{[ ["ELECTRONICS", "Mobiles", "Tablets", "Laptops", "Home appliances", "Cameras"], ["FASHION", "Women’s fashion", "Men’s fashion", "Kids’ fashion", "Watches", "Eyewear"], ["HOME & KITCHEN", "Kitchen & dining", "Bedding", "Furniture", "Home decor", "Tools"], ["BEAUTY", "Fragrances", "Makeup", "Haircare", "Skincare", "Personal care"] ].map((list, i) => <div key={list[0]}><h3>{list[0]}</h3>{list.slice(1).map(label => <a href={`#${["row-1","category-0","category-3","category-2"][i]}`} onClick={() => setQuery("")} key={label}>{label}</a>)}</div>)}</div><div className={s.copyright}><span>© 2026 noon. All rights reserved.</span><span>Visa · Mastercard · Apple Pay · Cash on delivery</span></div></footer>
    <div className={s.notice} role="status">{notice && <><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></>}</div>
    <dialog ref={dialog} className={s.dialog} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><div className={s.dialogHeading}><h2>{panel === "cart" ? `Your cart (${count})` : panel === "wishlist" ? "Your wishlist" : "Product details"}</h2><button onClick={() => dialog.current?.close()} aria-label="Close dialog">×</button></div>
      {<>{data.products.filter(p => panel === "cart" ? cart[p.id] > 0 : saved.includes(p.id)).map(p => <div className={s.cartItem} key={p.id}><Art src={p.image} alt={p.name}/><div><h3>{p.name}</h3><b>AED {money(p.price)}</b>{panel === "cart" ? <div className={s.quantity}><button aria-label={`Decrease quantity of ${p.name}`} onClick={() => setCart(c => ({ ...c, [p.id]: Math.max(0, c[p.id] - 1) }))}>−</button><span>{cart[p.id]}</span><button aria-label={`Increase quantity of ${p.name}`} onClick={() => add(p)}>+</button></div> : <div className={s.quantity}><button onClick={() => add(p)}>Add to cart</button><button onClick={() => toggleSave(p)}>Remove</button></div>}</div></div>)}{(panel === "cart" ? count === 0 : saved.length === 0) && <div className={s.empty}><Icon name={panel === "cart" ? "cart" : "heart"}/><h3>{panel === "cart" ? "Your cart is empty" : "Save something you love"}</h3><p>{panel === "cart" ? "Explore the deals and add your favourites." : "Tap the heart on any product to save it here."}</p></div>}{panel === "cart" && count > 0 && <div className={s.total}><b>Subtotal</b><strong>AED {money(total)}</strong><Link href="/checkout" className={s.primary}>VIEW CART &amp; CHECKOUT</Link></div>}</>}
    </dialog>
  </>;
}
