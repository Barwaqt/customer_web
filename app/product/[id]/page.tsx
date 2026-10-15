import {Suspense} from 'react';
import {ProductRoute} from '../../components/original-routes';
import {BrandLoader} from '../../components/brand-loader';
async function Content({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ProductRoute key={id} id={id}/>;}
export default function Page(props:{params:Promise<{id:string}>}){return <Suspense fallback={<main aria-busy="true"><BrandLoader label="Loading product…"/></main>}><Content {...props}/></Suspense>;}
