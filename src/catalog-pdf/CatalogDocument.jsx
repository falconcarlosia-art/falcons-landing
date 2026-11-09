// Documento A4 del catálogo (react-pdf). Portada y contraportada oscuras con
// la identidad del sitio; páginas interiores claras, pensadas para leerse en
// el celular y también imprimirse.
import { Document, Page, View, Text, Image, Link, Svg, Defs, RadialGradient, Stop, Rect, Ellipse } from "@react-pdf/renderer";
import geist400 from "@fontsource/geist/files/geist-latin-400-normal.woff?url";
import geist500 from "@fontsource/geist/files/geist-latin-500-normal.woff?url";
import geist600 from "@fontsource/geist/files/geist-latin-600-normal.woff?url";
import geist700 from "@fontsource/geist/files/geist-latin-700-normal.woff?url";
import mono400 from "@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff?url";
import orbitron700 from "@fontsource/orbitron/files/orbitron-latin-700-normal.woff?url";
import { PROTOCOLS, formatPrice, isConnected, labelOf } from "../lib/catalog";
import { WHATSAPP_DISPLAY } from "../lib/whatsapp";
import { FIRST_CONTENT_PAGE, GAP, HEADER_H, PAGE, PROMO_MIN_H, ROW_H } from "./layout";

const C = {
  bg: "#0B0F17",
  surface: "#131A26",
  line: "#263244",
  ink: "#F1F5F9",
  muted: "#94A3B8",
  brand: "#F59E0B",
  brandInk: "#1A1204",
  paper: "#FFFFFF",
  paperInk: "#141821",
  paperMuted: "#5B6474",
  paperLine: "#E3E6EB",
  tile: "#F1F3F6",
};

let fontsReady = false;
export function registerFonts(Font) {
  if (fontsReady) return;
  Font.register({
    family: "Geist",
    fonts: [
      { src: geist400, fontWeight: 400 },
      { src: geist500, fontWeight: 500 },
      { src: geist600, fontWeight: 600 },
      { src: geist700, fontWeight: 700 },
    ],
  });
  Font.register({ family: "GeistMono", src: mono400 });
  Font.register({ family: "Orbitron", src: orbitron700, fontWeight: 700 });
  // Sin guiones de corte a mitad de palabra.
  Font.registerHyphenationCallback((word) => [word]);
  fontsReady = true;
}

const ECO_SHORT = { alexa: "Alexa", google: "Google Home", homekit: "HomeKit", smartthings: "SmartThings" };

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];
const longDate = (d) => `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;

function specLine(p) {
  const parts = [];
  if (isConnected(p)) parts.push(labelOf(PROTOCOLS, p.protocol));
  if (p.app) parts.push(p.app);
  parts.push(...p.ecosystems.map((e) => ECO_SHORT[e] ?? e));
  if (p.needs_neutral === false) parts.push("Sin neutro");
  if (p.needs_hub) parts.push("Requiere hub");
  return parts.join("  ·  ");
}

// ─── Piezas ──────────────────────────────────────────────────────────────────

function Wordmark({ logo, size = 22, color = C.ink }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {logo && <Image src={logo} style={{ width: size, height: size }} />}
      <Text style={{ fontFamily: "Orbitron", fontWeight: 700, fontSize: size * 0.62, letterSpacing: 1.5, color, marginLeft: 3 }}>
        ALCONS
      </Text>
    </View>
  );
}

// Fondo de la foto: foco de luz radial + sombra en el piso (versión impresa
// de la "vitrina" del sitio).
function Spotlight({ id, dark }) {
  return (
    <Svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="42%" r="70%">
          <Stop offset="0%" stopColor={dark ? "#2B3650" : "#FFFFFF"} />
          <Stop offset="60%" stopColor={dark ? "#18202E" : "#EEF0F4"} />
          <Stop offset="100%" stopColor={dark ? C.bg : "#E4E7EC"} />
        </RadialGradient>
        <RadialGradient id={`${id}-s`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#000000" stopOpacity={dark ? 0.6 : 0.22} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill={`url(#${id})`} />
      <Ellipse cx="50" cy="88" rx="28" ry="5" fill={`url(#${id}-s)`} />
    </Svg>
  );
}

