"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import s from "./delivery.module.css";
export type Point = { lat: number; lng: number };
export default function DeliveryMap({ point, onChange }: { point: Point; onChange: (point: Point) => void }) {
 const host = useRef<HTMLDivElement>(null);
 const map = useRef<LeafletMap|null>(null);
 const marker = useRef<Marker|null>(null);
 const callback = useRef(onChange);
 const initial = useRef(point);
 const [failed,setFailed] = useState(false);
 useEffect(()=>{callback.current=onChange;},[onChange]);
 useEffect(()=>{
  let cancelled=false;
  let observer:ResizeObserver|undefined;
  import("leaflet").then(L=>{
   if(cancelled || !host.current)return;
   const center:[number,number]=[initial.current.lat,initial.current.lng];
   const instance=L.map(host.current,{zoomControl:false}).setView(center,14);map.current=instance;
   L.control.zoom({position:"topright"}).addTo(instance);
   const tiles=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(instance);
   tiles.on("tileerror",()=>setFailed(true));
   const pin=L.marker(center,{draggable:true,icon:L.divIcon({className:s.mapMarker,html:'<span aria-hidden="true">●</span>',iconSize:[30,38],iconAnchor:[15,38]}),title:"Delivery location. Drag to move."}).addTo(instance);marker.current=pin;
   pin.bindTooltip("Your order will be delivered here",{permanent:true,direction:"top",offset:[0,-35]});
   pin.on("dragend",()=>{const p=pin.getLatLng();callback.current({lat:p.lat,lng:p.lng});});
   instance.on("click",(e:L.LeafletMouseEvent)=>{pin.setLatLng(e.latlng);callback.current({lat:e.latlng.lat,lng:e.latlng.lng});});
   observer=new ResizeObserver(()=>instance.invalidateSize());observer.observe(host.current);instance.invalidateSize();
  }).catch(()=>setFailed(true));
  return ()=>{cancelled=true;observer?.disconnect();map.current?.remove();map.current=null;marker.current=null;};
 },[]);
 useEffect(()=>{initial.current=point;if(map.current){map.current.setView([point.lat,point.lng],map.current.getZoom());marker.current?.setLatLng([point.lat,point.lng]);}},[point]);
 return <div className={s.mapWrap}><div ref={host} className={s.map} aria-label="Delivery location map"/>{failed&&<p className={s.mapWarning}>Map tiles could not load. You can still enter your address manually below.</p>}</div>;
}
