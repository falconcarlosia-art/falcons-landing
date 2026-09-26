// Corre después de `vite build`. Genera HTML estático real por ruta
// (home, cada producto/servicio activo, 404, shell de admin) y un
// sitemap.xml dinámico, usando el mismo árbol de componentes que la app
// cliente (patrón oficial de Vite SSG: vite.ssrLoadModule en modo
// middleware, sin build SSR separado). Cualquier error aquí debe tumbar
// el build completo — nunca publicar un sitio a medio generar ni un
// sitemap desactualizado en silencio.
import { createServer } from "vite";
import fs from "node:fs/promises";
import path from "node:path";

const DIST = path.resolve("dist");
const SITE_URL = "https://falcem.com";

async function main() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  const { supabase } = await vite.ssrLoadModule("/src/lib/supabaseClient.js");
  const { slugify } = await vite.ssrLoadModule("/src/lib/slugify.js");
  const catalog = await vite.ssrLoadModule("/src/lib/catalog.js");
  const { render } = await vite.ssrLoadModule("/src/entry-server.jsx");

  const [{ data: productRows, error: productsError }, { data: services, error: servicesError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(catalog.PRODUCT_SELECT)
        .eq("active", true)
        .order("id"),
      supabase
        .from("services")
        .select("id, category, title, description")
        .eq("active", true)
        .order("category")
        .order("id"),
    ]);

  if (productsError) throw new Error(`No se pudo leer "products" de Supabase: ${productsError.message}`);
  if (servicesError) throw new Error(`No se pudo leer "services" de Supabase: ${servicesError.message}`);

  const products = productRows.map(catalog.normalizeProduct);
  // Listados (home, catálogo, relacionados): sin HTML largo ni ficha técnica
  const listProducts = products.map(catalog.toListItem);
  // Índice del mega menú/footer — viaja en el JSON de TODAS las páginas
  const nav = catalog.buildNav(products);
  const categories = nav.categories;

  // Se lee UNA vez, antes de sobrescribir dist/index.html — admin.html se
  // deriva de este template pristino, nunca del HTML de Home ya inyectado.
  const template = await fs.readFile(path.join(DIST, "index.html"), "utf-8");

  function renderHeadTags(helmet) {
    if (!helmet) return "";
    return [helmet.title, helmet.meta, helmet.link, helmet.script]
      .map((h) => h.toString())
      .join("\n");
  }

  function injectPage({ appHtml = "", helmet, data = {} }) {
    const dataJson = JSON.stringify(data).replace(/</g, "\\u003c");
    return template
      .replace("<!--app-head-->", renderHeadTags(helmet))
      .replace("<!--app-html-->", appHtml)
      .replace(
        "<!--app-data-->",
        `<script id="__PRERENDER_DATA__" type="application/json">${dataJson}</script>`
      );
  }

  async function writePage(relPath, html) {
    const filePath = path.join(DIST, relPath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, html, "utf-8");
  }

  // Shell propio de /admin — nunca hereda el HTML de Home (evita el
  // parpadeo de la landing comercial al cargar el panel).
  const adminHtml = template
    .replace(
      "<!--app-head-->",
      `<title>Falcons — Panel de administración</title>\n<meta name="robots" content="noindex" />`
    )
    .replace("<!--app-html-->", "")
    .replace("<!--app-data-->", "");
  await writePage("admin.html", adminHtml);

  // Home
  await writePage("index.html", injectPage(render("/", { products: listProducts, services, nav })));

  // Catálogo completo y una página por categoría con productos
  await writePage("productos/index.html", injectPage(render("/productos", { products: listProducts, nav })));
  for (const c of categories) {
    await writePage(
      `productos/${c.slug}/index.html`,
      injectPage(render(`/productos/${c.slug}`, { products: listProducts, nav }))
    );
  }

  // Productos activos (+ relacionados de su categoría y hubs si los necesita)
  for (const product of products) {
    const slug = slugify(product.title);
    const url = `/producto/${product.id}/${slug}`;
    const related = listProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 8);
    const hubs = product.needs_hub ? listProducts.filter((p) => p.category === "Hubs").slice(0, 4) : [];
    await writePage(
      `producto/${product.id}/${slug}/index.html`,
      injectPage(render(url, { product, related, hubs, nav }))
    );
  }

  // Servicios activos
  for (const service of services) {
    const slug = slugify(service.title);
    const url = `/servicios/${service.id}/${slug}`;
    await writePage(`servicios/${service.id}/${slug}/index.html`, injectPage(render(url, { service, nav })));
  }

  // 404 real — cualquier URL que no matchee ninguna ruta conocida
  await writePage("404.html", injectPage(render("/__prerender_not_found__", { nav })));

  // Sitemap dinámico — misma fuente que las páginas de arriba, sin anclas #
  await fs.writeFile(path.join(DIST, "sitemap.xml"), buildSitemapXml({ products, services, categories, slugify }), "utf-8");

  await vite.close();

  console.log(
    `[prerender] OK — home, catálogo + ${categories.length} categoría(s), ${products.length} producto(s), ${services.length} servicio(s), 404, admin, sitemap.xml`
  );
}

function buildSitemapXml({ products, services, categories, slugify }) {
  const urls = [
    { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0" },
    ...products.map((p) => ({
      loc: `${SITE_URL}/producto/${p.id}/${slugify(p.title)}`,
      changefreq: "weekly",
      priority: "0.8",
    })),
    ...services.map((s) => ({
      loc: `${SITE_URL}/servicios/${s.id}/${slugify(s.title)}`,
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];

  const body = urls
    .map(
      (u) =>
        `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

main().catch((err) => {
  console.error("[prerender] Falló la generación del sitio:", err);
  process.exit(1);
});