function Footer({ page, dark }) {
  const color = dark ? C.muted : C.paperMuted;
  return (
    <View
      fixed
      style={{
        position: "absolute",
        left: 36,
        right: 36,
        bottom: 22,
        flexDirection: "row",
        justifyContent: "space-between",
        fontFamily: "GeistMono",
        fontSize: 7,
        color,
      }}
    >
      <Text>falcem.com  ·  WhatsApp {WHATSAPP_DISPLAY}</Text>
      <Text>{String(page).padStart(2, "0")}</Text>
    </View>
  );
}

// Foto del producto: recortes sobre foco de luz; fotos con fondo propio sobre
// blanco (casi todas vienen en fondo blanco y así no se ve el "recuadro").
function ProductPhoto({ p, id, pad = 12 }) {
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.paper }}>
      {p?.cutout && <Spotlight id={id} />}
      {p?.image && (
        <View style={{ position: "absolute", top: pad, left: pad, right: pad, bottom: pad }}>
          <Image src={p.image} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </View>
      )}
    </View>
  );
}

function ProductTile({ p, showPrices }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: C.paperLine, borderRadius: 8, overflow: "hidden" }}>
      <View style={{ flexGrow: 1, position: "relative" }}>
        <ProductPhoto p={p} id={`t${p.id}`} pad={6} />
        {!p.in_stock && (
          <Text
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              fontSize: 6.5,
              fontFamily: "GeistMono",
              color: C.paperMuted,
              backgroundColor: C.tile,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 3,
            }}
          >
            CONSULTAR STOCK
          </Text>
        )}
      </View>

      <View
        style={{
          paddingHorizontal: 10,
          paddingTop: 7,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: C.paperLine,
          flexDirection: "row",
          alignItems: "flex-end",
        }}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontSize: 9.5, fontWeight: 600, color: C.paperInk, lineHeight: 1.25, height: 24 }} maxLines={2}>
            {p.title}
          </Text>
          <Text style={{ fontFamily: "GeistMono", fontSize: 6.2, color: C.paperMuted, marginTop: 2 }} maxLines={1}>
            {specLine(p)}
          </Text>
          {showPrices ? (
            <Text style={{ fontSize: 15, fontWeight: 700, color: C.paperInk, marginTop: 5 }}>{formatPrice(p.price)}</Text>
          ) : (
            <Text style={{ fontSize: 9, fontWeight: 600, color: C.paperInk, marginTop: 6 }}>Cotiza por WhatsApp</Text>
          )}
          {p.variants.length > 0 && (
            <Text style={{ fontSize: 6.3, color: C.paperMuted, marginTop: 1 }} maxLines={1}>
              {p.variants.map((v) => `${v.label}: ${v.options.join(", ")}`).join("  ·  ")}
            </Text>
          )}
        </View>
        <Link src={p.url} style={{ textDecoration: "none" }}>
          <View style={{ alignItems: "center" }}>
            <Image src={p.qr} style={{ width: 36, height: 36 }} />
            <Text style={{ fontFamily: "GeistMono", fontSize: 5.3, color: C.paperMuted, marginTop: 2 }}>VER FICHA</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}

