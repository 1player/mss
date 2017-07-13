require("chai").should();
const mss = require("../src/index");

describe("MSS", () => {
  it("can generate exports from plain CSS", () => {
    const input = `
      .red { color: red; }
      .blue { color: blue; }
    `;

    const outputExports = {
      red: "red",
      blue: "blue"
    };

    const p = new mss.Processor(input);
    const { exports, root } = p.process();
    exports.should.be.deep.equal(outputExports);
  });

  it("can generate exports from simple, local @composes declaration", () => {
    const input = `
      .red { color: red; }
      .p0 { padding: 0; }
      .button { @composes red; }
      .header { @composes red, p0; }
    `;

    const outputExports = {
      red: "red",
      p0: "p0",
      button: "red button",
      header: "red p0 header"
    };

    const p = new mss.Processor(input);
    const { exports, root } = p.process();
    exports.should.be.deep.equal(outputExports);
  });

  it("can generate exports from nested, local @composes declaration", () => {
    const input = `
      .red { color: red; }
      .p0 { padding: 0; }
      .big-red { 
        @composes red;
        font-size: larger;
      }
      .button { @composes big-red, p0; }
    `;

    const outputExports = {
      red: "red",
      p0: "p0",
      "big-red": "red big-red",
      button: "red big-red p0 button"
    };

    const p = new mss.Processor(input);
    const { exports, root } = p.process();
    exports.should.be.deep.equal(outputExports);
  });
});
