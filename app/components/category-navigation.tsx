"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useCatalog, type NavCategory, type CategoryTreeNode } from "./catalog-context";
import s from "./category-navigation.module.css";

const defaultDepartments = [
  "Electronics",
  "Beauty & Fragrance",
  "Home & Kitchen",
  "Grocery",
  "Men’s Fashion",
  "Women’s Fashion",
  "Mobiles & Accessories",
  "Sports & Outdoors"
];

const brands = ["Prestige", "Royal Ford", "Tefal", "Pan", "Home Box", "Black Decker", "Danube Home", "Bath & Body Works", "Apex"];
const MAX_BAR_CATEGORIES = 8;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function CategoryNavigation() {
  const data = useCatalog();
  const [active, setActive] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (!active) return;
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActive(null);
        trigger.current?.focus();
      }
    }
    function outside(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setActive(null);
    }
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [active]);

  // Sort parent categories by product count so the richest/primary categories show first
  const parentCategories: { title: string; slug: string; nav?: NavCategory; count: number }[] = useMemo(() => {
    if (data.categories && data.categories.length > 0) {
      const sorted = [...data.categories].sort((a, b) => (b.productIds?.length || 0) - (a.productIds?.length || 0));
      return sorted.map(c => ({
        title: c.title,
        slug: c.slug,
        nav: c,
        count: c.productIds?.length || 0
      }));
    }
    return defaultDepartments.map(name => ({
      title: name,
      slug: name.toLowerCase().replace(/[’']/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      count: 0
    }));
  }, [data.categories]);

  // Display top categories on the single-page bar, followed by the "All Categories" button
  const visibleCategories = useMemo(() => {
    return parentCategories.slice(0, MAX_BAR_CATEGORIES);
  }, [parentCategories]);

  const activeCategory = useMemo(() => {
    if (!active || active === "all") return null;
    return data.categories.find(c => c.slug === active) || null;
  }, [active, data.categories]);

  const isAll = active === "all";

  // Build mega-menu groups for the active category
  const groups = useMemo(() => {
    if (!activeCategory) return [];

    const treeChildren: CategoryTreeNode[] = activeCategory.children || [];
    const hasBranchingChildren = treeChildren.some(c => c.children && c.children.length > 0);

    if (hasBranchingChildren) {
      const result: { title: string; slug: string; items: { title: string; slug: string; count?: number }[] }[] = [];
      const standalones: { title: string; slug: string; count?: number }[] = [];

      for (const branch of treeChildren) {
        if (branch.children && branch.children.length > 0) {
          result.push({
            title: branch.title,
            slug: branch.slug,
            items: branch.children.map(sub => ({
              title: sub.title,
              slug: sub.slug,
              count: sub.productIds.length
            }))
          });
        } else {
          standalones.push({
            title: branch.title,
            slug: branch.slug,
            count: branch.productIds.length
          });
        }
      }

      if (standalones.length > 0) {
        result.push({
          title: `More ${activeCategory.title}`,
          slug: activeCategory.slug,
          items: standalones
        });
      }
      return result;
    }

    // Direct flat subcategories: chunk into balanced columns of up to 6 items each
    const subcats = activeCategory.subcategories || [];
    if (subcats.length === 0) {
      return [
        {
          title: activeCategory.title,
          slug: activeCategory.slug,
          items: [{ title: `All ${activeCategory.title}`, slug: activeCategory.slug }]
        }
      ];
    }

    const itemsPerColumn = Math.max(4, Math.ceil(subcats.length / 5));
    const chunks = chunkArray(subcats, itemsPerColumn);

    return chunks.map((chunk, idx) => ({
      title: idx === 0 ? "Popular Subcategories" : "More Categories",
      slug: activeCategory.slug,
      items: chunk.map(c => ({
        title: c.title,
        slug: c.slug,
        count: c.productIds?.length
      }))
    }));
  }, [activeCategory]);

  return (
    <div className={s.root} ref={root}>
      <nav className={s.nav} aria-label="Shop departments">
        {/* Visible primary categories on one page without scroll */}
        {visibleCategories.map(cat => {
          const isSelected = active === cat.slug;
          return (
            <div className={s.department} key={cat.slug}>
              <Link
                onMouseEnter={() => setActive(cat.slug)}
                href={`/category/${cat.slug}`}
                onClick={() => setActive(null)}
              >
                {cat.title}
              </Link>
              <button
                aria-label={`Browse ${cat.title}`}
                aria-controls={id}
                aria-expanded={isSelected}
                onClick={e => {
                  trigger.current = e.currentTarget;
                  setActive(isSelected ? null : cat.slug);
                }}
              >
                ⌄
              </button>
            </div>
          );
        })}

        {/* All Categories button placed right after visible categories */}
        <button
          className={s.all}
          aria-expanded={isAll}
          aria-controls={id}
          onClick={e => {
            trigger.current = e.currentTarget;
            setActive(isAll ? null : "all");
          }}
        >
          All Categories <span>⌄</span>
        </button>
      </nav>

      {active && (
        <>
          <button
            className={s.backdrop}
            aria-label="Close categories"
            onClick={() => setActive(null)}
          />
          <section
            id={id}
            className={s.panel}
            aria-label={`${activeCategory?.title || "All"} categories`}
            onMouseLeave={() => setActive(null)}
          >
            {isAll ? (
              <>
                <div className={s.heading}>
                  <Link href="/category/all-products" onClick={() => setActive(null)}>
                    All Categories <span>Browse all products ({data.products.length}) →</span>
                  </Link>
                  <button
                    aria-label="Close category menu"
                    onClick={() => {
                      setActive(null);
                      trigger.current?.focus();
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className={s.content}>
                  <div className={`${s.columns} ${s.general}`}>
                    {data.categories.map(rootCat => (
                      <div key={rootCat.slug}>
                        <Link
                          className={s.title}
                          href={`/category/${rootCat.slug}`}
                          onClick={() => setActive(null)}
                        >
                          {rootCat.title}
                        </Link>
                        {rootCat.subcategories.slice(0, 8).map(sub => (
                          <Link
                            key={sub.slug}
                            href={`/category/${sub.slug}`}
                            onClick={() => setActive(null)}
                          >
                            {sub.title}
                          </Link>
                        ))}
                        {rootCat.subcategories.length > 8 && (
                          <Link
                            href={`/category/${rootCat.slug}`}
                            style={{ fontWeight: 600, color: "#16733c" }}
                            onClick={() => setActive(null)}
                          >
                            View all ({rootCat.subcategories.length}) →
                          </Link>
                        )}
                        {rootCat.subcategories.length === 0 && (
                          <Link
                            href={`/category/${rootCat.slug}`}
                            onClick={() => setActive(null)}
                          >
                            Shop collection
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : activeCategory ? (
              <>
                <div className={s.heading}>
                  <Link
                    href={`/category/${activeCategory.slug}`}
                    onClick={() => setActive(null)}
                  >
                    {activeCategory.title} <span>View all →</span>
                  </Link>
                  <button
                    aria-label="Close category menu"
                    onClick={() => {
                      setActive(null);
                      trigger.current?.focus();
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className={s.content}>
                  <div className={`${s.columns} ${s.general}`}>
                    {groups.map((group, idx) => (
                      <div key={group.title + idx}>
                        <Link
                          className={s.title}
                          href={`/category/${group.slug}`}
                          onClick={() => setActive(null)}
                        >
                          {group.title}
                        </Link>
                        {group.items.map(item => (
                          <Link
                            key={item.slug}
                            href={`/category/${item.slug}`}
                            onClick={() => setActive(null)}
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>

                  {activeCategory.images[0] && (
                    <Link
                      href={`/category/${activeCategory.slug}`}
                      className={s.promo}
                      onClick={() => setActive(null)}
                    >
                      <Image
                        src={activeCategory.images[0]}
                        alt={activeCategory.title}
                        fill
                        sizes="300px"
                        unoptimized
                      />
                      <div>
                        <span>BARWAQT COLLECTION</span>
                        <h3>{activeCategory.title}</h3>
                        <p>Explore everyday essentials & top picks</p>
                        <strong>SHOP THE COLLECTION →</strong>
                      </div>
                    </Link>
                  )}
                </div>

                {activeCategory.slug === "home-and-kitchen" && (
                  <div className={s.brands}>
                    <h3>TOP BRANDS</h3>
                    <div>
                      {brands.map(brand => (
                        <Link
                          key={brand}
                          href={`/?q=${encodeURIComponent(brand)}`}
                          onClick={() => setActive(null)}
                        >
                          <strong>{brand}</strong>
                          <span>{brand}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
