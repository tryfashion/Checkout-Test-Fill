const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');

const [outputPath] = process.argv.slice(2);
if (!outputPath) throw new Error('output path required');
fs.mkdirSync(outputPath, { recursive: true });
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Demo checkout</title><style>
body{margin:0;font:16px Arial,sans-serif;color:#202124;background:linear-gradient(90deg,#fff 0 58%,#f5f6f7 58%)}header{padding:20px 8%;border-bottom:1px solid #ddd;font-size:22px;font-weight:700}.wrap{width:520px;margin:28px 0 50px 8%}h2{font-size:21px;margin:28px 0 14px}.row{display:flex;gap:12px}.row>*{flex:1}label{display:block;font-size:13px;color:#666;margin-top:12px}input,select{box-sizing:border-box;width:100%;height:46px;margin-top:5px;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;background:#fff;font:16px Arial}.side{position:absolute;left:66%;top:125px;width:290px;color:#444}.side h2{margin-top:0}
</style></head><body><header>My Store</header><main class="wrap"><h2>Contact</h2><label>Email<input type="email" autocomplete="email" placeholder="Email"></label><h2>Shipping address</h2><label>Country/Region<select name="country"><option value="US">United States</option></select></label><div class="row"><label>First Name<input name="first_name" placeholder="First Name"></label><label>Last Name<input name="last_name" placeholder="Last Name"></label></div><label>Street Address<input name="address1" placeholder="Street Address"></label><div class="row"><label>City<input name="city" placeholder="City"></label><label>State<select name="state"><option value="">State</option><option value="CA">California</option></select></label><label>ZIP Code<input name="zip" placeholder="ZIP Code"></label></div><label>Phone Number<input type="tel" name="phone" placeholder="Phone Number"></label></main><aside class="side"><h2>Order summary</h2><p>Sample item · $29.00</p><hr><p>Subtotal · $29.00</p><p>Total · $29.00</p></aside></body></html>`;
const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); });
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'checkout-guide-'));
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true, locale: 'zh-CN', viewport: { width: 900, height: 900 },
    args: ['--no-first-run']
  });
  try {
    const page = await context.newPage();
    await page.goto('chrome://extensions');
    await page.setViewportSize({ width: 900, height: 360 });
    const devMode = page.locator('extensions-manager').locator('#devMode');
    if (await devMode.count()) await devMode.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputPath, '01-extensions.png') });
    await page.goto(`http://127.0.0.1:${port}/checkout`);
    await page.setViewportSize({ width: 900, height: 700 });
    await page.evaluate(() => {
      const button = document.createElement('button');
      button.textContent = '生成资料';
      button.style.cssText = 'position:fixed;right:24px;top:65%;background:#1769d3;color:white;border:0;border-radius:22px;padding:13px 24px;font-weight:700;font-size:15px;box-shadow:0 3px 12px #aaa';
      document.body.append(button);
    });
    await page.screenshot({ path: path.join(outputPath, '02-checkout-before.png') });
    await page.locator('input[type=email]').fill('jessica.campbell1989@gmail.com');
    await page.locator('input[name=first_name]').fill('Jessica');
    await page.locator('input[name=last_name]').fill('Campbell');
    await page.locator('input[name=address1]').fill('1272 Market St');
    await page.locator('input[name=city]').fill('San Francisco');
    await page.locator('select[name=state]').selectOption('CA');
    await page.locator('input[name=zip]').fill('94102');
    await page.locator('input[name=phone]').fill('4155550113');
    await page.screenshot({ path: path.join(outputPath, '03-checkout-after.png') });
    console.log('Created sample interface screenshots');
  } finally {
    await context.close();
    if (!path.resolve(profile).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw new Error('Unexpected profile path');
    fs.rmSync(profile, { recursive: true, force: true });
    server.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; server.close(); });
