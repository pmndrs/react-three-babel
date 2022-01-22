declare module '@babel/helper-module-imports' {
    import type { NodePath } from "@babel/traverse";
    import type { Identifier } from "@babel/types";

    export function addNamed(path: NodePath, importName: string, source: string): Identifier;
}
