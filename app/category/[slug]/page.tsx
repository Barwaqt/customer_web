import {Suspense} from 'react';
import {CategoryRoute} from '../../components/original-routes';
import {BrandLoader} from '../../components/brand-loader';
async function Content({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <CategoryRoute key={slug} slug={slug}/>;}
export default function Page(props:{params:Promise<{slug:string}>}){return <Suspense fallback={<main aria-busy="true"><BrandLoader label="Loading category…"/></main>}><Content {...props}/></Suspense>;}
