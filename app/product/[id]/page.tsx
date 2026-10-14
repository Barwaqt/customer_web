import {Suspense} from 'react';
import {ProductRoute} from '../../components/original-routes';
async function Content({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ProductRoute key={id} id={id}/>;}
export default function Page(props:{params:Promise<{id:string}>}){return <Suspense fallback={<p>Loading product…</p>}><Content {...props}/></Suspense>;}
