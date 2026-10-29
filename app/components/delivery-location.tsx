'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import s from './delivery-location.module.css';
const storageKey='barwaqt-delivery-location';
const promptKey='barwaqt-location-prompted';
type Location={city:string;area:string};
function readLocation():Location|null {
 try {const value=JSON.parse(localStorage.getItem(storageKey)||'null');
  if(value&&typeof value.city==='string'&&typeof value.area==='string'&&value.city.trim()&&value.area.trim()&&value.city.length<=80&&value.area.length<=100)return value;
 } catch {}
 return null;
}
export default function DeliveryLocation(){
 const pathname=usePathname();
 const dialog=useRef<HTMLDialogElement>(null);
 const [location,setLocation]=useState<Location|null>(null);
 const [city,setCity]=useState('');
 const [area,setArea]=useState('');
 const [message,setMessage]=useState('');
 useEffect(()=>{
  const timer=setTimeout(()=>{
   const saved=readLocation();setLocation(saved);setCity(saved?.city||'');setArea(saved?.area||'');
   let prompted=false;try{prompted=sessionStorage.getItem(promptKey)==='yes';}catch{}
   if(!saved&&!prompted&&pathname==='/'){
    dialog.current?.showModal();try{sessionStorage.setItem(promptKey,'yes');}catch{}
   }
  },0);
  function sync(){setLocation(readLocation());}
  window.addEventListener('storage',sync);
  return()=>{clearTimeout(timer);window.removeEventListener('storage',sync);};
 },[pathname]);
 function open(){setCity(location?.city||'');setArea(location?.area||'');setMessage('');dialog.current?.showModal();}
 return <>
  <button className={s.trigger} type="button" onClick={open} aria-haspopup="dialog" aria-label={`Deliver to ${location?`${location.area}, ${location.city}`:'Set location'}`}>
   <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
   <span><small>Deliver to</small><b>{location?`${location.area}, ${location.city}`:'Set location'}</b></span>
  </button>
  <dialog ref={dialog} className={s.dialog} aria-labelledby="delivery-location-title">
   <button className={s.close} type="button" aria-label="Close location selector" onClick={()=>dialog.current?.close()}>×</button>
   <h2 id="delivery-location-title">Where should we deliver?</h2>
   <p>Set your city and area in Pakistan. You can change them anytime.</p>
   <form onSubmit={event=>{
    event.preventDefault();const next={city:city.trim(),area:area.trim()};if(!next.city||!next.area)return;
    setLocation(next);
    try{localStorage.setItem(storageKey,JSON.stringify(next));dialog.current?.close();}
    catch{setMessage('Location selected for this page. Your browser could not save it for future visits.');}
   }}>
    <label>City<input autoComplete="address-level2" required maxLength={80} value={city} onChange={event=>setCity(event.target.value)} placeholder="e.g. Lahore"/></label>
    <label>Area / neighbourhood<input autoComplete="address-level3" required maxLength={100} value={area} onChange={event=>setArea(event.target.value)} placeholder="e.g. Gulberg"/></label>
    <p className={s.hint}>You’ll confirm your full delivery address at checkout.</p>
    <button className={s.save} type="submit" disabled={!city.trim()||!area.trim()}>Save location</button>
    {message&&<p role="status">{message}</p>}
   </form>
  </dialog>
 </>;
}
