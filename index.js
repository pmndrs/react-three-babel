module.exports = function ({ types: t }) {
  const threeImports = new Set();
  let extendImport = null;

  return {
    inherits: require("babel-plugin-syntax-jsx"),
    pre(state) {
      this.THREE = require(state.opts.importSource ?? "three");
    },
    post() {
      this.THREE = null;
    },
    visitor: {
      ImportDeclaration(path) {
        if (
          path.node.source.value === "@react-three/fiber" &&
          path.node.specifiers.find(
            (specifier) => specifier.imported.name === "extend"
          ) &&
          extendImport === null
        ) {
          extendImport = path;
        }
      },
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
          const extendIdentifier = t.identifier("extend");
          const importIdentifiers = Array.from(threeImports).map((name) =>
            t.identifier(name)
          );
          const underscoreImportIdentifiers = Array.from(threeImports).map(
            (name) => t.identifier("_" + name)
          );

          // Add extend call
          const objectProperties = importIdentifiers.map((identifier, i) =>
            t.objectProperty(
              identifier,
              underscoreImportIdentifiers[i],
              false,
              true
            )
          );
          const objectExpression = t.objectExpression(objectProperties);
          const extendCall = t.callExpression(extendIdentifier, [
            objectExpression,
          ]);
          if (extendImport) {
            extendImport.insertAfter(extendCall);
          } else {
            path.node.body.unshift(extendCall);
          }

          // Add extend import
          if (extendImport === null) {
            const extendImportSpecifier = t.importSpecifier(
              extendIdentifier,
              extendIdentifier
            );
            const importDeclaration = t.importDeclaration(
              [extendImportSpecifier],
              t.stringLiteral("@react-three/fiber")
            );
            path.node.body.unshift(importDeclaration);
          }

          // Add three imports
          const importSpecifiers = importIdentifiers.map((identifier, i) =>
            t.importSpecifier(underscoreImportIdentifiers[i], identifier)
          );
          const importDeclaration2 = t.importDeclaration(
            importSpecifiers,
            t.stringLiteral(state.opts.importSource ?? "three")
          );
          path.node.body.unshift(importDeclaration2);
        },
      },
    },
  };
};
