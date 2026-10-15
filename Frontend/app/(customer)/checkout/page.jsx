import CheckoutClient from "./CheckoutClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Checkout | Secure Ritual Curation | Camliqa",
  description: "Securely checkout your Camliqa clinical beauty order.",
};

export default function CheckoutPage() {
  return (
    <main className="camliqa-aurora min-h-screen text-[#1A1A3E] antialiased selection:bg-[#C9A84C]/25 flex flex-col justify-between overflow-hidden">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-12 md:py-16 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#1A1A3E]/5 via-transparent to-transparent" />
          <div className="section-shell relative z-10">
            <span className="customer-section-label">Secure Order System</span>
            <h1 className="customer-section-title text-3xl md:text-4xl lg:text-5xl mt-2">
              Secure Checkout
            </h1>
            <div className="w-16 h-[1px] bg-[#C9A84C] mx-auto mt-4" />
            
            <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mt-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Dermatologist Ritual Order Protection Active</span>
            </div>
          </div>
        </section>

        {/* Back link & Breadcrumbs */}
        <div className="section-shell py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1A1A3E]/5 pb-6 mb-8">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A3E]/40">
            <Link href="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-[#C9A84C] transition-colors">Cart Selection</Link>
            <span>/</span>
            <span className="text-[#C9A84C]">Checkout</span>
          </div>

          <Link 
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A1A3E]/60 hover:text-[#C9A84C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart Selection
          </Link>
        </div>

        {/* Main checkout container */}
        <section className="section-shell pb-24">
          <CheckoutClient />
        </section>
      </div>

      <Footer />
    </main>
  );
}
