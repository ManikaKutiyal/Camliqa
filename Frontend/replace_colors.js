const fs = require('fs');
let content = fs.readFileSync('app/collections/page.jsx', 'utf8');

// Dark greens to Navy (primary)
content = content.replace(/#384334/g, '#1A1A3E');
content = content.replace(/#2C3528/g, '#1A1A3E');
content = content.replace(/#3A4032/g, '#1A1A3E');
content = content.replace(/#1A1A1A/g, '#1A1A3E');

// Sage greens to Gold (secondary)
content = content.replace(/#7A8A70/g, '#C5A059');
content = content.replace(/#7C8872/g, '#C5A059');
content = content.replace(/#68765F/g, '#A88849');
content = content.replace(/#68735F/g, '#A88849');

// Light sage text to Gold
content = content.replace(/#5C6B55/g, '#C5A059');
content = content.replace(/#A8B5A2/g, '#C5A059');
content = content.replace(/#4A5546/g, '#C5A059');

// Dark browns (backgrounds) to Navy (primary)
content = content.replace(/#4B443C/g, '#1A1A3E');
content = content.replace(/#524438/g, '#1A1A3E');

// Beiges to Base/Section colors
content = content.replace(/#F1EFEA/g, '#F8F6F2');
content = content.replace(/#EBECE8/g, '#F0EDE8');
content = content.replace(/#F4F3F0/g, '#F0EDE8');
content = content.replace(/#EAE8E3/g, '#F0EDE8');
content = content.replace(/#D6D2CA/g, '#F0EDE8');

// Special cases
content = content.replace(/#E3CDC1/g, '#E6DCC3'); 
content = content.replace(/#D0D2CC/g, '#E6DCC3');
content = content.replace(/#D6DDE0/g, '#E6DCC3');
content = content.replace(/#C3CCC2/g, '#E6DCC3');

fs.writeFileSync('app/collections/page.jsx', content);
console.log("Colors replaced!");
