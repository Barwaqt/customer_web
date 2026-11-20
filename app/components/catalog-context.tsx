'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import reference from '../shop-data.json';
import {api,type Product as ApiProduct,type Category as ApiCategory} from './commerce-client';
import {useShop} from './shop-store';

export type CatalogVariant={id:string;name:string;priceMinor:number;stock:number;image?:string|null;options?:Record<string,string>};
export type CatalogProduct=(typeof reference.products)[number]&{stock:number;description:string;vendorId:string;vendorName:string;vendorSlug?:string;slug?:string;vendorLogo?:string;vendorExpressMinutes?:number;vendorStandardDays:number;categoryId:string;images:string[];attributes:Record<string,string>;variants?:CatalogVariant[];sourceId?:string};
export type CatalogCategory={id:string;slug:string;title:string;parent:string;image:string;productIds:string[]};

export type CategoryTreeNode = CatalogCategory & {
  children: CategoryTreeNode[];
};

export type NavCategory = {
  id: string;
  slug: string;
  title: string;
  labels: string[];
  images: string[];
  productIds: string[];
  subcategories: CatalogCategory[];
  children?: CategoryTreeNode[];
};

const groups:Record<string,number>={'electronics':1,'grocery':6,'beauty':12,'beauty-and-fragrance':12,'home-and-kitchen':13,'womens-fashion':10,'mens-fashion':11,'baby':23,'sports-and-outdoors':27,'automotive':28};

export function adapt(p:ApiProduct):CatalogProduct{
  const source=reference.products.find(r=>r.id===p.attributes?.sourceId);
  const images=p.images.map(image=>image.trim()).filter(Boolean);
  return {
    id:p.id,
    slug:p.slug,
    name:p.name,
    price:p.priceMinor/100,
    old:p.priceMinor/100,
    image:images[0]||'/product-placeholder.svg',
    section:p.category?.name||source?.section||'Products',
    group:source?.group??groups[p.category?.slug||'']??1,
    rating:p.reviews?.length?p.reviews.reduce((n,r)=>n+r.rating,0)/p.reviews.length:0,
    stock:p.stock,
    description:p.description,
    vendorId:p.vendorId,
    vendorName:p.vendor?.name||'Marketplace vendor',
    vendorSlug:p.vendor?.slug,
    vendorLogo:p.vendor?.logo||undefined,
    vendorExpressMinutes:p.expressDelivery&&p.expressEtaMinutes?p.expressEtaMinutes:undefined,
    vendorStandardDays:p.standardDeliveryDays||7,
    categoryId:p.categoryId,
    images,
    attributes:p.attributes,
    variants:p.variants||[],
    sourceId:p.attributes?.sourceId
  };
}

export function buildCategoryTree(categories: CatalogCategory[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  for (const c of categories) {
    if (c.slug === 'all-products') continue;
    map.set(c.slug, { ...c, children: [] });
  }
  const roots: CategoryTreeNode[] = [];
  for (const c of categories) {
    if (c.slug === 'all-products') continue;
    const node = map.get(c.slug)!;
    if (c.parent && map.has(c.parent)) {
      map.get(c.parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

type State={products:CatalogProduct[];catalogCategories:CatalogCategory[];categories:NavCategory[];loading:boolean;error:string;reload:()=>void};
const Context=createContext<State>({products:[],catalogCategories:[],categories:[],loading:true,error:'',reload:()=>{}});

export function CatalogProvider({children}:{children:React.ReactNode}){
  const [data,setData]=useState<Omit<State,'reload'>>({products:[],catalogCategories:[],categories:[],loading:true,error:''});
  const [version,setVersion]=useState(0);

  useEffect(()=>{
    let live=true;
    (async()=>{
      const categories=await api<(ApiCategory&{productIds?:string[]})[]>('/catalog/categories');
      const products:ApiProduct[]=[];
      for(let page=1;;page++){
        const result=await api<{items:ApiProduct[];total:number}>(`/catalog/products?limit=100&page=${page}`);
        products.push(...result.items);
        if(!result.items.length||products.length>=result.total)break;
      }
      const mapped=products.map(adapt);
      const cats:CatalogCategory[]=categories.map(c=>({
        id:c.id,
        slug:c.slug,
        title:c.name,
        parent:c.parentSlug||'',
        image:c.image||'',
        productIds:Array.from(new Set([...(c.productIds||[]),...products.filter(p=>p.categoryId===c.id).map(p=>p.id)]))
      }));

      // Multi-pass bubble-up of descendant product IDs to parents
      for(let pass=0;pass<cats.length;pass++){
        let changed=false;
        for(const c of cats){
          const parent=cats.find(p=>p.slug===c.parent);
          if(parent){
            const ids=new Set([...parent.productIds,...c.productIds]);
            if(ids.size!==parent.productIds.length){
              parent.productIds=[...ids];
              changed=true;
            }
          }
        }
        if(!changed)break;
      }

      const tree = buildCategoryTree(cats);

      const rootCategories: NavCategory[] = cats
        .filter(c => (!c.parent || !cats.some(p => p.slug === c.parent)) && c.slug !== 'all-products')
        .map(c => {
          const treeNode = tree.find(t => t.slug === c.slug);
          const directChildren = cats.filter(child => child.parent === c.slug);
          return {
            id: c.id,
            slug: c.slug,
            title: c.title,
            labels: directChildren.map(child => child.title),
            images: [c.image].filter(Boolean),
            productIds: c.productIds,
            subcategories: directChildren,
            children: treeNode?.children || []
          };
        });

      if(live)setData({
        products:mapped,
        catalogCategories:cats,
        categories:rootCategories,
        loading:false,
        error:''
      });
    })().catch(e=>{
      if(live)setData({products:[],catalogCategories:[],categories:[],loading:false,error:e.message});
    });
    return()=>{live=false;};
  },[version]);

  return <Context.Provider value={{...data,reload:()=>setVersion(v=>v+1)}}>{children}</Context.Provider>;
}

export function useCatalog(){
  const data=useContext(Context);
  const shop=useShop();
  const products=new Map(data.products.map(p=>[p.id,p]));
  for(const p of [...shop.rows.map(r=>r.product),...shop.wishlist]){
    if(!products.has(p.id))products.set(p.id,adapt(p));
  };
  return {...data,catalogProducts:data.products,products:[...products.values()]};
}
