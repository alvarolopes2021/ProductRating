import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col bg-background p-5 sm:p-6">
      <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden bg-secondary">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            loading="lazy"
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center px-6 text-center font-serif text-2xl leading-tight text-muted-foreground">
            <span className="line-clamp-3">{product.name}</span>
          </div>
        )}
      </div>

      <h2 className="font-serif text-2xl leading-tight tracking-tight">
        <Link
          href={`/products/${product.id}`}
          className="outline-none transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {product.name}
        </Link>
      </h2>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {product.description ?? "No description yet."}
      </p>
    </article>
  );
}
