import Navbar from "./Navbar";
import Footer from "./Footer";
import OrderDrawer, { OrderFab } from "./OrderDrawer";

// Marco común de las páginas públicas: navbar, footer y la lista de pedido.
export default function SiteShell({ children, hasBottomBar = false }) {
  return (
    <div className="min-h-screen bg-bg text-ink font-sans antialiased">
      <Navbar />
      <main>{children}</main>
      <Footer className={hasBottomBar ? "pb-24 lg:pb-10" : ""} />
      <OrderFab raised={hasBottomBar} />
      <OrderDrawer />
    </div>
  );
}
