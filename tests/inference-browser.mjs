import { chromium } from '@playwright/test';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
page.on('console',m=>console.log('CONSOLE',m.type(),m.text()));page.on('pageerror',e=>console.log('PAGE ERROR',e.message));
await page.goto('http://127.0.0.1:4173');await page.locator('#setting').selectOption('The closed bookshop');await page.locator('#generate').click();
let prev='';for(let i=0;i<180;i++){await page.waitForTimeout(2000);const status=await page.locator('#status').textContent();const progress=await page.locator('#progress-text').textContent();if(status+' '+progress!==prev){prev=status+' '+progress;console.log(prev)}if(await page.locator('#generate').isEnabled())break;}
console.log('RESULT',await page.locator('#story-body').textContent());console.log('SOURCE',await page.locator('#story-source').textContent());await page.screenshot({path:'docs/inference-desktop.png',fullPage:true});await browser.close();
