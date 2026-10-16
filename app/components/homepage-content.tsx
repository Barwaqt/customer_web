'use client';
import {createContext,useCallback,useContext,useEffect,useState} from 'react';
import {api} from './commerce-client';
import type {HomeDocument} from './homepage-types';
type State={document?:HomeDocument;error:string;reload:()=>void};
const Context=createContext<State>({error:'',reload:()=>{}});
export function HomepageProvider({children}:{children:React.ReactNode}){const [document,setDocument]=useState<HomeDocument>(),[error,setError]=useState(''),[version,setVersion]=useState(0);const reload=useCallback(()=>setVersion(v=>v+1),[]);
 useEffect(()=>{let live=true;api<HomeDocument>('/catalog/homepage').then(data=>{if(live){setDocument(data);setError('');}}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[version]);
 useEffect(()=>{const refresh=()=>{if(window.document.visibilityState==='visible')reload();};window.addEventListener('focus',refresh);window.document.addEventListener('visibilitychange',refresh);const timer=setInterval(refresh,60000);return()=>{window.removeEventListener('focus',refresh);window.document.removeEventListener('visibilitychange',refresh);clearInterval(timer);};},[reload]);
 return <Context.Provider value={{document,error,reload}}>{children}</Context.Provider>;
}
export function useHomepage(){return useContext(Context);}
