'use client';
import {useCatalog,adapt} from './catalog-context';
import {useApi,type Product} from './commerce-client';
import CategoryListing from './category-listing';
import ProductDetails from './product-details';
import {ShopHeader,ShopFooter} from './shop-shell';
import {BrandLoader} from './brand-loader';
import {ErrorState} from './error-state';
export function CategoryRoute({slug}:{slug:string}){const data=useCatalog();const category=data.catalogCategories.find(c=>c.slug===slug);if(category)return <CategoryListing category={category}/>;return <><ShopHeader/><main style={{padding:40}}>{data.loading?<BrandLoader label="Loading category…"/>:data.error?<ErrorState variant="panel" message={data.error} onRetry={data.reload}/>:<p>Category not found.</p>}</main><ShopFooter/></>;}
export function ProductRoute({id}:{id:string}){const data=useCatalog();const cached=data.products.find(p=>p.slug===id||p.id===id);const result=useApi<Product>(cached?null:'/catalog/products/'+id);if(cached)return <ProductDetails product={cached}/>;if(result.data)return <ProductDetails product={adapt(result.data)}/>;return <><ShopHeader/><main style={{padding:40}}>{result.loading||data.loading?<BrandLoader label="Loading product…"/>:result.error?<ErrorState variant="panel" message={result.error} onRetry={result.reload}/>:<p>Product not found.</p>}</main><ShopFooter/></>;}
