import sys

def replace_colors(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    replacements = {
        '#3A3F36': '#1A1A3E',
        '#5A5F55': '#1A1A3E',
        '#5E4D3C': '#1A1A3E',
        '#636C59': '#A88849',
        '#78826D': '#C5A059',
        '#78886D': '#A88849',
        '#8A9A80': '#C5A059',
        '#9FA895': '#C5A059',
        '#D5BCAD': '#A88849',
        '#E8E6E1': '#F0EDE8',
        '#F2F2F2': '#F8F6F2',
        '#F6F5F2': '#F8F6F2',
        '#F9F9F9': '#F8F6F2',
        '#FDF9F4': '#F8F6F2',
    }

    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filename, 'w') as f:
        f.write(content)
    
    print("Done")

replace_colors('app/collections/page.jsx')
