import {Suspense} from 'react';
import Vendors from '../../components/live-vendors';
async function Content({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Vendors key={id} id={id}/>;}
export default function Page(props:{params:Promise<{id:string}>}){return <Suspense fallback={<p>Loading store…</p>}><Content {...props}/></Suspense>;}
