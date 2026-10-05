import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * Public site shell. The future `app/(admin)/` group gets its own layout,
 * so the dashboard never ships the marketing navbar/footer JS.
 */
export default function PublicLayout({ children }) {
  return (
    <>
      <TopBar />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
