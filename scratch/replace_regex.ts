const html = `
<html>
<body>
  <div>
    <a href="/legal/policies">Policies</a>
    <a href="https://example.com/privacy" class="link">Privacy</a>
  </div>
</body>
</html>
`;
const regex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
const candidates = [];
let match;
while ((match = regex.exec(html)) !== null) {
  const href = match[1];
  const text = match[2];
  candidates.push({ href, text });
}
console.log(candidates);
