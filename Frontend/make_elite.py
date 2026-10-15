import re

def make_elite(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Change all heading font-sans to font-serif
    content = re.sub(r'(<h[1-6][^>]*?className="[^"]*?)font-sans([^"]*?")', r'\1font-serif\2', content)
    
    # Reduce heavy weights on headings for a more elegant editorial look
    content = re.sub(r'(<h[1-6][^>]*?className="[^"]*?)font-bold([^"]*?")', r'\1font-medium\2', content)
    content = re.sub(r'(<h[1-6][^>]*?className="[^"]*?)font-semibold([^"]*?")', r'\1font-medium\2', content)
    
    # Specific tweaks to make headers larger and more editorial
    # Bestsellers
    content = content.replace('text-3xl sm:text-4xl font-semibold', 'text-4xl sm:text-5xl font-medium tracking-tight')
    
    # Recommended Products Title
    content = content.replace('text-5xl sm:text-[4rem] font-medium', 'text-5xl sm:text-[5rem] font-light tracking-tighter')
    
    # Everyday essentials
    content = content.replace('text-[2.5rem] sm:text-[3.5rem] font-bold', 'text-[3rem] sm:text-[4.5rem] font-medium tracking-tight')
    
    # Formulated with intention
    content = content.replace('text-2xl sm:text-[2.75rem] lg:text-[3.5rem] font-medium', 'text-3xl sm:text-[3.5rem] lg:text-[4.5rem] font-light tracking-tighter')
    
    # Pure care
    content = content.replace('text-3xl sm:text-4xl font-medium', 'text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight')

    # Card Titles (Recommended products carousel)
    # They were h3 with font-sans text-[16px] font-medium. We change to font-serif italic text-xl
    content = re.sub(r'(<h3[^>]*?className="[^"]*?)text-\[16px\] font-medium([^"]*?")', r'\1text-xl italic font-light\2', content)
    
    # Bestseller Cards
    # <h3 className="font-serif text-lg font-bold text-primary mb-1">{product.name}</h3>
    content = re.sub(r'(<h3[^>]*?className="[^"]*?)text-lg font-medium text-primary([^"]*?")', r'\1text-2xl italic font-light text-primary\2', content)
    content = re.sub(r'(<h3[^>]*?className="[^"]*?)text-lg font-bold text-primary([^"]*?")', r'\1text-2xl italic font-light text-primary\2', content)
    
    with open(filename, 'w') as f:
        f.write(content)

make_elite('app/collections/page.jsx')
