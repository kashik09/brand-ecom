import Link from "next/link";
import { ugx } from "@/lib/currency";

type Props = { slug: string; title: string; price: number; image?: string; blurb?: string };

export default function ProductCard({ slug, title, price, image, blurb }: Props) {
  return (
    <Link
      href={`/product/${slug}`}
      className="group block rounded-2xl border overflow-hidden hover:shadow-lg transition"
    >
      <div className="relative aspect-video bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-[1.02] transition" />
        ) : null}
        <span className="absolute top-3 right-3 text-xs bg-background/80 backdrop-blur px-2 py-1 rounded border">
          {ugx(price)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-medium">{title}</h3>
        {blurb ? <p className="mt-1 text-sm opacity-70 line-clamp-2">{blurb}</p> : null}
        <div className="mt-3 text-sm opacity-70 group-hover:opacity-100">View details →</div>
      </div>
    </Link>
  );
}
