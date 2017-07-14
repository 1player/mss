const mss = require("../src/index");

// Given a root object and a map of selector => declarations,
// ensure that the root object contains all the selectors and declarations
// expected, and no others.
function testRoot(gotRoot, expectedRoot) {
  // For each rule...
  gotRoot.walkRules(rule => {
    // Make sure we're expecting it
    expect(expectedRoot.hasOwnProperty(rule.selector)).toBeTruthy();

    // Make sure the declarations match
    let gotContents = [];
    let expectedContents = expectedRoot[rule.selector];

    rule.walk(node => {
      gotContents.push(node.toString());
    });

    expect(gotContents).toEqual(expectedContents);
  });
}

test("can generate CSS from plain CSS", () => {
  const input = `
      .red { color: red; }
      .blue { color: blue; }
    `;

  const expectedRoot = {
    ".red": ["color: red"],
    ".blue": ["color: blue"]
  };

  const p = new mss.Processor(input);
  p.process();
  testRoot(p.outputCssRoot(), expectedRoot);
});

test("can generate CSS from simple, local @composes declaration", () => {
  const input = `
      .red { color: red; }
      .p0 { padding: 0; }
      .button { @composes red; }
      .header { @composes red, p0; }
    `;

  const expectedRoot = {
    ".red": ["color: red"],
    ".p0": ["padding: 0"],
    ".button": [],
    ".header": []
  };

  const p = new mss.Processor(input);
  p.process();
  testRoot(p.outputCssRoot(), expectedRoot);
});

test("can generate CSS from nested, local @composes declaration", () => {
  const input = `
      .red { color: red; }
      .p0 { padding: 0; }
      .big-red { 
        @composes red;
        font-size: larger;
      }
      .button { @composes big-red, p0; }
    `;

  const expectedRoot = {
    ".red": ["color: red"],
    ".p0": ["padding: 0"],
    ".big-red": ["font-size: larger"],
    ".button": []
  };

  const p = new mss.Processor(input);
  p.process();
  testRoot(p.outputCssRoot(), expectedRoot);
});
