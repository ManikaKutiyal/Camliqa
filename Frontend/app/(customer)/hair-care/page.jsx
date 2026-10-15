"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HairCare from "../collections/HairCare";

export default function HairCarePage() {
  return (
    <main className="camliqa-aurora text-primary antialiased selection:bg-secondary/25 selection:text-primary overflow-hidden">
      <HairCare />
    </main>
  );
}
