const puppeteer = require('puppeteer')

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    ;(async () => {
      const browser = await puppeteer.launch({
        headless: true, // debug only
        args: ['--no-sandbox'],
        userDataDir: './user_data'
      })

      const page = await browser.newPage()

      await page.goto(url, {
        waitUntil: ['load', 'networkidle0', 'domcontentloaded']
      })

      await page.waitFor(1000)

      await page.emulateMedia('screen')

      let sharedData = await page.evaluate(() => {
        return window._sharedData.entry_data.ProfilePage[0].graphql.user;
      });

      await browser.close()

      resolve(sharedData)
    })()
  })
}