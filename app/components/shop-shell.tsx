"use client";
import Link from "next/link";
import { AuthButton } from "./auth-provider";
import { useShop } from "./shop-store";
import s from "../page.module.css";
import c from "../commerce.module.css";
function HeaderIcon({name}:{name:"cart"|"search"|"pin"}) {
 return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name==="cart"?<><path d="M2 3h3l3 13h11l3-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/></>:name==="search"?<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>:<><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>}</svg>;
}
export function ShopHeader() {
 const { cart } = useShop();
 const count = Object.values(cart).reduce((a,b)=>a+b,0);
 return <><header className={s.header}><Link href="/" className={s.logo} aria-label="noon home">noon</Link><div className={s.location}><HeaderIcon name="pin"/><span><small>Deliver to</small><b>Dubai, UAE</b></span></div><form action="/" className={s.search}><button aria-label="Search"><HeaderIcon name="search"/></button><input type="search" name="q" aria-label="Search products" placeholder="What are you looking for?"/></form><AuthButton/><Link href="/checkout" className={s.headerAction} aria-label={`Cart, ${count} items`}><HeaderIcon name="cart"/> <span>Cart</span>{count>0&&<b>{count}</b>}</Link></header><nav className={s.nav} aria-label="Shop departments">{["Electronics","Beauty & Fragrance","Home & Kitchen","Grocery","Men’s Fashion","Women’s Fashion","Mom & Baby","Toys","Sports & Outdoors"].map((label,i)=><Link key={label} href={`/#${["row-1","category-2","category-3","row-6","category-1","category-0","category-13","category-14","category-17"][i]}`}>{label}</Link>)}</nav></>;
}
export function ShopFooter(){return <footer className={c.footer}><div className={c.help}><div><h2>We’re always here to help</h2><p>Discover more of what you love.</p></div><Link href="/">Continue shopping →</Link></div><div className={c.footerColumns}>{[["Electronics","Mobiles","Tablets","Laptops","Cameras"],["Fashion","Women’s fashion","Men’s fashion","Kids’ fashion","Watches"],["Home and Kitchen","Appliances","Furniture","Cookware","Home decor"],["Beauty","Fragrances","Skincare","Haircare","Personal care"],["Baby & Toys","Feeding","Baby transport","Toys","Baby food"]].map((group,i)=><div key={group[0]}><h3>{group[0]}</h3>{group.slice(1).map(label=><Link key={label} href={`/#${["row-1","category-0","category-3","category-2","category-13"][i]}`}>{label}</Link>)}</div>)}</div><div className={c.legal}>© 2026 noon. All rights reserved.<span>VISA　 Mastercard　 Apple Pay</span></div></footer>}
