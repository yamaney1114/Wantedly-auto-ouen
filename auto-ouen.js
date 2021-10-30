/**
 * Wantedlyの各募集要項枚に自動応援をします。
 * ＜使い方＞
 * 1.ユーザID,パスワードをセットし、プロジェクトIDをセットします。
 * 2.terminalで node auto-cheer.js と実行すると自動で応援します。
 * 途中に応援済みのページがある場合はエラーとなり停止します。
 * また、Facebookのアカウントには対応していません。
 */

/**
 * 設定が必要な変数
 * ＜project_listについて＞
 * 応援したい募集要項が以下のように３つある場合は、
 * https://www.wantedly.com/projects/65498
 * https://www.wantedly.com/projects/64675
 * https://www.wantedly.com/projects/64678
 * project_list = [65498,64675,64678];と入れてください。
 */
var tw_username = "XvolveWantedly";
var tw_password = "wantedly";
var wantedly_accounts = [
  {
    mail: "zhai_teng_ya_li_sha_ppfiyoz_zhai_teng_ya_li_sha@tfbnw.net",
    password: "xvolve123",
  },
  {
    mail: "kei.kishimoto0000@gmail.com",
    password: "Xvolve123",
  },
  // {
  //   mail: "apple_ncfruwr_female@tfbnw.net",
  //   password: "xvolve123",
  // },
  // {
  //   mail: "pei.40@docomo.ne.jp",
  //   password: "xvolve123",
  // },
  // {
  //   mail: "wafapya@na-cat.com",
  //   password: "Xvolve123",
  // },
  // {
  //   mail: "yoshidaakari_clugdcx_yoshidaakari@tfbnw.net",
  //   password: "xvolve123",
  // },
];
var project_list = [766193, 766195, 766196, 766200, 766200, 766194];

/**
 * 以下は変更不要です。
 */
// selenium の設定
const fs = require("fs");
const webdriver = require("selenium-webdriver");
const { Builder, By, until, Key, Actions } = webdriver;
const capabilities = webdriver.Capabilities.chrome();
capabilities.set("chromeOptions", {
  args: [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    `--window-size=1980,1200`,
  ],
});

// awaitを使うので、asyncで囲む
(async () => {
  try {
    // ブラウザ立ち上げ
    const browser = await new Builder().withCapabilities(capabilities).build();

    // login to twitter
    await browser.get("https://twitter.com/i/flow/login");
    let username = await browser.wait(
      until.elementLocated(By.name("username")),
      100000
    );
    await username.sendKeys(tw_username);
    await username.sendKeys(Key.ENTER);
    let pass = await browser.wait(
      until.elementLocated(By.name("password")),
      100000
    );
    await pass.sendKeys(tw_password);
    await pass.sendKeys(Key.ENTER);

    // Wantedlyへアクセスしログインする
    let count = 0;
    for (let index = 0; index < wantedly_accounts.length; index++) {
      const account = wantedly_accounts[index];
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

        await browser.get("https://www.wantedly.com/projects");
        // 各募集要項へアクセスし応援する
        for (let index = 0; index < project_list.length; index++) {
          const project = project_list[index];
          try {
            await browser.get("https://www.wantedly.com/projects/" + project);
            await browser
              .findElement(By.className("project-support-link"))
              .click();
            await browser
              .findElement(
                By.xpath(
                  "/html/body/div[4]/div[1]/div[3]/div/div[2]/div/div/div/div[2]/div/div/div[2]/div[3]/button[2]"
                )
              )
              .click();
            await browser.sleep(8000);
            await browser.get("https://www.wantedly.com/projects/" + project);
            count++;
          } catch (e) {
            console.error(account, e);
          }
        }
        await browser.get("https://www.wantedly.com/user/sign_out");
      } catch (e) {
        console.error(account, e);
      }
    }
  } catch (e) {
    console.error(e);
  }
})();
