import Link from "next/link";
import { UGX } from "@/lib/currency";

type Props = {
  slug: string;
  title: string;
  price: number;
  image?: string;
};

export default function ProductCard({ slug, title, price, image }: Props) {
  return (
    <Link
      href={`/product/${slug}`}
      className="group block rounded-2xl border p-4 hover:shadow-md transition"
    >
      <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-3 flex items-center justify-center">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-[1.02] transition" />
        ) : (
          <div className="opacity-60 text-sm">Digital file</div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <span className="text-sm opacity-80">{UGX(price)}</span>
      </div>
    </Link>
  );
}