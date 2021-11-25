import type { NodePath } from "@babel/traverse";

declare module '@babel/helper-module-imports' {
    export function addNamed(path: NodePath, importName: string, source: string): string;
}
