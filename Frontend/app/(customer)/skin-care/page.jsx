"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InnerCircle from "@/components/InnerCircle";
import SkinCare from "../collections/SkinCare";

export default function SkinCarePage() {
  return (
    <main className="camliqa-aurora text-primary antialiased selection:bg-secondary/25 selection:text-primary overflow-hidden">
      <SkinCare />
      <InnerCircle />
    </main>
  );
}
