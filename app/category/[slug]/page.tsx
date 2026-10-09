import { notFound } from "next/navigation";
import { categories } from "../../categories";
import CategoryListing from "../../components/category-listing";
export function generateStaticParams() { return categories.map(c=>({slug:c.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const category=categories.find(c=>c.slug===slug); return {title:category?`${category.title} | Barwaqt`:"Category not found | Barwaqt"}; }
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}) {const {slug}=await params; const category=categories.find(c=>c.slug===slug);if(!category)notFound();return <CategoryListing key={slug} category={category}/>;}
