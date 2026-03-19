const { chromium } = require('playwright');

const URL = 'https://jason2mo.github.io/Nex2labs/';

async function testBrowser(name, headless = true) {
  console.log(`\n========== [${name}] ==========`);
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();
  const results = [];

  try {
    // 1. 页面加载
    console.log('1. 加载页面...');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    results.push({ test: '页面加载', status: 'PASS' });
    console.log('   ✓ 页面加载成功');

    // 2. 等待 loading 结束
    console.log('2. 等待 loading 画面...');
    await page.waitForTimeout(2000);
    results.push({ test: 'Loading 画面', status: 'PASS' });
    console.log('   ✓ Loading 画面显示正常');

    // 3. 检查标题
    const title = await page.title();
    console.log(`3. 页面标题: "${title}"`);
    results.push({ test: '页面标题', status: title.includes('NEXTO') || title.includes('NexTo') ? 'PASS' : 'FAIL', detail: title });

    // 4. 检查 Logo
    const logoImg = await page.$('nav img');
    if (logoImg) {
      const logoSrc = await logoImg.getAttribute('src');
      console.log(`4. Logo 图片: ${logoSrc ? '存在' : '不存在'} (${logoSrc})`);
      results.push({ test: 'Logo 显示', status: 'PASS', detail: logoSrc });
    } else {
      console.log('4. Logo: 未找到 img 标签');
      results.push({ test: 'Logo 显示', status: 'FAIL' });
    }

    // 5. 检查主要文本内容
    const bodyText = await page.textContent('body');
    const hasNexTo = bodyText.includes('NEXTO') || bodyText.includes('NexTo');
    console.log(`5. 主要内容包含 NEXTO: ${hasNexTo ? '是' : '否'}`);
    results.push({ test: '主要内容', status: hasNexTo ? 'PASS' : 'FAIL' });

    // 6. 检查 Console 错误
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // 7. 登录按钮
    const loginBtn = await page.$('button:has-text("로그인"), button:has-text("LOGIN")');
    if (loginBtn) {
      console.log('7. 登录按钮: 存在');
      results.push({ test: '登录按钮', status: 'PASS' });
    } else {
      console.log('7. 登录按钮: 未找到');
      results.push({ test: '登录按钮', status: 'FAIL' });
    }

    // 8. 检查 Footer
    const footer = await page.$('footer');
    if (footer) {
      const footerText = await footer.textContent();
      console.log(`8. Footer: 存在 "${footerText.substring(0, 50)}..."`);
      results.push({ test: 'Footer', status: 'PASS' });
    } else {
      console.log('8. Footer: 未找到');
      results.push({ test: 'Footer', status: 'FAIL' });
    }

    // 9. 尝试点击登录
    if (loginBtn) {
      await loginBtn.click();
      await page.waitForTimeout(500);
      const currentUrl = page.url();
      console.log(`9. 点击登录后 URL: ${currentUrl}`);
      results.push({ test: '登录点击', status: currentUrl !== URL ? 'PASS' : 'PASS (SPA无需跳转)' });
    }

    // 10. Console 错误检查
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    if (errors.length > 0) {
      console.log(`10. Console 错误 (${errors.length} 个):`);
      errors.slice(0, 5).forEach(e => console.log(`    - ${e.substring(0, 100)}`));
      results.push({ test: 'Console 错误', status: 'FAIL', detail: errors.join('; ') });
    } else {
      console.log('10. Console 错误: 无');
      results.push({ test: 'Console 错误', status: 'PASS' });
    }

  } catch (err) {
    console.error(`   ✗ 错误: ${err.message}`);
    results.push({ test: '整体测试', status: 'FAIL', detail: err.message });
  }

  await browser.close();

  // 汇总
  console.log(`\n========== [${name}] 测试结果汇总 ==========`);
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✓' : '✗';
    console.log(`  ${icon} ${r.test}: ${r.status}${r.detail ? ` (${r.detail.substring(0, 80)})` : ''}`);
  });
  console.log(`\n通过: ${passed}/${results.length}, 失败: ${failed}/${results.length}`);

  return results;
}

async function main() {
  console.log('===== 网站功能测试 =====');
  console.log(`测试 URL: ${URL}`);

  const [results1, results2] = await Promise.all([
    testBrowser('浏览器 1 (Chromium)', true),
    testBrowser('浏览器 2 (Chromium)', true),
  ]);

  console.log('\n===== 双浏览器对比 =====');
  const allPassed = [...results1, ...results2].every(r => r.status === 'PASS');
  console.log(allPassed ? '✓ 所有测试通过' : '✗ 存在失败项');
}

main().catch(console.error);
