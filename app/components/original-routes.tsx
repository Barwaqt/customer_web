'use client';
import {useCatalog,adapt} from './catalog-context';
import {useApi,type Product} from './commerce-client';
import CategoryListing from './category-listing';
import ProductDetails from './product-details';
import {ShopHeader,ShopFooter} from './shop-shell';
import {BrandLoader} from './brand-loader';
import {ErrorState} from './error-state';
import {Notfound} from './notfound';
export function CategoryRoute({slug}:{slug:string}){const data=useCatalog();const category=data.catalogCategories.find(c=>c.slug===slug);if(category)return <CategoryListing category={category}/>;return data.loading?<main style={{padding:40}}><BrandLoader label="Loading category…"/></main>:data.error?<main style={{padding:40}}><ErrorState variant="panel" message={data.error} onRetry={data.reload}/></main>:<Notfound/>;}
export function ProductRoute({id}:{id:string}){const data=useCatalog();const cached=data.products.find(p=>p.slug===id||p.id===id);const result=useApi<Product>(cached?null:'/catalog/products/'+id);if(cached)return <ProductDetails product={cached}/>;if(result.data)return <ProductDetails product={adapt(result.data)}/>;return (result.loading||data.loading)?<main style={{padding:40}}><BrandLoader label="Loading product…"/></main>:(result.error||data.error)?<main style={{padding:40}}><ErrorState variant="panel" message={result.error||data.error} onRetry={result.reload}/></main>:<Notfound/>;}
