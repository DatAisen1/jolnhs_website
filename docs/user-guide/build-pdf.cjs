// Renders user-guide.html to JOLNHS-Website-User-Guide.pdf.
// Run from the repo root: node docs/user-guide/build-pdf.cjs
const path = require("path");
const { chromium } = require("@playwright/test");

(async () => {
  const dir = __dirname;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file:///" + path.join(dir, "user-guide.html").replace(/\\/g, "/"), { waitUntil: "load" });
  await page.pdf({
    path: path.join(dir, "JOLNHS-Website-User-Guide.pdf"),
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate:
      '<div style="width:100%;font-size:8pt;color:#6a7894;padding:0 16mm;display:flex;justify-content:space-between;font-family:Segoe UI,Arial,sans-serif">' +
      "<span>JOLNHS Website — User Guide</span>" +
      '<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
  });
  await browser.close();
  console.log("PDF written");
})();
