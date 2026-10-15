import sys
import re

def make_dynamic(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Add imports
    if 'useSearchParams' not in content:
        content = content.replace('import { useRef } from "react";', 'import { useRef, Suspense } from "react";\nimport { useSearchParams } from "next/navigation";')

    # Find the start of the component
    comp_start = content.find('export default function CollectionsPage() {')
    
    # We need to rename CollectionsPage to CollectionsContent, and wrap it
    
    new_comp_header = """
const CONTENT = {
  skin: {
    heroTitle: "rituals.",
    heroImage: "/collections/eye_hero.png",
    philosophyTitle: "New philosophy <br/> of selfcare: healthy <br/> skin",
    pureCareText1: "Thoughtfully crafted formulas designed to bring balance and calm to your daily skincare routine.",
    allInOneImage: "/collections/dark_bottles_group.png",
    anatomyText: "Made with a balanced blend of skin-loving ingredients, including botanical extracts, hydrating complexes and barrier-supporting actives designed for daily face care.",
    anatomyImage: "/collections/philosophy_sage_jar.png",
    futureOfBeautyTag: "Advanced Formulations",
    futureOfBeautyText: "Activate cellular regeneration with our science-backed innovations. We are redefining the boundaries of modern skincare through high-potency, minimalist formulations designed for real, visible results.",
    everydayEssentialsText: "Our beginner friendly Hyaluronic Acid 2% + B5 boosts hydration, while Niacinamide 10% + Zinc 1% improves the look of skin radiance. Formulated to provide lasting moisture and visible clarity."
  },
  hair: {
    heroTitle: "crown.",
    heroImage: "/collections/pump_bottle.png",
    philosophyTitle: "New philosophy <br/> of selfcare: healthy <br/> hair",
    pureCareText1: "Thoughtfully crafted formulas designed to bring balance and strength to your daily hair care routine.",
    allInOneImage: "/collections/light_bottles_group.png",
    anatomyText: "Made with a balanced blend of hair-loving ingredients, including botanical extracts, strengthening complexes and scalp-supporting actives designed for daily hair care.",
    anatomyImage: "/collections/pump_bottle.png",
    futureOfBeautyTag: "Scalp & Strand Science",
    futureOfBeautyText: "Activate hair follicle health with our science-backed innovations. We are redefining the boundaries of modern hair care through high-potency, minimalist formulations designed for real, visible density.",
    everydayEssentialsText: "Our beginner friendly Peptide Serum boosts scalp health, while Botanical Extracts improve the look of hair radiance. Formulated to provide lasting moisture and visible volume."
  }
};

function CollectionsContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const type = (typeParam === 'hair') ? 'hair' : 'skin';
  const data = CONTENT[type];

"""
    
    content = content.replace('export default function CollectionsPage() {', new_comp_header)
    
    # Now replace the hardcoded strings with data.xxx
    
    content = content.replace('src="/collections/eye_hero.png"\n            alt="Hero Eye"', 'src={data.heroImage}\n            alt="Hero"')
    
    content = re.sub(r'>\s*rituals\.\s*</h1>', '>{data.heroTitle}</h1>', content)
    
    content = content.replace('New philosophy <br/> of selfcare: healthy <br/> skin & hair', '<span dangerouslySetInnerHTML={{ __html: data.philosophyTitle }} />')
    
    content = content.replace('Thoughtfully crafted formulas designed to bring balance and calm to your daily routine.', '{data.pureCareText1}')
    
    # all in one image
    content = content.replace('src="/collections/dark_bottles_group.png" alt="Group of 4 dark bottles"', 'src={data.allInOneImage} alt="Group of bottles"')
    
    # anatomy text
    content = content.replace('Made with a balanced blend of skin-loving ingredients, including botanical extracts, hydrating complexes and barrier-supporting actives designed for daily care.', '{data.anatomyText}')
    
    # anatomy image
    content = content.replace('src="/collections/philosophy_sage_jar.png" alt="Anatomy Jar"', 'src={data.anatomyImage} alt="Anatomy Image"')
    
    # future of beauty tag
    content = content.replace('Advanced Formulations', '{data.futureOfBeautyTag}')
    
    # future of beauty text
    content = content.replace('Activate cellular regeneration with our science-backed innovations. \n              We are redefining the boundaries of modern skincare through high-potency, minimalist formulations designed for real, visible results.', '{data.futureOfBeautyText}')
    content = content.replace('Activate cellular regeneration with our science-backed innovations. We are redefining the boundaries of modern skincare through high-potency, minimalist formulations designed for real, visible results.', '{data.futureOfBeautyText}')
    
    # everyday essentials
    content = content.replace('Our beginner friendly Hyaluronic Acid 2% + B5 boosts hydration, while Niacinamide 10% + Zinc 1% improves the look of skin radiance. Formulated to provide lasting moisture and visible clarity.', '{data.everydayEssentialsText}')

    # Add the wrapper at the very end
    wrapper = """
export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F1F8] flex items-center justify-center text-primary font-serif italic text-2xl">Loading...</div>}>
      <CollectionsContent />
    </Suspense>
  );
}
"""
    content += wrapper

    with open(filename, 'w') as f:
        f.write(content)
        
    print("Done")

make_dynamic('app/collections/page.jsx')
