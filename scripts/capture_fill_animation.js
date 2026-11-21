const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { chromium } = require('playwright');

const output = path.resolve(process.argv[2] || 'release/animation-frames');
fs.mkdirSync(output, { recursive: true });
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Checkout demo</title><style>
body{margin:0;font:16px Arial,sans-serif;color:#202124;background:linear-gradient(90deg,#fff 0 58%,#f5f6f7 58%)}header{padding:18px 7%;border-bottom:1px solid #ddd;font-size:21px;font-weight:700}.demo{position:absolute;right:20px;top:16px;color:#6b7280;font-size:13px}.wrap{width:520px;margin:24px 0 36px 7%}h2{font-size:20px;margin:25px 0 12px}.row{display:flex;gap:12px}.row>*{flex:1}label{display:block;font-size:13px;color:#666;margin-top:10px}input,select{box-sizing:border-box;width:100%;height:43px;margin-top:5px;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;background:#fff;font:16px Arial}.side{position:absolute;left:66%;top:122px;width:265px;color:#444}.side h2{margin-top:0}button{position:fixed;right:25px;top:65%;background:#1769d3;color:white;border:0;border-radius:22px;padding:13px 24px;font-weight:700;font-size:15px;box-shadow:0 3px 12px #aaa;cursor:pointer}button:hover{background:#0d53ab}button.busy{background:#6393ce}.status{position:fixed;right:25px;top:72%;background:white;padding:8px 12px;border-radius:6px;color:#356c37;font-size:13px;box-shadow:0 2px 8px #ddd;display:none}
</style></head><body><header>My Store</header><span class="demo">Checkout 操作示意</span><main class="wrap"><h2>Contact</h2><label>Email<input type="email" name="email" placeholder="Email"></label><h2>Shipping address</h2><label>Country/Region<select name="country"><option value="US">United States</option></select></label><div class="row"><label>First Name<input name="first_name" placeholder="First Name"></label><label>Last Name<input name="last_name" placeholder="Last Name"></label></div><label>Street Address<input name="address1" placeholder="Street Address"></label><div class="row"><label>City<input name="city" placeholder="City"></label><label>State<select name="state"><option value="">State</option><option value="CA">California</option></select></label><label>ZIP Code<input name="zip" placeholder="ZIP Code"></label></div><label>Phone Number<input type="tel" name="phone" placeholder="Phone Number"></label></main><aside class="side"><h2>Order summary</h2><p>Sample item · $29.00</p><hr><p>Subtotal · $29.00</p><p>Total · $29.00</p></aside><button id="generate">生成资料</button><div class="status" id="status">测试资料已填入</div></body></html>`;
const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); });
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'checkout-anim-'));
  const browser = await chromium.launchPersistentContext(profile, { executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, viewport: { width: 900, height: 660 } });
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/checkout`);
    const buttonBox = await page.locator('#generate').boundingBox();
    await page.evaluate(box => {
      const ring = document.createElement('div');
      ring.id = 'tap-ring';
      ring.style.cssText = `position:fixed;left:${box.x - 12}px;top:${box.y - 10}px;width:${box.width + 24}px;height:${box.height + 20}px;border:5px solid #f22d2d;border-radius:999px;box-sizing:border-box;z-index:1000;pointer-events:none;display:none;box-shadow:0 0 0 3px #fff`;
      const hand = document.createElement('div');
      hand.id = 'tap-hand';
      hand.style.cssText = `position:fixed;left:${box.x + box.width / 2 + 12}px;top:${box.y + box.height / 2 + 4}px;width:52px;height:58px;z-index:1001;pointer-events:none;display:none;filter:drop-shadow(2px 3px 1px #777)`;
      hand.innerHTML = '<svg width="52" height="58" viewBox="0 0 52 58" xmlns="http://www.w3.org/2000/svg"><path d="M18 53c-4-5-8-10-11-14-3-4-2-8 1-10 4-2 7 0 10 3V10c0-4 2-6 6-6s6 2 6 6v19c3-3 7-2 8 1 4-1 7 2 7 5 4 1 5 4 5 7v2c0 4-2 8-5 10H18Z" fill="#fff" stroke="#111827" stroke-width="3" stroke-linejoin="round"/></svg>';
      document.body.append(ring, hand);
    }, buttonBox);
    let index = 0;
    const snap = async () => page.screenshot({ path: path.join(output, `frame-${String(index++).padStart(2, '0')}.png`) });
    await snap();
    await page.locator('#generate').hover();
    await page.evaluate(() => { document.querySelector('#tap-ring').style.display = 'block'; document.querySelector('#tap-hand').style.display = 'block'; });
    await snap();
    await page.locator('#generate').click();
    await page.locator('#generate').evaluate(el => { el.textContent = '生成中…'; el.classList.add('busy'); });
    await page.evaluate(() => { document.querySelector('#tap-ring').style.borderWidth = '7px'; document.querySelector('#tap-hand').style.transform = 'translate(-3px,-4px) scale(.91)'; });
    await snap();
    await page.evaluate(() => { document.querySelector('#tap-hand').style.display = 'none'; document.querySelector('#tap-ring').style.borderWidth = '5px'; });
    const steps = [
      ['input[name=email]', 'jessica.campbell1989@gmail.com'],
      ['input[name=first_name]', 'Jessica'],
      ['input[name=last_name]', 'Campbell'],
      ['input[name=address1]', '1272 Market St'],
      ['input[name=city]', 'San Francisco'],
      ['select[name=state]', 'CA'],
      ['input[name=zip]', '94102'],
      ['input[name=phone]', '4155550113'],
    ];
    for (const [selector, value] of steps) {
      if (selector.startsWith('select')) await page.locator(selector).selectOption(value);
      else await page.locator(selector).fill(value);
      await snap();
    }
    await page.locator('#generate').evaluate(el => { el.textContent = '生成资料'; el.classList.remove('busy'); el.blur(); });
    await page.evaluate(() => { document.querySelector('#tap-ring').style.display = 'none'; });
    await page.locator('#status').evaluate(el => { el.style.display = 'block'; });
    await snap();
    await snap();
    console.log(`Captured ${index} frames`);
  } finally {
    await browser.close();
    if (!path.resolve(profile).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw new Error('Unexpected profile path');
    fs.rmSync(profile, { recursive: true, force: true });
    server.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; server.close(); });
