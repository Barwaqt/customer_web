import { Suspense } from "react";
import Wishlist from "../components/wishlist";
export const metadata = { title: "My wishlist | Barwaqt" };
export default function WishlistPage(){return <Suspense fallback={<p role="status">Loading your wishlist…</p>}><Wishlist/></Suspense>;}
