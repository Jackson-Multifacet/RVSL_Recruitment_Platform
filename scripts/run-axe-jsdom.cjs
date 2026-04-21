const fs = require('fs');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const axe = require('axe-core');

(async () => {
  try {
    const res = await fetch('http://localhost:3000');
    const html = await res.text();
    const dom = new JSDOM(html, { url: 'http://localhost:3000' });
    const { window } = dom;

    // Provide minimal globals expected by axe
    global.window = window;
    global.Node = window.Node;
    global.DocumentFragment = window.DocumentFragment;
    global.Document = window.Document;
    global.HTMLElement = window.HTMLElement;
    global.navigator = window.navigator;

    // Inject axe into the JSDOM window and run there (safer when running in Node)
    let axeSource = axe.source;
    if (!axeSource) {
      const path = require.resolve('axe-core/axe.min.js');
      axeSource = fs.readFileSync(path, 'utf8');
    }
    window.eval(axeSource);
    const results = await window.axe.run(window.document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }
    });

    fs.writeFileSync('axe-report.json', JSON.stringify(results, null, 2));
    console.log('Wrote axe-report.json');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
