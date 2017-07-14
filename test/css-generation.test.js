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
    let gotDeclarations = [];
    let expectedDeclarations = expectedRoot[rule.selector];

    rule.walkDecls(decl => {
      gotDeclarations.push(decl.toString());
    });

    expect(gotDeclarations).toEqual(
      expect.arrayContaining(expectedDeclarations)
    );
    expect(gotDeclarations).toHaveLength(expectedDeclarations.length);
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
  const { exports, root } = p.process();
  console.log(root.toString());
  testRoot(root, expectedRoot);
});
