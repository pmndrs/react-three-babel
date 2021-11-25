"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_module_imports_1 = require("@babel/helper-module-imports");
function default_1({ types: t }) {
    const threeImports = new Set();
    return {
        inherits: require("babel-plugin-syntax-jsx"),
        pre(state) {
            var _a;
            this.THREE = require((_a = state.opts.importSource) !== null && _a !== void 0 ? _a : "three");
        },
        post() {
            this.THREE = null;
        },
        visitor: {
            JSXIdentifier(path) {
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
                    const extendName = (0, helper_module_imports_1.addNamed)(path, "extend", "@react-three/fiber");
                    // Add three imports
                    const threeImportsArray = Array.from(threeImports);
                    const threeNames = threeImportsArray.map((name, i) => { var _a; return (0, helper_module_imports_1.addNamed)(path, name, (_a = state.opts.importSource) !== null && _a !== void 0 ? _a : "three"); });
                    // Add extend call
                    const objectProperties = threeImportsArray.map((name, i) => t.objectProperty(t.identifier(name), threeNames[i], false, true));
                    const objectExpression = t.objectExpression(objectProperties);
                    const extendCall = t.callExpression(extendName, [objectExpression]);
                    const lastImport = path
                        .get("body")
                        .filter((p) => p.isImportDeclaration())
                        .pop();
                    if (lastImport)
                        lastImport.insertAfter(extendCall);
                },
            },
        },
    };
}
exports.default = default_1;
