const postcss = require("postcss");

function getClassSelectorFromRule(rule) {
  if (rule.selectors.length != 1) {
    console.warn("Multiple selectors are not supported");
    return null;
  }

  if (rule.selector[0] != ".") {
    return null;
  }

  return rule.selector.slice(1);
}

exports.Processor = class Processor {
  constructor(input) {
    this.root = postcss.parse(input);
    this.exports = new Map();
  }

  process() {
    let newRoot = postcss.root();

    this.root.each(node => {
      this.processNode(newRoot, node);
    });

    return {
      exports: this.stringExports(),
      root: newRoot
    };
  }

  stringExports() {
    let stringExports = {};

    this.exports.forEach((classes, name) => {
      stringExports[name] = classes.join(" ");
    });

    return stringExports;
  }

  lookupClassesFromExport(exportName) {
    if (!this.exports.has(exportName)) {
      throw new Error(`Undefined class ${exportName}`);
    }

    return this.exports.get(exportName);
  }

  addExport(exportName, className, composedClasses = []) {
    let classes = this.exports.get(exportName) || [];

    // Resolve the composed classes
    composedClasses.forEach(composedClass => {
      classes.push.apply(classes, this.lookupClassesFromExport(composedClass));
    });

    // Add ourselves
    classes.push(className);

    this.exports.set(exportName, classes);
  }

  processRule(newRoot, rule) {
    const classSelector = getClassSelectorFromRule(rule);
    if (classSelector) {
      let ruleComposedOf = [];

      rule.walkAtRules("composes", node => {
        ruleComposedOf = postcss.list.comma(node.params);
      });

      this.addExport(classSelector, classSelector, ruleComposedOf);
    }

    return rule;
  }

  processNode(newRoot, node) {
    if (node.type === "rule") {
      node = this.processRule(newRoot, node);
    }

    newRoot.append(node);
  }
};
