import { addNamed } from "@babel/helper-module-imports";
import { declare } from "@babel/helper-plugin-utils";
import { PluginObj, PluginPass } from "@babel/core";
import PluginSyntaxJSX from "@babel/plugin-syntax-jsx";
import invariant from "tiny-invariant";

export default declare<
  { importSources?: string[] },
  PluginObj<PluginPass & { imports?: Set<`${string},${string}`> }>
>(({ types: t }, { importSources = ["three"] }) => {
  invariant(Array.isArray(importSources), "importSources must be an array");

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
      JSXIdentifier(path) {
        const { name } = path.node;
        const pascalCaseName = name.charAt(0).toUpperCase() + name.slice(1);
        for (let i = 0; i < NS.length; i++) {
          if (pascalCaseName in NS[i]) {
            this.imports?.add(`${importSources[i]},${pascalCaseName}`);
            break;
          }
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
});
