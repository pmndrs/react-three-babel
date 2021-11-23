const THREE = require("three");
const jsxPlugin = require("babel-plugin-syntax-jsx");

module.exports = function ({ types: t }) {
  const threeImports = new Set();

  return {
    inherits: jsxPlugin,
    visitor: {
      JSXIdentifier(path) {
        const { name } = path.node;
        const pascalCaseName = name.charAt(0).toUpperCase() + name.slice(1);
        const isThreeElement = pascalCaseName in THREE;
        if (isThreeElement) {
          threeImports.add(pascalCaseName);
        }
      },
      Program: {
        exit: (path) => {
          const extendIdentifier = t.identifier("extend");
          const importIdentifiers = Array.from(threeImports).map((name) =>
            t.identifier(name)
          );
          const underscoreImportIdentifiers = Array.from(threeImports).map(
            (name) => t.identifier("_" + name)
          );

          // Add extend call
          const objectProperties = importIdentifiers.map((identifier, i) =>
            t.objectProperty(identifier, underscoreImportIdentifiers[i], false, true)
          );
          const objectExpression = t.objectExpression(objectProperties);
          const extendCall = t.callExpression(extendIdentifier, [
            objectExpression,
          ]);
          path.node.body.unshift(extendCall);

          // Add extend import
          const extendImportSpecifier = t.importSpecifier(
            extendIdentifier,
            extendIdentifier
          );
          const importDeclaration = t.importDeclaration(
            [extendImportSpecifier],
            t.stringLiteral("@react-three/fiber")
          );
          path.node.body.unshift(importDeclaration);

          // Add three imports
          const importSpecifiers = importIdentifiers.map((identifier, i) =>
            t.importSpecifier(underscoreImportIdentifiers[i], identifier)
          );
          const importDeclaration2 = t.importDeclaration(
            importSpecifiers,
            t.stringLiteral("three")
          );
          path.node.body.unshift(importDeclaration2);
        },
      },
    },
  };
};
