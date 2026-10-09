"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import data from "../shop-data.json";
import { categoryHref } from "../categories";
import s from "./category-navigation.module.css";
const departments=["Electronics","Beauty & Fragrance","Home & Kitchen","Grocery","Men’s Fashion","Women’s Fashion","Mom & Baby","Toys","Sports & Outdoors"];
const kitchen=[
 ["Kitchen & dining","Cookware","Storage & organisation","Dinnerware & serveware","Accessories","Cutlery","Coffee & tea","Bakeware","Drinkware"],
 ["Furniture","Sofas & couches","Coffee tables","Gaming chairs","Bean bags","Desks & desk chairs","TV & media units","Storage & cabinets","Chairs"],
 ["Tools & home improvement","Power tools","Hand tools","Cleaning supplies","Home organisation","Laundry care","Safety & security","Electrical & lighting","Paints & wall supplies"],
 ["Home decor","Lighting","Home fragrance","Mats & carpets","Furniture covers","Mirrors","Window treatments","Decorative pillows","Decor accents"],
 ["Bath & bedding","Sheets & Pillowcases","Shower heads","Comforter sets","Duvet covers","Towels","Pillows","Bath robes","Bath organizers"],
 ["Home appliances","Air fryers","Coffee makers","Ovens & toasters","Irons & steamers","Blenders","Vacuums","Electric kettles","Mixers"],
 ["Large appliances","Refrigerators","Washing machines","Air conditioners","Cooking ranges","Dishwashers","Water dispensers","Dryers","Freezers"]
];
const brands=["Prestige","Royal Ford","Tefal","Pan","Home Box","Black Decker","Danube Home","Bath & Body Works","Apex"];
export default function CategoryNavigation(){
 const [active,setActive]=useState<string|null>(null);
 const root=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement|null>(null);
 const id=useId();
 useEffect(()=>{if(!active)return;function key(e:KeyboardEvent){if(e.key==="Escape"){setActive(null);trigger.current?.focus();}}function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node))setActive(null);}document.addEventListener("keydown",key);document.addEventListener("pointerdown",outside);return()=>{document.removeEventListener("keydown",key);document.removeEventListener("pointerdown",outside);};},[active]);
 const home=active==="Home & Kitchen";
 const matched=data.categories.find(c=>categoryHref(c.title)===categoryHref(active||""));
 const groups=home?kitchen:active==="All Categories"?data.categories.map(c=>[c.title,...c.labels]):[[active||"Categories",...(matched?.labels||["Shop all","Latest arrivals","Everyday essentials"])]];
 function href(group:string,label?:string){if(!label)return categoryHref(group);if(home){const parent=group==="Furniture"?"Furniture":group.includes("appliances")?"Home appliances":"Home & kitchen";return categoryHref(label,parent)==="/category/all-products"?categoryHref(parent):categoryHref(label,parent);}return categoryHref(label,group);}
 return <div className={s.root} ref={root}>
 <nav className={s.nav} aria-label="Shop departments"><button className={s.all} aria-expanded={active==="All Categories"} aria-controls={id} onClick={e=>{trigger.current=e.currentTarget;setActive(active==="All Categories"?null:"All Categories");}}>All Categories <span>⌄</span></button>{departments.map(label=><div className={s.department} key={label}><Link onMouseEnter={()=>setActive(label)} href={categoryHref(label)} onNavigate={()=>setActive(null)}>{label}</Link><button aria-label={`Browse ${label}`} aria-controls={id} aria-expanded={active===label} onClick={e=>{trigger.current=e.currentTarget;setActive(active===label?null:label);}}>⌄</button></div>)}</nav>
 {active&&<><button className={s.backdrop} aria-label="Close categories" onClick={()=>setActive(null)}/><section id={id} className={s.panel} aria-label={`${active} categories`} onMouseLeave={()=>setActive(null)}><div className={s.heading}><Link href={categoryHref(active)} onNavigate={()=>setActive(null)}>{active} <span>View all →</span></Link><button aria-label="Close category menu" onClick={()=>{setActive(null);trigger.current?.focus();}}>×</button></div><div className={s.content}><div className={`${s.columns} ${!home?s.general:""}`}>{groups.map(([title,...labels])=><div key={title}><Link className={s.title} href={href(title)} onNavigate={()=>setActive(null)}>{title}</Link>{labels.map(label=><Link key={label} href={href(title,label)} onNavigate={()=>setActive(null)}>{label}</Link>)}</div>)}</div>{home&&<Link href={categoryHref("Home & kitchen")} className={s.promo} onNavigate={()=>setActive(null)}><Image src="/shop/category-3-0.webp" alt="Explore home and kitchen essentials" fill sizes="300px" unoptimized/><div><span>BEST SELLER COLLECTION</span><h3>Make more of your kitchen</h3><p>Explore cookware and everyday essentials</p><strong>TRANSFORM YOUR KITCHEN →</strong></div></Link>}</div>{home&&<div className={s.brands}><h3>TOP BRANDS</h3><div>{brands.map(brand=><Link key={brand} href={`/?q=${encodeURIComponent(brand)}`} onNavigate={()=>setActive(null)}><strong>{brand}</strong><span>{brand}</span></Link>)}</div></div>}</section></>}
 </div>;
}
