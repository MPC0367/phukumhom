// Absolute URL generation for a root deployment and for a project-subdirectory deployment.
// Run: node --test tests/      (Node 24 reads the TypeScript source directly; the module has no imports.)
import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanBasePath, createSiteUrls, splitOrigin } from "../src/lib/site-url.ts";

test("GitHub Pages project site: origin, base path and trailing slash", () => {
  const urls = createSiteUrls({ origin: "https://mpc0367.github.io", basePath: "/phukumhom", trailingSlash: true });
  assert.equal(urls.root, "https://mpc0367.github.io/phukumhom");
  assert.equal(urls.page("/en"), "https://mpc0367.github.io/phukumhom/en/");
  assert.equal(urls.page("/th"), "https://mpc0367.github.io/phukumhom/th/");
  assert.equal(urls.page("/en/stay"), "https://mpc0367.github.io/phukumhom/en/stay/");
  assert.equal(urls.page("/en/stay/executive-pool-spa/"), "https://mpc0367.github.io/phukumhom/en/stay/executive-pool-spa/");
  assert.equal(urls.page("/"), "https://mpc0367.github.io/phukumhom/");
  assert.equal(urls.asset("/og/clay-buildings-rooftop-pergolas-hazy-lane.jpg"), "https://mpc0367.github.io/phukumhom/og/clay-buildings-rooftop-pergolas-hazy-lane.jpg");
  assert.equal(urls.asset("/sitemap.xml"), "https://mpc0367.github.io/phukumhom/sitemap.xml");
});

test("a path that already carries the base path is not given it twice", () => {
  const urls = createSiteUrls({ origin: "https://mpc0367.github.io", basePath: "/phukumhom", trailingSlash: true });
  assert.equal(urls.asset("/phukumhom/media/pond-1000.jpg"), "https://mpc0367.github.io/phukumhom/media/pond-1000.jpg");
  assert.equal(urls.page("/phukumhom/en/stay"), "https://mpc0367.github.io/phukumhom/en/stay/");
  // A name that merely starts with the same letters is not the base path.
  assert.equal(urls.asset("/phukumhom-old/x.jpg"), "https://mpc0367.github.io/phukumhom/phukumhom-old/x.jpg");
});

test("root deployment on a domain: no base path, no trailing slash", () => {
  const urls = createSiteUrls({ origin: "https://www.example.com", basePath: "", trailingSlash: false });
  assert.equal(urls.root, "https://www.example.com");
  assert.equal(urls.page("/en"), "https://www.example.com/en");
  assert.equal(urls.page("/en/stay/"), "https://www.example.com/en/stay");
  assert.equal(urls.page("/"), "https://www.example.com/");
  assert.equal(urls.asset("/og/card.jpg"), "https://www.example.com/og/card.jpg");
});

test("queries and fragments never reach a canonical address", () => {
  const urls = createSiteUrls({ origin: "https://mpc0367.github.io", basePath: "/phukumhom", trailingSlash: true });
  assert.equal(urls.page("/en/gallery?filter=rooftops"), "https://mpc0367.github.io/phukumhom/en/gallery/");
  assert.equal(urls.page("/en/stay#compare"), "https://mpc0367.github.io/phukumhom/en/stay/");
  assert.equal(urls.page("/en/contact?type=stay&room=deluxe-balcony#enquiry"), "https://mpc0367.github.io/phukumhom/en/contact/");
});

test("slashes are handled consistently", () => {
  for (const basePath of ["phukumhom", "/phukumhom", "/phukumhom/", "//phukumhom//"]) {
    const urls = createSiteUrls({ origin: "https://mpc0367.github.io/", basePath, trailingSlash: true });
    assert.equal(urls.basePath, "/phukumhom");
    assert.equal(urls.page("en//stay"), "https://mpc0367.github.io/phukumhom/en/stay/");
  }
  assert.equal(cleanBasePath("/"), "");
  assert.equal(cleanBasePath(undefined), "");
  assert.equal(cleanBasePath("/a/../b/./c/"), "/a/b/c");
});

test("the old mistake: an origin given with the base path attached still yields the base path", () => {
  // The first export passed "https://mpc0367.github.io/phukumhom" as the origin; URL.origin dropped the path.
  const urls = createSiteUrls({ origin: "https://mpc0367.github.io/phukumhom", basePath: "", trailingSlash: true });
  assert.equal(urls.origin, "https://mpc0367.github.io");
  assert.equal(urls.basePath, "/phukumhom");
  assert.equal(urls.page("/en"), "https://mpc0367.github.io/phukumhom/en/");
  // An explicit base path wins over one carried on the origin.
  const explicit = createSiteUrls({ origin: "https://host.example/old", basePath: "/new", trailingSlash: false });
  assert.equal(explicit.page("/en"), "https://host.example/new/en");
});

test("an unusable origin is refused, not guessed", () => {
  assert.equal(createSiteUrls({ origin: "" }), null);
  assert.equal(createSiteUrls({ origin: "not a url" }), null);
  assert.equal(createSiteUrls({ origin: "ftp://host.example" }), null);
  assert.equal(splitOrigin("javascript:alert(1)"), null);
});
