import fs from "node:fs";
import path from "node:path";

const file = path.resolve("src/app/api/orders/route.ts");
let src = fs.readFileSync(file, "utf8");

// 1) ensure imports
if (!/from\s+"@\/lib\/validators"/.test(src)) {
  src = src.replace(
    /(import\s+\{\s*NextResponse\s*\}\s+from\s+"next\/server";\s*[\r\n]+)/,
    `$1import { OrderPostInput } from "@/lib/validators";\n`
  );
}
if (!/from\s+"@\/lib\/sql-helpers"/.test(src)) {
  src = src.replace(
    /(import\s+\{\s*sql\s*\}\s+from\s+"@\/lib\/db";\s*[\r\n]+)/,
    `$1import { dec, toUnnestArrays } from "@/lib/sql-helpers";\n`
  );
}

// 2) use Zod parse if present
src = src.replace(
  /const\s+body\s*=\s*\(await\s+req\.json\(\)\)\s+as\s+OrderPostInput\s*;/,
  `const body = OrderPostInput.parse(await req.json());`
);

// 3) replace bulk insert block to UNNEST
const startMarker = /\/\/\s*2\)\s*bulk insert items[^\n]*\n/;
const endMarker = /\/\/\s*3\)\s*fetch items back[^\n]*\n/;

if (startMarker.test(src) && endMarker.test(src)) {
  const before = src.split(startMarker)[0] + `// 2) bulk insert items via UNNEST (no .unsafe, fully parameterized)\n`;
  const after = src.split(endMarker)[1];
  const middle = `
    {
      const rows = body.items.map(it => ({
        orderId: order.id,
        productId: it.productId,
        title: it.title,
        price: dec(it.price),
        qty: it.qty,
        type: it.type,
      }));
      const arrays = toUnnestArrays(rows);
      await sql/*sql*/\`
        INSERT INTO order_items (order_id, product_id, title, price, qty, type)
        SELECT * FROM UNNEST(
          \${arrays.orderIds}::uuid[],
          \${arrays.productIds}::text[],
          \${arrays.titles}::text[],
          \${arrays.prices}::numeric[],
          \${arrays.qtys}::int[],
          \${arrays.types}::text[]
        )
      \`;
    }
    // 3) fetch items back
`;
  const [head, rest] = src.split(startMarker);
  const [, tail] = rest.split(endMarker);
  src = before + middle + tail;
} else {
  console.error("Markers not found. Make sure your file has:");
  console.error(`  // 2) bulk insert items`);
  console.error(`  // 3) fetch items back`);
  process.exit(1);
}

fs.writeFileSync(file, src, "utf8");
console.log("Patched:", file);
