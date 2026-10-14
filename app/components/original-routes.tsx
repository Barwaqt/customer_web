'use client';
import {useCatalog,adapt} from './catalog-context';
import {useApi,type Product} from './commerce-client';
import CategoryListing from './category-listing';
import ProductDetails from './product-details';
import {ShopHeader,ShopFooter} from './shop-shell';
export function CategoryRoute({slug}:{slug:string}){const data=useCatalog();const category=data.catalogCategories.find(c=>c.slug===slug);if(category)return <CategoryListing category={category}/>;return <><ShopHeader/><main style={{padding:40}}>{data.loading?'Loading category…':data.error||'Category not found'}{data.error&&<button onClick={data.reload}>Retry</button>}</main><ShopFooter/></>;}
export function ProductRoute({id}:{id:string}){const result=useApi<Product>('/catalog/products/'+id);if(result.data)return <ProductDetails product={adapt(result.data)}/>;return <><ShopHeader/><main style={{padding:40}}>{result.loading?'Loading product…':result.error}<button onClick={result.reload}>Retry</button></main><ShopFooter/></>;}
