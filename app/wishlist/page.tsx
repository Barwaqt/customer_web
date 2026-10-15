import { Suspense } from "react";
import Wishlist from "../components/wishlist";
import { BrandLoader } from "../components/brand-loader";
export const metadata = { title: "My wishlist | Barwaqt" };
export default function WishlistPage(){return <Suspense fallback={<main aria-busy="true"><BrandLoader label="Loading your wishlist…"/></main>}><Wishlist/></Suspense>;}
