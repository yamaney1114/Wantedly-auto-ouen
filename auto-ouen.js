var tw_username = "XvolveWantedly";
var tw_password = "wantedly";

/**
 * 以下は変更不要です。
 */
// selenium の設定
const fs = require("fs");
const csv = require("csv-parser");
const webdriver = require("selenium-webdriver");
const { Builder, By, until, Key, Actions } = webdriver;
const chrome = require("selenium-webdriver/chrome");
const capabilities = webdriver.Capabilities.chrome();
capabilities.set("chromeOptions", {
  args: [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    `--window-size=1980,1200`,
  ],
});
const cliProgress = require("cli-progress");

// awaitを使うので、asyncで囲む
(async () => {
  try {
    var wantedly_accounts = [];
    await fs
      .createReadStream("csv/acounts.csv")
      .pipe(csv())
      .on("data", async function (row) {
        const user = {
          mail: row.mail,
          password: row.password,
        };
        wantedly_accounts.push(user);
      })
      .on("end", async function () {
        await console.table(wantedly_accounts);
      });
    var project_list = [];
    await fs
      .createReadStream("csv/pages.csv")
      .pipe(csv())
      .on("data", async function (row) {
        if (row.project_url) {
          project_list.push(row.project_url);
        }
      })
      .on("end", async function () {
        await console.table(project_list);
      });
    // ブラウザ立ち上げ
    const options = await new chrome.Options()
      .windowSize({ width: 1980, height: 1200 })
      .addArguments("--disable-gpu")
      .addArguments("--no-sandbox")
      .addArguments("--headless");

    const browser = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    // create a new progress bar instance and use shades_classic theme
    const bar = await new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    );
    await bar.start(wantedly_accounts.length * project_list.length, 0);
    // login to twitter
    // await browser.get("https://twitter.com/i/flow/login");
    // let username = await browser.wait(
    //   until.elementLocated(By.name("username")),
    //   100000
    // );
    // await username.sendKeys(tw_username);
    // await username.sendKeys(Key.ENTER);
    // let pass = await browser.wait(
    //   until.elementLocated(By.name("password")),
    //   100000
    // );
    // await pass.sendKeys(tw_password);
    // await pass.sendKeys(Key.ENTER);

    // Wantedlyへアクセスしログインする
    let count = 0;
    for (let i = 0; i < wantedly_accounts.length; i++) {
      const account = wantedly_accounts[i];
      try {
        await browser
          .get(
            "https://www.wantedly.com/signin_or_signup?step=SigninOrSignup&email=" +
              account.mail
          )
          .then(async function () {
            let password = await browser.wait(
              until.elementLocated(By.id("password"))
            );
            await password.sendKeys(account.password);
          });
        let loginButton = await browser.findElement(By.id("next-step-button"));
        await loginButton.click();
        // console.log(account.mail, "login done");

        await browser.get("https://www.wantedly.com/projects");
        // 各募集要項へアクセスし応援する
        for (let index = 0; index < project_list.length; index++) {
          const project = project_list[index];
          if (!project) {
            continue;
          }
          try {
            await browser.get(project);
            await browser
              .findElement(By.className("project-support-link"))
              .click();
            const twitterButton = await browser.findElement(
              By.className("djeBxj")
            );
            const newTabClick = browser.actions();
            newTabClick
              .keyDown(Key.COMMAND)
              .click(twitterButton)
              .keyUp(Key.COMMAND)
              .perform();
            await browser.sleep(8000);
            // console.log(account.mail, project, "done");
            const window = await browser.getAllWindowHandles();
            await browser.switchTo().window(window[1]);
            await browser.close();
            await browser.switchTo().window(window[0]);
            await browser.get(project);
            count++;
          } catch (e) {
            console.error(project);
            console.error(account);
            console.error(e);
          }
          bar.increment();
        }
        await browser.get("https://www.wantedly.com/user/sign_out");
      } catch (e) {
        console.error(project);
        console.error(account);
        console.error(e);
      }
    }
    bar.stop();
    await browser.quit();
  } catch (e) {
    console.error(e);
  }
})();