function SectionHeader({ group, cont }) {
  return (
    <View style={{ height: HEADER_H, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
      <View>
        <View style={{ width: 22, height: 3, backgroundColor: C.brand, marginBottom: 6 }} />
        <Text style={{ fontSize: 20, fontWeight: 700, color: C.paperInk, letterSpacing: -0.4 }}>
          {group.name}
          {cont ? <Text style={{ fontSize: 10, fontWeight: 400, color: C.paperMuted }}>  (continuación)</Text> : null}
        </Text>
      </View>
      <Text style={{ fontFamily: "GeistMono", fontSize: 7.5, color: C.paperMuted, marginBottom: 3 }}>
        {group.items.length} {group.items.length === 1 ? "PRODUCTO" : "PRODUCTOS"}
      </Text>
    </View>
  );
}

// Aviso comercial que llena el hueco al final de una hoja.
const PROMOS = [
  {
    kicker: "ASESORÍA GRATIS",
    title: "¿No sabes cuál elegir?",
    text: "Cuéntanos qué quieres automatizar y te recomendamos lo que va con tu instalación: cable neutro, tipo de caja y app.",
    qr: "wa",
    cta: "Escanea y escríbenos por WhatsApp",
  },
  {
    kicker: "INSTALACIÓN PROFESIONAL",
    title: "Te lo dejamos funcionando.",
    text: "Técnicos propios en Lima instalan y configuran tus equipos con Alexa o Google Home. Garantía de 2 años en productos e instalación.",
    qr: "wa",
    cta: "Agenda una visita técnica gratuita",
  },
  {
    kicker: "CATÁLOGO EN LÍNEA",
    title: "Siempre actualizado en falcem.com",
    text: "Fotos, videos y especificaciones completas de cada producto. Arma tu pedido y envíalo por WhatsApp en un clic.",
    qr: "site",
    cta: "Escanea para ver la tienda",
  },
];

function Promo({ variant, waQr, waUrl, siteQr }) {
  const promo = PROMOS[variant % PROMOS.length];
  const isSite = promo.qr === "site";
  return (
    <View
      style={{
        flexGrow: 1,
        minHeight: PROMO_MIN_H,
        backgroundColor: C.surface,
        borderRadius: 10,
        padding: 22,
        flexDirection: "row",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, backgroundColor: C.brand }} />
      <View style={{ flex: 1, paddingRight: 20 }}>
        <Text style={{ fontFamily: "GeistMono", fontSize: 7.5, color: C.brand, letterSpacing: 1 }}>{promo.kicker}</Text>
        <Text style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginTop: 6, letterSpacing: -0.4 }}>{promo.title}</Text>
        <Text style={{ fontSize: 9, color: C.muted, lineHeight: 1.5, marginTop: 6, maxWidth: 330 }}>{promo.text}</Text>
        <Text style={{ fontSize: 9, fontWeight: 600, color: C.ink, marginTop: 10 }}>WhatsApp {WHATSAPP_DISPLAY}</Text>
      </View>
      <Link src={isSite ? "https://falcem.com/productos" : waUrl} style={{ textDecoration: "none" }}>
        <View style={{ alignItems: "center", width: 96 }}>
          <View style={{ padding: 6, backgroundColor: isSite ? C.brand : C.surface, borderRadius: 6, borderWidth: 1, borderColor: C.line }}>
            <Image src={isSite ? siteQr : waQr} style={{ width: 72, height: 72 }} />
          </View>
          <Text style={{ fontSize: 6.5, color: C.muted, marginTop: 6, textAlign: "center", lineHeight: 1.35 }}>{promo.cta}</Text>
        </View>
      </Link>
    </View>
  );
}

function ContentPage({ page, number, showPrices, promoProps }) {
  return (
    <Page
      size="A4"
      style={{
        backgroundColor: C.paper,
        paddingTop: PAGE.padTop,
        paddingHorizontal: PAGE.padX,
        paddingBottom: PAGE.padBottom,
        fontFamily: "Geist",
      }}
    >
      <View style={{ flexGrow: 1, gap: GAP }}>
        {page.blocks.map((b, i) => {
          if (b.type === "header") return <SectionHeader key={i} group={b.group} cont={b.cont} />;
          if (b.type === "promo") return <Promo key={i} variant={b.variant} {...promoProps} />;
          return (
            <View key={i} style={{ height: ROW_H, flexDirection: "row", gap: GAP }}>
              {[0, 1].map((c) =>
                b.items[c] ? <ProductTile key={c} p={b.items[c]} showPrices={showPrices} /> : <View key={c} style={{ flex: 1 }} />
              )}
            </View>
          );
        })}
      </View>
      <Footer page={number} />
    </Page>
  );
}

// ─── Portada ─────────────────────────────────────────────────────────────────

