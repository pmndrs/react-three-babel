import { addNamed } from "@babel/helper-module-imports";
import * as BabelCore from "@babel/core";
import PluginSyntaxJSX from "@babel/plugin-syntax-jsx";
import type { PluginObj } from "@babel/core";

type PluginOptions = BabelCore.TransformOptions & {
  importSource?: string;
};

export default function ({ types: t }: typeof BabelCore): PluginObj {
  const threeImports = new Set<string>();

  return {
    inherits: PluginSyntaxJSX,
    pre(state) {
      this.THREE = require((state?.opts as PluginOptions)?.importSource ??
        "three");
    },
    post() {
      this.THREE = null;
    },
    visitor: {
      JSXIdentifier(path) {
        const { name } = path.node;
        const pascalCaseName = name.charAt(0).toUpperCase() + name.slice(1);
        const isThreeElement = pascalCaseName in (this.THREE as any);
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
            addNamed(
              path,
              name,
              (state?.opts as PluginOptions)?.importSource ?? "three"
            )
          );

          // Add extend call
          const objectProperties = threeImportsArray.map((name, i) =>
            t.objectProperty(t.identifier(name), threeNames[i], false, true)
          );
          const objectExpression = t.objectExpression(objectProperties);
          const extendCall = t.callExpression(extendName, [objectExpression]);
          const body = path.get("body");
          if (Array.isArray(body)) {
            const lastImport = body
              .filter((p) => p.isImportDeclaration())
              .pop();
            if (lastImport) lastImport.insertAfter(extendCall);
          }
        },
      },
    },
  };
}