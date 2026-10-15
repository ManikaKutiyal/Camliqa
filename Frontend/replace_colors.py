import sys

def replace_colors(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    replacements = {
        '#384334': '#1A1A3E',
        '#2C3528': '#1A1A3E',
        '#3A4032': '#1A1A3E',
        '#1A1A1A': '#1A1A3E',
        '#7A8A70': '#C5A059',
        '#7C8872': '#C5A059',
        '#68765F': '#A88849',
        '#68735F': '#A88849',
        '#5C6B55': '#C5A059',
        '#A8B5A2': '#C5A059',
        '#4A5546': '#C5A059',
        '#4B443C': '#1A1A3E',
        '#524438': '#1A1A3E',
        '#F1EFEA': '#F8F6F2',
        '#EBECE8': '#F0EDE8',
        '#F4F3F0': '#F0EDE8',
        '#EAE8E3': '#F0EDE8',
        '#D6D2CA': '#F0EDE8',
        '#E3CDC1': '#E6DCC3',
        '#D0D2CC': '#E6DCC3',
        '#D6DDE0': '#E6DCC3',
        '#C3CCC2': '#E6DCC3'
    }

    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filename, 'w') as f:
        f.write(content)
    
    print("Done")

replace_colors('app/collections/page.jsx')
