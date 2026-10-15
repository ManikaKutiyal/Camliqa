import sys
import re

def refactor():
    # 1. Clean up HairCare.jsx
    with open('app/collections/HairCare.jsx', 'r') as f:
        hair = f.read()
    
    # Remove Navbar and Footer
    hair = hair.replace('<Navbar />\n', '')
    hair = hair.replace('<Footer />\n', '')
    hair = hair.replace('import Navbar from "@/components/Navbar";\n', '')
    hair = hair.replace('import Footer from "@/components/Footer";\n', '')
    
    # Remove the wrapper CollectionsPage from HairCare.jsx
    wrapper = """export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F1F8] flex items-center justify-center text-primary font-serif italic text-2xl">Loading...</div>}>
      <CollectionsContent />
    </Suspense>
  );
}"""
    hair = hair.replace(wrapper, '')
    
    # Change function CollectionsContent to export default function HairCare
    hair = hair.replace('function CollectionsContent() {', 'export default function HairCare() {')
    
    # Force type to be 'hair' and remove useSearchParams
    hair = hair.replace("const searchParams = useSearchParams();\n  const typeParam = searchParams.get('type');\n  const type = (typeParam === 'hair') ? 'hair' : 'skin';", "const type = 'hair';")
    
    with open('app/collections/HairCare.jsx', 'w') as f:
        f.write(hair)
        
    # 2. Rewrite page.jsx to be the switcher
    page_content = """"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SkinCare from "./SkinCare";
import HairCare from "./HairCare";

function PageSwitcher() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  
  if (type === 'skin') {
    return <SkinCare />;
  }
  
  return <HairCare />;
}

export default function CollectionsPage() {
  return (
    <main className="bg-[#F5F1F8] text-primary antialiased selection:bg-secondary/25 selection:text-primary overflow-hidden">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif italic text-2xl text-primary">Loading...</div>}>
        <PageSwitcher />
      </Suspense>
      <Footer />
    </main>
  );
}
"""
    with open('app/collections/page.jsx', 'w') as f:
        f.write(page_content)
        
    print("Done")

refactor()
