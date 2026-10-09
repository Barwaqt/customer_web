import { notFound } from "next/navigation";
import data from "../../shop-data.json";
import ProductDetails from "../../components/product-details";
export function generateStaticParams() { return data.products.map(product => ({ id: product.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params; const product = data.products.find(p => p.id === id);
 return { title: product ? `${product.name} | Barwaqt` : "Product not found | Barwaqt" };
}
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const product = data.products.find(p => p.id === id);
 if (!product) notFound();
 return <ProductDetails product={product}/>;
}
