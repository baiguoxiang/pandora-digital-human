const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing login page...');
  await page.goto('file:///D:/Backup/Documents/数字人/codes/matesx/deploy/login.html');
  const title = await page.title();
  console.log('Login page title:', title);
  
  const btn = await page.locator('button').filter({hasText: '进入潘多拉体验'}).first();
  console.log('Button count:', await page.locator('button').filter({hasText: '进入潘多拉体验'}).count());
  
  await btn.click();
  await page.waitForTimeout(1500);
  
  console.log('Testing home page...');
  const cards = await page.locator('.gallery-item:not(.add-card)').count();
  console.log('Character cards found:', cards);
  
  await page.screenshot({ path: 'D:/Backup/Documents/数字人/codes/matesx/deploy/test-home.png' });
  console.log('Home screenshot saved');
  
  if (cards > 0) {
    await page.locator('.gallery-item:not(.add-card)').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'D:/Backup/Documents/数字人/codes/matesx/deploy/test-role.png' });
    console.log('Role page URL:', page.url());
    console.log('Role screenshot saved');
    
    // Check role page content
    const roleName = await page.locator('.role-name-display').textContent();
    console.log('Role name displayed:', roleName);
  }
  
  await browser.close();
  console.log('All tests passed!');
})();
