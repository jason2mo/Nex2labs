const { chromium } = require('playwright');

async function checkLogoUrl() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('=== 检查 logo.png 在 GitHub Pages 上的实际 URL ===\n');
  
  // 检查几个可能的路径
  const paths = [
    'https://jason2mo.github.io/logo.png',
    'https://jason2mo.github.io/Nex2labs/logo.png',
    'https://jason2mo.github.io/Nextolabshomepage/logo.png',
    'https://jason2mo.github.io/Nex2labs/images/logo.png',
    'https://jason2mo.github.io/Nextolabshomepage/images/logo.png',
    'https://jason2mo.github.io/Nextolabshomepage/Nex2labs/logo.png',
  ];
  
  for (const url of paths) {
    try {
      const resp = await page.evaluate(async (u) => {
        const r = await fetch(u, { method: 'HEAD' });
        return { status: r.status, contentType: r.headers.get('content-type') };
      }, url);
      const icon = resp.status === 200 ? '✓' : '✗';
      console.log(`${icon} ${resp.status} ${resp.contentType} - ${url}`);
    } catch (err) {
      console.log(`✗ ERROR - ${url}: ${err.message}`);
    }
  }
  
  // 检查 /logo.png 在 Nex2labs 站点根目录
  console.log('\n--- 检查当前网站实际可用的 logo ---');
  await page.goto('https://jason2mo.github.io/Nex2labs/', { waitUntil: 'networkidle' });
  const navImg = await page.$('nav img');
  if (navImg) {
    const src = await navImg.getAttribute('src');
    const naturalWidth = await navImg.evaluate(img => img.naturalWidth);
    console.log(`nav img src: ${src}`);
    console.log(`nav img naturalWidth: ${naturalWidth}`);
    
    // 测试这个 src 是否有效
    if (src) {
      const imgResp = await page.evaluate(async (u) => {
        const r = await fetch(u, { method: 'HEAD' });
        return { status: r.status, ok: r.ok };
      }, src.startsWith('http') ? src : `https://jason2mo.github.io/Nex2labs${src}`);
      console.log(`logo 图片请求状态: ${imgResp.status} (${imgResp.ok ? 'OK' : 'FAIL'})`);
    }
  } else {
    console.log('nav img: 未找到');
    // 尝试找品牌名文字
    const brandText = await page.$eval('nav', el => el.textContent?.trim());
    console.log(`nav 内容: ${brandText}`);
  }
  
  await browser.close();
}

checkLogoUrl().catch(console.error);
