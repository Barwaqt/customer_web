import {Suspense} from 'react';
import {CategoryRoute} from '../../components/original-routes';
async function Content({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <CategoryRoute key={slug} slug={slug}/>;}
export default function Page(props:{params:Promise<{slug:string}>}){return <Suspense fallback={<p>Loading category…</p>}><Content {...props}/></Suspense>;}
