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
    this.exportsMap = new Map();
    this.outputRoot = postcss.root();
  }

  process() {
    this.root.each(node => {
      this.processNode(node);
    });
  }

  exports() {
    let stringExports = {};

    this.exportsMap.forEach((classes, name) => {
      stringExports[name] = classes.join(" ");
    });

    return stringExports;
  }

  outputCssRoot() {
    return this.outputRoot;
  }

  lookupClassesFromExport(exportName) {
    if (!this.exportsMap.has(exportName)) {
      throw new Error(`Undefined class ${exportName}`);
    }

    return this.exportsMap.get(exportName);
  }

  addExport(exportName, className, composedClasses = []) {
    let classes = this.exportsMap.get(exportName) || [];

    // Resolve the composed classes
    composedClasses.forEach(composedClass => {
      classes.push.apply(classes, this.lookupClassesFromExport(composedClass));
    });

    // Add ourselves
    classes.push(className);

    this.exportsMap.set(exportName, classes);
  }

  processRule(rule) {
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

  processNode(node) {
    if (node.type === "rule") {
      node = this.processRule(node);
    }

    this.outputRoot.append(node);
  }
};