function CoverTile({ p, id, big, showPrices }) {
  return (
    <View style={{ flex: 1, borderRadius: big ? 14 : 10, overflow: "hidden", position: "relative", backgroundColor: C.paper }}>
      {p?.cutout || !big ? (
        <ProductPhoto p={p} id={id} pad={big ? 26 : 12} />
      ) : (
        // Foto de ambiente como protagonista: a sangre, como una revista.
        <Image src={p.image} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {big && p && (
        <View
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            right: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: C.bg,
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 11,
          }}
        >
          <View style={{ flexShrink: 1, paddingRight: 8 }}>
            <Text style={{ fontFamily: "GeistMono", fontSize: 6, color: C.brand, letterSpacing: 0.8 }}>DESTACADO</Text>
            <Text style={{ fontSize: 9, fontWeight: 600, color: C.ink, marginTop: 2 }} maxLines={1}>
              {p.title}
            </Text>
          </View>
          {showPrices && Number(p.price) > 0 && (
            <Text style={{ fontSize: 14, fontWeight: 700, color: C.brand }}>{formatPrice(p.price)}</Text>
          )}
        </View>
      )}
    </View>
  );
}

function StatTile({ total, groups }) {
  return (
    <View style={{ height: 64, borderRadius: 10, backgroundColor: C.brand, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" }}>
      <Text style={{ fontSize: 34, fontWeight: 700, color: C.brandInk, letterSpacing: -1 }}>{total}</Text>
      <View style={{ marginLeft: 10 }}>
        <Text style={{ fontSize: 9.5, fontWeight: 700, color: C.brandInk }}>productos</Text>
        <Text style={{ fontSize: 8, color: C.brandInk, marginTop: 1 }}>
          en {groups.length} {groups.length === 1 ? "categoría" : "categorías"}
        </Text>
      </View>
    </View>
  );
}

function Cover({ cover, total, minPrice, groups, logo, clientName, showPrices, date }) {
  const [a, b] = cover.side;
  const trust = ["Garantía de 2 años", "Asesoría gratis por WhatsApp", "Instalación profesional en Lima"];
  return (
    <Page size="A4" style={{ backgroundColor: C.bg, fontFamily: "Geist", color: C.ink }}>
      {/* Halo ámbar de fondo */}
      <Svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <Defs>
          <RadialGradient id="halo" cx="85%" cy="8%" r="60%">
            <Stop offset="0%" stopColor={C.brand} stopOpacity={0.22} />
            <Stop offset="100%" stopColor={C.brand} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#halo)" />
      </Svg>
      <View style={{ flexGrow: 1, paddingTop: 36, paddingHorizontal: 40, paddingBottom: 30 }}>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Wordmark logo={logo} size={26} />
        <Text style={{ fontFamily: "GeistMono", fontSize: 7.5, color: C.muted, letterSpacing: 0.8 }}>
          CATÁLOGO · {MONTHS[date.getMonth()].toUpperCase()} {date.getFullYear()}
        </Text>
      </View>

      <Text style={{ fontFamily: "GeistMono", fontSize: 8, color: C.brand, letterSpacing: 1.2, marginTop: 40 }}>
        DOMÓTICA EN LIMA · CASAS Y DEPARTAMENTOS
      </Text>
      <Text style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1.6, lineHeight: 1.02, marginTop: 10 }}>Tu casa inteligente,</Text>
      <Text style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1.6, lineHeight: 1.02, color: C.brand }}>sin obras.</Text>
      <Text style={{ fontSize: 10.5, color: C.muted, marginTop: 12, lineHeight: 1.5, maxWidth: 400 }}>
        Interruptores, sensores y accesorios que controlas desde el celular o con tu voz, compatibles con Alexa y Google Home
        {showPrices && minPrice ? (
          <>
            , desde <Text style={{ color: C.ink, fontWeight: 600 }}>{formatPrice(minPrice)}</Text>
          </>
        ) : null}
        .
      </Text>

      {/* Mosaico de productos */}
      <View style={{ flexGrow: 1, flexDirection: "row", gap: 10, marginTop: 24 }}>
        <View style={{ flex: 1.15 }}>
          <CoverTile p={cover.hero} id="ch" big showPrices={showPrices} />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <CoverTile p={a} id="c1" />
          <CoverTile p={b} id="c2" />
          <StatTile total={total} groups={groups} />
        </View>
      </View>

      {/* Respaldo */}
      <View style={{ flexDirection: "row", gap: 16, marginTop: 18 }}>
        {trust.map((t) => (
          <View key={t} style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 5, height: 5, backgroundColor: C.brand, borderRadius: 1, marginRight: 6 }} />
            <Text style={{ fontSize: 8.5, fontWeight: 500, color: C.ink }}>{t}</Text>
          </View>
        ))}
      </View>

      <View
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: C.line,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        {clientName ? (
          <View>
            <Text style={{ fontFamily: "GeistMono", fontSize: 7, color: C.muted, letterSpacing: 0.8 }}>PREPARADO PARA</Text>
            <Text style={{ fontSize: 15, fontWeight: 700, color: C.brand, marginTop: 3 }}>{clientName}</Text>
          </View>
        ) : (
          <View>
            <Text style={{ fontFamily: "GeistMono", fontSize: 7, color: C.muted, letterSpacing: 0.8 }}>PIDE POR WHATSAPP</Text>
            <Text style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 3 }}>{WHATSAPP_DISPLAY}</Text>
          </View>
        )}
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: C.ink }}>falcem.com</Text>
          <Text style={{ fontFamily: "GeistMono", fontSize: 7, color: C.muted, marginTop: 3 }}>{longDate(date).toUpperCase()}</Text>
        </View>
      </View>
      </View>
    </Page>
  );
}

