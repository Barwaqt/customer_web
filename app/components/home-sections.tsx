'use client';
import Image from 'next/image';
import Link from 'next/link';
import type {ReactNode} from 'react';
import {useCatalog,type CatalogProduct} from './catalog-context';
import {BrandLogo} from './brand';
import {BrandLoader} from './brand-loader';
import {ErrorState} from './error-state';
import {useHomepage} from './homepage-content';
import type {HomeCategories,HomeProductRow} from './homepage-types';
import s from './home-sections.module.css';
import {HeroCarousel} from './hero-carousel';
import {heroSlides} from './homepage-types';
function Art({src,alt,eager=false}:{src:string;alt:string;eager?:boolean}){return <Image src={src} alt={alt} width={800} height={500} loading={eager?'eager':'lazy'} unoptimized/>;}
function CategorySection({value,variant}:{value:HomeCategories;variant:'top'|'popular'|'more'}){if(!value.enabled)return null;return <section className={variant==='top'?s.section:variant==='popular'?s.popular:s.more}><header><h2>{value.title}</h2><Link href={value.href}>{value.linkLabel}</Link></header><div className={variant==='top'?s.categories:undefined}>{value.items.map((item,i)=><Link key={i} href={'/category/'+item.categorySlug}><span style={variant==='top'?{background:['#fff2e8','#edf9ec','#eef3ff','#fff0f6'][i%4],color:['#d57c20','#098a42','#4f68d9','#b84482'][i%4]}:undefined}>{item.icon}</span>{item.label}</Link>)}</div></section>;}
export function HomeSections({card}:{card:(p:CatalogProduct)=>ReactNode}){const data=useCatalog(),homepage=useHomepage();const content=homepage.document?.content;if(!content)return homepage.error?<ErrorState title={homepage.error} onRetry={homepage.reload}/>:<BrandLoader label="Loading homepage…"/>;
 const pick=(row:HomeProductRow)=>{const products=data.catalogProducts;if(row.productIds.length)return row.productIds.flatMap(id=>{const p=products.find(p=>p.id===id);return p?[p]:[];}).slice(0,6);if(row.categorySlug==='all-products')return products.slice(0,6);const category=data.catalogCategories.find(c=>c.slug===row.categorySlug);return products.filter(p=>category?.productIds.includes(p.id)).slice(0,6);};
 const {heroMain:main,heroSide:side,featured,flash,banners,upgrade,benefits,searches}=content;
 const showMain=main.enabled&&heroSlides(main).some(slide=>slide.enabled),showSide=side.enabled&&heroSlides(side).some(slide=>slide.enabled);
 return <div className={s.home}>{homepage.error&&<ErrorState variant="inline" title="Unable to refresh homepage content." onRetry={homepage.reload} retryLabel="Retry"/>}{(showMain||showSide)&&<section className={s.hero} style={!showMain||!showSide?{gridTemplateColumns:'1fr'}:undefined}>{showMain&&<HeroCarousel key={'main-'+homepage.document?.version} value={main} variant="main"/>}{showSide&&<HeroCarousel key={'side-'+homepage.document?.version} value={side} variant="side"/>}</section>}

 <CategorySection value={content.topCategories} variant="top"/>
 {featured.enabled&&<section className={s.section}><header><div><h2>{featured.title} {featured.badge&&<small>{featured.badge}</small>}</h2><p>{featured.description}</p></div><Link href={featured.href}>{featured.linkLabel}</Link></header><div className={s.featured}>{featured.items.map((item,i)=><Link key={i} href={item.href}><Art src={item.image} alt={item.alt}/><h3>{item.title}</h3><p>{item.description}</p><span>{item.linkLabel}</span></Link>)}{featured.promos.map((item,i)=><div key={i} className={`${s.promo} ${i%2?s.lime:''}`}><small>{item.eyebrow}</small><h3 style={{whiteSpace:'pre-line'}}>{item.title}</h3><p>{item.description}</p><Link href={item.href}>{item.linkLabel}</Link></div>)}</div></section>}
 {flash.enabled&&<section className={s.flash}><header><div><h2>{flash.title}</h2><p>{flash.description}</p></div><Link href={'/category/'+flash.categorySlug}>{flash.linkLabel}</Link></header><div className={s.products}>{pick(flash).map(card)}</div></section>}
 {banners.enabled&&<section className={s.banners}>{banners.items.map((item,i)=><Link href={item.href} key={i}><Art src={item.image} alt={item.alt}/><div><small>{item.description}</small><h2>{item.title}</h2><span>{item.linkLabel}</span></div></Link>)}</section>}
 <CategorySection value={content.popularCategories} variant="popular"/>
 <div id="products">{content.productRows.filter(row=>row.enabled).map((row,i)=><section className={s.section} key={i}><header><div><h2>{row.title}</h2><p>{row.description}</p></div><Link href={'/category/'+row.categorySlug}>{row.linkLabel}</Link></header><div className={s.products}>{pick(row).map(card)}</div></section>)}</div>
 <CategorySection value={content.moreCategories} variant="more"/>
 {upgrade.enabled&&<section className={s.upgrade}><Art src={upgrade.image} alt={upgrade.alt}/><div><span>{upgrade.eyebrow}</span><h2>{upgrade.title}{upgrade.highlight&&<><br/>{upgrade.highlight}</>}</h2><p>{upgrade.description}</p><Link href={upgrade.href}>{upgrade.linkLabel}</Link></div></section>}
 {benefits.enabled&&<section className={s.benefits}>{benefits.items.map((item,i)=><div key={i}><span>{item.icon}</span><div><b>{item.title}</b><p>{item.description}</p></div></div>)}</section>}
 {searches.enabled&&<section className={s.searches}><h2>{searches.title}</h2><div>{(searches.terms.length?searches.terms:Array.from(new Set([...data.categories.flatMap(c=>[c.title,...c.labels]),...data.catalogProducts.slice(0,60).map(p=>p.name)]))).map((name,i)=><Link key={i} href={`/?q=${encodeURIComponent(name)}`}>{name}</Link>)}</div></section>}</div>;
}
export function HomeFooter(){const value=useHomepage().document?.content.footer;if(!value)return null;return <footer className={s.footer}><div className={s.footerGrid}><Link href="/" aria-label="Barwaqt home"><BrandLogo/></Link>{value.columns.map((column,i)=><div key={i}><h3>{column.title}</h3>{column.links.map((link,j)=><Link key={j} href={link.href}>{link.label}</Link>)}</div>)}<div><h3>{value.title}</h3><p>{value.description}</p><Link className={s.footerCta} href={value.href}>{value.linkLabel}</Link></div></div><div className={s.copyright}><span>{value.copyright}</span><span>{value.paymentLabel}</span></div></footer>;}
