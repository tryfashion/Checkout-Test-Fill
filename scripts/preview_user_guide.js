const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const [docPath, outputPath] = process.argv.slice(2);
fs.mkdirSync(outputPath, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1 });
    await page.setContent('<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#ddd}.docx-wrapper{padding:0!important;background:#ddd!important}.docx-wrapper>section.docx{margin:0 auto 20px!important;box-shadow:none!important}</style></head><body><div id="document"></div></body></html>');
    await page.addScriptTag({ path: path.resolve('.guide-tools/node_modules/jszip/dist/jszip.min.js') });
    await page.addScriptTag({ path: path.resolve('.guide-tools/node_modules/docx-preview/dist/docx-preview.min.js') });
    const bytes = fs.readFileSync(docPath).toString('base64');
    await page.evaluate(async (base64) => {
      const binary = atob(base64);
      const data = Uint8Array.from(binary, c => c.charCodeAt(0));
      await window.docx.renderAsync(data.buffer, document.querySelector('#document'), null, { breakPages: true, useBase64URL: true });
    }, bytes);
    const pages = page.locator('.docx-wrapper > section.docx');
    const count = await pages.count();
    for (let i = 0; i < count; i++) await pages.nth(i).screenshot({ path: path.join(outputPath, `page-${i + 1}.png`) });
    console.log(`Previewed ${count} pages`);
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
