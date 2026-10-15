import sys
import re

def add_purple(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Replace the beige hex codes with lavender tinted ones
    # F8F6F2 (Base beige) -> F5F1F8 (Subtle lavender base)
    content = content.replace('#F8F6F2', '#F5F1F8')
    
    # F0EDE8 (Section beige) -> ECE7F0 (Subtle lavender section)
    content = content.replace('#F0EDE8', '#ECE7F0')
    
    # Replace plain white backgrounds in sections with a very subtle purple tint
    # section className="... bg-white" -> bg-[#FCFAFF]
    content = re.sub(r'(<section[^>]*?className="[^"]*?)bg-white([^"]*?")', r'\1bg-[#FCFAFF]\2', content)

    with open(filename, 'w') as f:
        f.write(content)
    
    print("Done")

add_purple('app/collections/page.jsx')
