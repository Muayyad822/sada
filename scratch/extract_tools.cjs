const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\USER\\.gemini\\antigravity\\brain\\e8da27e0-cdf5-427d-9d43-02d0b0d9ca1f\\.system_generated\\steps\\7\\content.md', 'utf8');

// Look for patterns like "id": "search_quran" or id="search_quran"
const matches = content.match(/[a-z_]+_search|[a-z_]+_quran|fetch_[a-z_]+|list_[a-z_]+/g);
if (matches) {
  const unique = [...new Set(matches)];
  console.log(JSON.stringify(unique, null, 2));
} else {
  console.log("No matches found");
}