// ─── Bienvenida: contenido + cómo comprar ────────────────────────────────────

function Welcome({ groups, waQr, waUrl }) {
  const steps = [
    ["Elige", "Revisa el catálogo y escanea el QR de cada producto para ver fotos, videos y especificaciones."],
    ["Escríbenos", "Envíanos tu pedido por WhatsApp. Te confirmamos stock, precio final y compatibilidad."],
    ["Listo", "Coordinamos la entrega o la instalación con nuestros técnicos, con garantía de 2 años."],
  ];
  const facts = [
    ["Compatibles", "Funcionan con Amazon Alexa y Google Home. La ficha indica si necesitan cable neutro o hub."],
    ["Sin obras", "Se instalan en tus cajas y cableado actuales: no hay que romper paredes."],
    ["Asesoría gratis", "¿Dudas con tu instalación? Te ayudamos a elegir antes de comprar."],
  ];
  return (
    <Page size="A4" style={{ backgroundColor: C.paper, padding: 48, paddingBottom: 56, fontFamily: "Geist", color: C.paperInk }}>
      <View style={{ width: 22, height: 3, backgroundColor: C.brand, marginBottom: 8 }} />
      <Text style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>Contenido</Text>

      <View style={{ marginTop: 18 }}>
        {groups.map((g, i) => (
          <View
            key={g.name}
            style={{ flexDirection: "row", alignItems: "baseline", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.paperLine }}
          >
            <Text style={{ fontFamily: "GeistMono", fontSize: 8, color: C.brand, width: 24 }}>{String(i + 1).padStart(2, "0")}</Text>
            <Text style={{ fontSize: 14, fontWeight: 600, flexGrow: 1 }}>{g.name}</Text>
            <Text style={{ fontFamily: "GeistMono", fontSize: 8, color: C.paperMuted, width: 90 }}>
              {g.items.length} {g.items.length === 1 ? "producto" : "productos"}
            </Text>
            <Text style={{ fontFamily: "GeistMono", fontSize: 9, width: 30, textAlign: "right" }}>p. {g.startPage}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 16, fontWeight: 700, marginTop: 36, letterSpacing: -0.3 }}>Cómo comprar</Text>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
        {steps.map(([t, d], i) => (
          <View key={t} style={{ flex: 1, borderTopWidth: 2, borderTopColor: C.brand, paddingTop: 10 }}>
            <Text style={{ fontSize: 26, fontWeight: 700, color: C.brand, lineHeight: 1 }}>{i + 1}</Text>
            <Text style={{ fontSize: 10.5, fontWeight: 600, marginTop: 6 }}>{t}</Text>
            <Text style={{ fontSize: 8, color: C.paperMuted, lineHeight: 1.5, marginTop: 4 }}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 28 }}>
        {facts.map(([t, d]) => (
          <View key={t} style={{ flex: 1, backgroundColor: C.tile, borderRadius: 8, padding: 12 }}>
            <Text style={{ fontSize: 9.5, fontWeight: 600 }}>{t}</Text>
            <Text style={{ fontSize: 7.8, color: C.paperMuted, lineHeight: 1.45, marginTop: 4 }}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexGrow: 1 }} />
      <Link src={waUrl} style={{ textDecoration: "none" }}>
        <View style={{ backgroundColor: C.bg, borderRadius: 10, padding: 18, flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "GeistMono", fontSize: 7.5, color: C.brand, letterSpacing: 1 }}>ATENCIÓN DIRECTA</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginTop: 5 }}>WhatsApp {WHATSAPP_DISPLAY}</Text>
            <Text style={{ fontSize: 8.5, color: C.muted, marginTop: 4 }}>Escanea el código o toca aquí para escribirnos.</Text>
          </View>
          <Image src={waQr} style={{ width: 64, height: 64 }} />
        </View>
      </Link>
      <Footer page={2} />
    </Page>
  );
}

// ─── Documento ───────────────────────────────────────────────────────────────

export default function CatalogDocument({ groups, pages, total, minPrice, cover, logo, siteQr, waQr, waUrl, clientName, showPrices, date }) {
  const lastPage = FIRST_CONTENT_PAGE + pages.length;
  const promoProps = { waQr, waUrl, siteQr };

  return (
    <Document title="Catálogo Falcons" author="Falcons" subject="Catálogo de domótica" creator="falcem.com">
      <Cover
        cover={cover}
        total={total}
        minPrice={minPrice}
        groups={groups}
        logo={logo}
        clientName={clientName}
        showPrices={showPrices}
        date={date}
      />
      <Welcome groups={groups} waQr={waQr} waUrl={waUrl} />

      {pages.map((page, i) => (
        <ContentPage key={i} page={page} number={FIRST_CONTENT_PAGE + i} showPrices={showPrices} promoProps={promoProps} />
      ))}

      {/* Contraportada */}
      <Page size="A4" style={{ backgroundColor: C.brand, padding: 48, fontFamily: "Geist", color: C.brandInk, justifyContent: "space-between" }}>
        <Wordmark logo={logo} size={26} color={C.brandInk} />

        <View>
          <Text style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1, lineHeight: 1.08, maxWidth: 420 }}>
            Pide por WhatsApp o agenda una visita técnica gratuita.
          </Text>
          <View style={{ marginTop: 28, flexDirection: "row", alignItems: "center", gap: 18 }}>
            <Link src="https://falcem.com/productos">
              <Image src={siteQr} style={{ width: 84, height: 84 }} />
            </Link>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>WhatsApp {WHATSAPP_DISPLAY}</Text>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>falcem.com</Text>
              <Text style={{ fontSize: 8.5, maxWidth: 230, lineHeight: 1.45 }}>
                Escanea el código para ver el catálogo siempre actualizado, con fotos y videos de cada producto.
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 28, flexDirection: "row", gap: 18 }}>
            {["Garantía de 2 años", "Técnicos propios en Lima", "Alexa y Google Home"].map((t) => (
              <Text key={t} style={{ fontSize: 9, fontWeight: 600, borderTopWidth: 1.5, borderTopColor: C.brandInk, paddingTop: 6 }}>
                {t}
              </Text>
            ))}
          </View>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: "#1A120440", paddingTop: 10, flexDirection: "row", justifyContent: "space-between", fontFamily: "GeistMono", fontSize: 7 }}>
          <Text>
            {showPrices ? `PRECIOS EN SOLES, VIGENTES AL ${longDate(date).toUpperCase()} Y SUJETOS A STOCK.` : `CATÁLOGO AL ${longDate(date).toUpperCase()}.`}
          </Text>
          <Text>{String(lastPage).padStart(2, "0")}</Text>
        </View>
      </Page>
    </Document>
  );
}
