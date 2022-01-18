const { addNamed } = require('@babel/helper-module-imports')

module.exports = function ({ types: t }) {
  const threeImports = new Set();

  return {
    inherits: require("babel-plugin-syntax-jsx"),
    pre(state) {
      this.THREE = require(state.opts.importSource ?? "three");
    },
    post() {
      this.THREE = null;
    },
    visitor: {
      JSXIdentifier(path, state) {
        const { name } = path.node;
        const pascalCaseName = name.charAt(0).toUpperCase() + name.slice(1);
        const isThreeElement = pascalCaseName in this.THREE;
        if (isThreeElement) {
          threeImports.add(pascalCaseName);
        }
      },
      Program: {
        exit: (path, state) => {
          // Add extend import
          const extendName = addNamed(path, "extend", "@react-three/fiber");

          // Add three imports
          const threeImportsArray = Array.from(threeImports);
          const threeNames = threeImportsArray.map((name, i) => 
            addNamed(path, name, state.opts.importSource ?? "three")
          );

          // Add extend call
          const objectProperties = threeImportsArray.map((name, i) =>
            t.objectProperty(
              t.Identifier(name),
              threeNames[i],
              false,
              true
            )
          );
          const objectExpression = t.objectExpression(objectProperties);
          const extendCall = t.callExpression(extendName, [
            objectExpression,
          ]);
          const lastImport = path.get("body").filter(p => p.isImportDeclaration()).pop();
          if (lastImport) lastImport.insertAfter(extendCall);
        },
      },
    },
  };
};
