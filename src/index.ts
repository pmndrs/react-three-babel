import type { PluginObj, PluginPass } from "@babel/core";
import { addNamed } from "@babel/helper-module-imports";
import { declare } from "@babel/helper-plugin-utils";
import PluginSyntaxJSX from "@babel/plugin-syntax-jsx";
import assert from "assert";

export default declare<
  { importSources?: string[] },
  PluginObj<PluginPass & { imports?: Set<`${string},${string}`> }>
>(({ types: t }, { importSources = ["three"] }) => {
  assert(Array.isArray(importSources), "importSources must be an array");

  const NS = importSources.map((id) => require(id));

  return {
    inherits: PluginSyntaxJSX,
    pre() {
      this.imports = new Set<`${string},${string}`>();
    },
    post() {
      this.imports?.clear();
    },
    visitor: {
      JSXOpeningElement(path) {
        const { name } = path.node;

        if (t.isJSXIdentifier(name)) {
          const elementName = name.name;
          const pascalCaseName =
            elementName.charAt(0).toUpperCase() + elementName.slice(1);
          for (let i = 0; i < NS.length; i++) {
            if (pascalCaseName in NS[i]) {
              this.imports?.add(`${importSources[i]},${pascalCaseName}`);
              break;
            }
          }
        } else if (t.isJSXMemberExpression(name)) {
          const propertyName = name.property.name;
          const pascalCaseName =
            propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
          for (let i = 0; i < NS.length; i++) {
            if (pascalCaseName in NS[i]) {
              this.imports?.add(`${importSources[i]},${pascalCaseName}`);
              break;
            }
          }
        } else {
          throw new Error("Unsupported JSX element name");
        }
      },
      Program: {
        exit(path) {
          // Add extend import
          const extendName = addNamed(path, "extend", "@react-three/fiber");

          // Add imports
          const importsArray: [string, string][] = Array.from(
            this.imports!
          ).map((s) => {
            const [a, b] = s.split(",");
            return [a, b];
          });
          const importNames = importsArray.map(([module, name], i) =>
            addNamed(path, name, module)
          );

          // Add extend call
          const objectProperties = importsArray.map(([_, name], i) =>
            t.objectProperty(t.identifier(name), importNames[i], false, true)
          );
          const objectExpression = t.objectExpression(objectProperties);
          const extendCall = t.expressionStatement(t.callExpression(extendName, [objectExpression]));
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
});
