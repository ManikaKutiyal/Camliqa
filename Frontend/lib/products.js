const products = [
  // Skin Care (IDs 1-20)
  {
    id: 1,
    name: "Luminous Dew Gel Cleanser",
    price: "₹1,299",
    category: "Cleansers",
    tag: "Best Seller",
    image: "/collections/uploaded_prod_1.png",
    description: "A gentle, pH-balanced cleanser that transforms into a milky emulsion to dissolve impurities without stripping essential moisture.",
    benefits: ["Deeply cleanses", "Hydrates", "Refines texture"],
    ingredients: ["Hyaluronic Acid", "Rose Water", "Green Tea Extract"]
  },
  {
    id: 2,
    name: "Molecular Recovery Serum",
    price: "₹2,499",
    category: "Serums",
    tag: "New Arrival",
    image: "/collections/uploaded_prod_2.png",
    description: "A high-potency serum designed to repair the skin barrier and deliver deep hydration at a molecular level.",
    benefits: ["Repairs barrier", "Intense hydration", "Anti-aging"],
    ingredients: ["Peptides", "Niacinamide", "Squalane"]
  },
  {
    id: 3,
    name: "Velvet Cloud Moisturizer",
    price: "₹1,899",
    category: "Moisturizers",
    tag: "Clinical",
    image: "/collections/uploaded_prod_3.png",
    description: "An airy, whipped moisturizer that provides 48-hour hydration and a soft-focus finish.",
    benefits: ["48hr hydration", "Soothing", "Smooth finish"],
    ingredients: ["Ceramides", "Aloe Vera", "Vitamin E"]
  },
  {
    id: 4,
    name: "Midnight Botanical Oil",
    price: "₹3,199",
    category: "Oils",
    tag: "Rare",
    image: "/collections/uploaded_prod_4.png",
    description: "A luxurious overnight treatment oil that restores radiance and elasticity while you sleep.",
    benefits: ["Restores radiance", "Deep nourishment", "Improves elasticity"],
    ingredients: ["Retinol", "Jojoba Oil", "Argan Oil"]
  },
  {
    id: 5,
    name: "Aura Brightening Essence",
    price: "₹1,599",
    category: "Serums",
    tag: "Trending",
    image: "/collections/uploaded_prod_5.png",
    description: "A watery essence that preps the skin, amplifying the absorption of serums while providing an immediate lit-from-within glow.",
    benefits: ["Brightens", "Preps skin", "Hydrates"],
    ingredients: ["Vitamin C", "Licorice Root", "Ginseng"]
  },
  {
    id: 6,
    name: "Purity Enzyme Mask",
    price: "₹2,199",
    category: "Masks",
    tag: "Best Seller",
    image: "/collections/tubes_landscape.png",
    description: "An exfoliating mask powered by fruit enzymes to instantly resurface dull skin, revealing a remarkably smooth texture.",
    benefits: ["Exfoliates", "Unclogs pores", "Smooths"],
    ingredients: ["Papaya Enzyme", "Pineapple Enzyme", "Lactic Acid"]
  },
  {
    id: 7,
    name: "Barrier Shield Cream",
    price: "₹2,799",
    category: "Moisturizers",
    tag: "Clinical",
    image: "/collections/cream_jar.png",
    description: "A rich, cocooning cream formulated to rescue compromised, irritated, or severely dry skin.",
    benefits: ["Deeply nourishing", "Calms redness", "Fortifies barrier"],
    ingredients: ["Colloidal Oatmeal", "Shea Butter", "Madecassoside"]
  },
  {
    id: 8,
    name: "Golden Elixir Eye Serum",
    price: "₹1,999",
    category: "Serums",
    tag: "Award Winner",
    image: "/collections/dark_bottles_group.png",
    description: "A concentrated eye treatment that targets dark circles and fine lines with a cooling applicator tip.",
    benefits: ["Depuffs", "Brightens dark circles", "Smooths fine lines"],
    ingredients: ["Caffeine", "Peptides", "Hyaluronic Acid"]
  },
  {
    id: 15,
    name: "Clinical Niacinamide 20%",
    price: "₹2,299",
    category: "Serums",
    tag: "Elite",
    image: "/collections/clinical_serum.png",
    description: "An advanced treatment for enlarged pores and uneven texture.",
    benefits: ["Refines pores", "Smooths skin", "Balances oil"],
    ingredients: ["Niacinamide", "Vitamin C", "Zinc"]
  },
  {
    id: 16,
    name: "Saffron Glow Mask",
    price: "₹3,499",
    category: "Masks",
    tag: "Rare",
    image: "/collections/uploaded_prod_1.png",
    description: "Infused with pure Kashmiri saffron for an immediate luminosity boost.",
    benefits: ["Instant glow", "Brightening", "Anti-oxidant"],
    ingredients: ["Kashmiri Saffron", "Honey", "Turmeric"]
  },
  {
    id: 17,
    name: "Ceramide Milk Cleanser",
    price: "₹1,499",
    category: "Cleansers",
    tag: "Gentle",
    image: "/collections/uploaded_prod_2.png",
    description: "A soothing milk cleanser for sensitive skin barriers.",
    benefits: ["Soothing", "Barrier repair", "Softening"],
    ingredients: ["Ceramides", "Oat Milk", "Vitamin B5"]
  },
  {
    id: 18,
    name: "Hydro-Infusion Gel",
    price: "₹1,799",
    category: "Moisturizers",
    tag: "Hydration",
    image: "/collections/uploaded_prod_3.png",
    description: "A weightless gel that floods skin with moisture.",
    benefits: ["Intense hydration", "Weightless", "Refreshing"],
    ingredients: ["Hyaluronic Acid", "Cucumber Extract", "Aloe"]
  },

  // Hair Care (IDs 9-14, 20-30)
  {
    id: 9,
    name: "Volumizing Root Lift",
    price: "₹1,499",
    category: "Serums",
    tag: "Best Seller",
    image: "/collections/pump_bottle.png",
    description: "A weightless serum that provides instant lift and long-lasting volume at the roots.",
    benefits: ["Instant lift", "Weightless volume", "Scalp health"],
    ingredients: ["Biotin", "Rice Protein", "Saw Palmetto"]
  },
  {
    id: 10,
    name: "Follicle Density Booster",
    price: "₹2,899",
    category: "Serums",
    tag: "Clinical",
    image: "/collections/clinical_serum.png",
    description: "A concentrated daily treatment that supports the appearance of thicker, fuller hair.",
    benefits: ["Increases density", "Strengthens follicles", "Reduces shedding"],
    ingredients: ["Redensyl", "Procapil", "Capixyl"]
  },
  {
    id: 11,
    name: "Hydra-Gloss Conditioner",
    price: "₹1,699",
    category: "Moisturizers",
    tag: "Trending",
    image: "/collections/philosophy_sage_jar.png",
    description: "A deeply hydrating conditioner that seals the cuticle for high-gloss shine.",
    benefits: ["High-gloss shine", "Anti-frizz", "Deeply hydrates"],
    ingredients: ["Silk Amino Acids", "Abyssinian Oil", "Hibiscus Extract"]
  },
  {
    id: 12,
    name: "Botanical Pre-Wash Oil",
    price: "₹2,399",
    category: "Oils",
    tag: "Rare",
    image: "/collections/pure_care_left.jpg",
    description: "A rich treatment oil to be used before shampooing to protect hair.",
    benefits: ["Protects shaft", "Deeply conditions", "Prevents breakage"],
    ingredients: ["Castor Oil", "Rosemary Extract", "Vitamin E"]
  },
  {
    id: 13,
    name: "Clarifying Scalp Scrub",
    price: "₹1,299",
    category: "Cleansers",
    tag: "New Arrival",
    image: "/collections/splashing_serum.png",
    description: "An exfoliating scrub that removes product buildup for a healthy scalp.",
    benefits: ["Detoxifies scalp", "Removes buildup", "Invigorates"],
    ingredients: ["Sea Salt", "Peppermint Oil", "Salicylic Acid"]
  },
  {
    id: 14,
    name: "Overnight Repair Mask",
    price: "₹2,599",
    category: "Masks",
    tag: "Clinical",
    image: "/collections/cream_jar.png",
    description: "An intensive overnight hair mask that repairs damage from heat styling.",
    benefits: ["Deep repair", "Intense softness", "Strengthens hair"],
    ingredients: ["Keratin", "Argan Butter", "Panthenol"]
  },
  {
    id: 20,
    name: "Silk Fusion Serum",
    price: "₹1,999",
    category: "Serums",
    tag: "Gloss",
    image: "/collections/uploaded_prod_4.png",
    description: "A transformative serum for glass-like hair texture.",
    benefits: ["Glass shine", "Frizz control", "Heat protection"],
    ingredients: ["Silk Protein", "Argan Oil", "Vitamin E"]
  },
  {
    id: 21,
    name: "Rosemary Scalp Tonic",
    price: "₹1,399",
    category: "Oils",
    tag: "Scalp Care",
    image: "/collections/uploaded_prod_5.png",
    description: "Traditional rosemary blend for stimulating hair growth.",
    benefits: ["Stimulates growth", "Scalp health", "Thicker hair"],
    ingredients: ["Rosemary Oil", "Peppermint Oil", "Castor Oil"]
  },
  {
    id: 22,
    name: "Quench Moisture Mask",
    price: "₹2,199",
    category: "Masks",
    tag: "Hydration",
    image: "/collections/tubes_landscape.png",
    description: "A deep-sea mineral mask for ultra-dry curls.",
    benefits: ["Curl definition", "Moisture surge", "Softness"],
    ingredients: ["Sea Kelp", "Mango Butter", "Avocado Oil"]
  },
  {
    id: 23,
    name: "Volumizing Powder",
    price: "₹999",
    category: "Serums",
    tag: "Styling",
    image: "/collections/pump_bottle.png",
    description: "Instant lift and matte texture for fine hair.",
    benefits: ["Instant lift", "Matte finish", "Texturizing"],
    ingredients: ["Silica Silylate", "Aloe Powder", "Rice Starch"]
  },
  
  // Bath & Body (IDs 24-31)
  {
    id: 24,
    name: "Eucalyptus & Mint Body Wash",
    price: "₹1,499",
    category: "Cleansers",
    tag: "Refreshing",
    image: "/collections/uploaded_prod_1.png",
    description: "An invigorating daily body wash that awakens the senses with eucalyptus and wild mint extracts.",
    benefits: ["Invigorates senses", "Deeply purifies", "Maintains moisture"],
    ingredients: ["Eucalyptus Oil", "Peppermint", "Tea Tree Extract"]
  },
  {
    id: 25,
    name: "Whipped Shea Body Butter",
    price: "₹2,199",
    category: "Moisturizers",
    tag: "Best Seller",
    image: "/collections/cream_jar.png",
    description: "A decadent, whipped body cream that melts into dry skin for ultra-rich nourishment and comfort.",
    benefits: ["24hr moisture", "Intense softening", "Restores elasticity"],
    ingredients: ["Raw Shea Butter", "Jojoba Oil", "Vitamin E"]
  },
  {
    id: 26,
    name: "Cocoa Smoothing Body Lotion",
    price: "₹1,799",
    category: "Moisturizers",
    tag: "Daily Essential",
    image: "/collections/uploaded_prod_3.png",
    description: "A fast-absorbing, velvet body lotion that smooths texture and delivers deep daily hydration.",
    benefits: ["Fast-absorbing", "Velvet finish", "Rich hydration"],
    ingredients: ["Cocoa Butter", "Sweet Almond Oil", "Aloe Vera"]
  },
  {
    id: 27,
    name: "Sandalwood Bath Salts",
    price: "₹2,499",
    category: "Masks",
    tag: "Rare",
    image: "/collections/dark_bottles_group.png",
    description: "A therapeutic blend of Epsom salts and precious Mysore sandalwood oil to soothe muscles and calm the mind.",
    benefits: ["Relieves tension", "Calms mind", "Softens skin"],
    ingredients: ["Sandalwood Oil", "Epsom Salt", "Himalayan Pink Salt"]
  },
  {
    id: 28,
    name: "Lavender Dream Bath Bomb",
    price: "₹999",
    category: "Masks",
    tag: "Relaxing",
    image: "/collections/tubes_landscape.png",
    description: "A fizzy, relaxing bath treat infused with organic French lavender to prepare you for deep, restful sleep.",
    benefits: ["Calming fizz", "Aromatherapy", "Nourishes skin"],
    ingredients: ["Lavender Essential Oil", "Baking Soda", "Coconut Oil"]
  },
  {
    id: 29,
    name: "Jasmine Glow Body Oil",
    price: "₹2,899",
    category: "Oils",
    tag: "Elite",
    image: "/collections/uploaded_prod_4.png",
    description: "A luxurious dry oil that leaves body with a satin sheen and an intoxicating jasmine scent.",
    benefits: ["Satin sheen", "Non-greasy", "Intoxicating scent"],
    ingredients: ["Jasmine Extract", "Argan Oil", "Squalane"]
  },
  {
    id: 30,
    name: "Citrus Exfoliating Scrub",
    price: "₹1,599",
    category: "Cleansers",
    tag: "Brightening",
    image: "/collections/uploaded_prod_5.png",
    description: "A bright, polishing sugar scrub that buffs away dry cells to reveal a luminous, glowing complexion.",
    benefits: ["Polishes skin", "Brightens tone", "Softens texture"],
    ingredients: ["Sugar Crystals", "Orange Peel Oil", "Grapefruit Extract"]
  },
  {
    id: 31,
    name: "Sea Mineral Soothing Gel",
    price: "₹1,899",
    category: "Moisturizers",
    tag: "Trending",
    image: "/collections/uploaded_prod_2.png",
    description: "A cooling body gel enriched with marine algae to instantly soothe sun-exposed or parched skin.",
    benefits: ["Cooling effect", "Instant soothing", "Lightweight"],
    ingredients: ["Sea Algae", "Aloe Vera", "Hyaluronic Acid"]
  }
];

export default products;
