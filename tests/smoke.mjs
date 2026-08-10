import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the static entrypoint references local assets", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  assert.match(html, /<title>Laundry Window/);
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="app\.js"/);
  assert.match(html, /Samsung WF702Y4BKWQ\/EN/);
  assert.doesNotMatch(html, /https?:\/\/[^"']+\.(?:css|js)/i);
});

test("the official programme durations remain present", async () => {
  const script = await readFile(new URL("app.js", root), "utf8");
  const expected = {
    cotton: 133,
    synthetics: 105,
    jeans: 77,
    bedding: 100,
    dark: 78,
    daily: 66,
    drum: 104,
    baby: 142,
    sports: 72,
    hand: 30,
    wool: 38,
  };
  for (const [id, minutes] of Object.entries(expected)) {
    assert.match(script, new RegExp(`id: "${id}"[^\\n]+minutes: ${minutes}`));
  }
  assert.match(script, /index \+ 3/);
  assert.match(script, /length: 17/);
});

test("the nginx example includes safe static defaults", async () => {
  const config = await readFile(new URL("nginx/laundry-window.conf.example", root), "utf8");
  assert.match(config, /try_files \$uri \$uri\/ \/index\.html/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /Content-Security-Policy/);
});
