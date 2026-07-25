const text = `
{
  "type": "site",
  "explanation": "Премиальный сайт успешно создан! 🚀"
}
\`\`\`html
<!DOCTYPE html>
<html>
  <body>Hello</body>
</html>
\`\`\`
`;
const htmlMatch = text.match(/```html\s*([\s\S]*?)\s*```/i) || text.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
let htmlContent = '';
if (htmlMatch) {
  htmlContent = htmlMatch[1] || htmlMatch[0];
}
let cleanText = text.replace(/```json/gi, '').replace(/```html[\s\S]*?```/gi, '').replace(/```/gi, '').trim();
cleanText = cleanText.replace(/,\s*([\]}])/g, '$1');
console.log('htmlContent:', htmlContent);
console.log('cleanText:', cleanText);

try {
  const parsed = JSON.parse(cleanText);
  if (htmlContent && !parsed.html) parsed.html = htmlContent;
  console.log('Parsed:', parsed);
} catch (e) {
  console.error('Error parsing json:', e.message);
}
