import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
const p = await c.newPage();
await p.goto("http://127.0.0.1:8352/en/contact", { waitUntil: "load" });
const info = await p.evaluate(() => {
  const form = document.querySelector("form[method=post]");
  const slot = form?.closest("[class*=formSlot]");
  return {
    formHidden: slot ? getComputedStyle(slot).display === "none" : "no slot",
    fallbackVisible: document.body.innerText.includes("The enquiry form needs JavaScript"),
    callLinks: [...document.querySelectorAll('a[href^="tel:"]')].length,
  };
});
console.log(JSON.stringify(info));
await p.goto("http://127.0.0.1:8352/en/gallery", { waitUntil: "load" });
console.log("gallery nojs:", JSON.stringify(await p.evaluate(() => ({ photos: document.querySelectorAll("#photographs li").length, links: document.querySelectorAll("#photographs li a[href]").length, chips: document.querySelectorAll("#photographs button").length }))));
await p.goto("http://127.0.0.1:8352/en/faq", { waitUntil: "load" });
console.log("faq nojs:", JSON.stringify(await p.evaluate(() => ({ questions: document.querySelectorAll("#questions details").length, search: document.querySelectorAll('#questions input[type="search"]').length }))));
await b.close();
