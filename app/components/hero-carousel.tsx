'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useCallback, useEffect, useRef, useState} from 'react';
import {heroSlides, type HomeHero} from './homepage-types';
import home from './home-sections.module.css';
import styles from './hero-carousel.module.css';

export function HeroCarousel({value, variant}:{value:HomeHero;variant:'main'|'side'}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = heroSlides(value).filter(slide => slide.enabled);
  const label = variant === 'main' ? 'Featured collections' : 'Featured promotions';
  const multiple = slides.length > 1;
  const go = useCallback((index:number) => {
    const element = track.current;
    if (!element) return;
    const next = (index + slides.length) % slides.length;
    element.scrollTo({left:next * element.clientWidth, behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }, [slides.length]);
  useEffect(() => {
    if (!value.enabled || !multiple || paused) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') go(active + 1);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [active, go, multiple, paused, value.enabled]);
  if (!value.enabled || !slides.length) return null;
  return <section className={`${styles.carousel} ${variant === 'side' ? styles.side : ''}`} aria-label={label} aria-roledescription="carousel"
    onFocusCapture={()=>setPaused(true)}
    onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false);}}>
    <div ref={track} className={styles.track} tabIndex={multiple ? 0 : undefined} aria-label={`${label} slides`}
      onKeyDown={event => {if(event.key === 'ArrowRight' || event.key === 'ArrowLeft'){event.preventDefault();go(active + (event.key === 'ArrowRight' ? 1 : -1));}}}
      onScroll={event => {const element=event.currentTarget;setActive(Math.min(slides.length-1,Math.max(0,Math.round(element.scrollLeft/element.clientWidth))));}}>
      {slides.map((slide,index) => <div key={index} className={`${styles.slide} ${variant === 'main' ? home.heroMain : home.tech}`} role="group" aria-roledescription="slide" aria-label={`${index+1} of ${slides.length}`} inert={index !== active}>
        {variant === 'main' && <Image src={slide.image} alt={slide.alt} width={800} height={500} loading={index===0?'eager':'lazy'} unoptimized/>}
        <div className={variant === 'main' ? home.heroCopy : styles.sideCopy}>
          <span>{slide.eyebrow}</span>
          {variant === 'main' ? <h1>{slide.title}{slide.highlight&&<><br/><em>{slide.highlight}</em></>}</h1> : <h2>{slide.title}{slide.highlight&&<><br/>{slide.highlight}</>}</h2>}
          <p>{slide.description}</p><Link href={slide.href}>{slide.linkLabel}</Link>
        </div>
        {variant === 'side' && <Image src={slide.image} alt={slide.alt} width={400} height={250} loading={index===0?'eager':'lazy'} unoptimized/>}
      </div>)}
    </div>
    {multiple && <div className={styles.controls}>
      <div className={styles.dots}>{slides.map((slide,index)=><button type="button" key={index} aria-label={`Show slide ${index+1}: ${slide.title}`} aria-pressed={index===active} onClick={()=>go(index)}><span/></button>)}</div>
    </div>}
  </section>;
}
