import { type NodePath, type PluginObj, types as t } from '@babel/core'
import * as THREE from 'three'

const imports = new Map<string, t.ImportSpecifier>()
let lastImport: NodePath | null = null

/**
 * Tree-shakes [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) by evaluating JSX and granularly populating the three.js catalogue.
 * @see https://docs.pmnd.rs/react-three-fiber/api/canvas#tree-shaking
 *
 * ```jsx
 * import { animated } from '@react-spring/three'
 * import { createRoot } from '@react-three/fiber'
 *
 * function Box(props) {
 *   const Comp = props.foo ? 'meshBasicMaterial' : 'meshStandardMaterial'
 *   return (
 *     <animated.instancedMesh {...props}>
 *       <boxGeometry />
 *       <Comp color="royalblue" />
 *     </animated.instancedMesh>
 *   )
 * }
 *
 * createRoot(canvasNode).render(<Box />)
 * ```
 *
 * Transforms into:
 *
 * ```jsx
 * import {
 *   InstancedMesh as _InstancedMesh,
 *   BoxGeometry as _BoxGeometry,
 *   MeshBasicMaterial as _MeshBasicMaterial,
 *   MeshStandardMaterial as _MeshStandardMaterial
 * } from 'three'
 * import { extend as _extend } from '@react-three/fiber'
 *
 * //__PURE__//
 * _extend({
 *   InstancedMesh: _InstancedMesh,
 *   BoxGeometry: _BoxGeometry,
 *   MeshBasicMaterial: _MeshBasicMaterial,
 *   MeshStandardMaterial: _MeshStandardMaterial
 * })
 * ```
 */
export default function reactThreeBabelPlugin(): PluginObj {
  return {
    manipulateOptions(_, options) {
      options.plugins.push('jsx')
    },
    post() {
      imports.clear()
      lastImport = null
    },
    visitor: {
      CallExpression(path) {
        // Remove extend(THREE) from Canvas and user-land
        if (
          t.isIdentifier(path.node.callee) &&
          path.node.callee.name === 'extend' &&
          t.isIdentifier(path.node.arguments[0]) &&
          path.node.arguments[0].name === 'THREE'
        ) {
          path.remove()
        }
      },
      ImportDeclaration(importPath) {
        lastImport = importPath
      },
      JSXOpeningElement(path) {
        // Don't include non-React JSX
        // https://github.com/facebook/jsx/issues/13
        const { name } = path.node
        if (t.isJSXNamespacedName(name)) return

        // Parse identifiers (e.g. <mesh />, <animated.mesh />)
        let type = 'property' in name ? name.property.name : name.name
        const declaration = path.scope.getBinding(type)?.path.node
        if (t.isVariableDeclarator(declaration)) {
          if (t.isStringLiteral(declaration.init)) {
            // const Comp = 'value'
            // <Comp />
            type = declaration.init.value
          } else if (t.isTemplateLiteral(declaration.init)) {
            // const Comp = `value${var}`
            // <Comp />
            type = declaration.init.quasis.map((n) => n.value.cooked).join('\\w*')
          } else if (t.isBinaryExpression(declaration.init) || t.isAssignmentExpression(declaration.init)) {
            // const Comp = 'left' + 'right' || (left += 'right')
            // <Comp />
            type = [declaration.init.left, declaration.init.right]
              .map((o) => (t.isStringLiteral(o) ? o.value : '\\w*'))
              .join('')
          } else if (t.isConditionalExpression(declaration.init)) {
            // const Comp = test ? 'consequent' : 'alternate'
            // <Comp />
            type = [declaration.init.consequent, declaration.init.alternate]
              .map((o) => (t.isStringLiteral(o) ? o.value : '\\w*'))
              .join('|')
          } else {
            // const Comp = var
            // <Comp />
            type = '\\w+'
          }
        }

        // Test type pattern
        const pattern = new RegExp(`^${type}$`)
        for (const className in THREE) {
          const type = className.replace(/^[A-Z]/, (c) => c.toLowerCase())
          if (!imports.has(className) && pattern.test(type)) {
            const local = path.scope.generateUidIdentifier(className)
            imports.set(className, t.importSpecifier(local, t.identifier(className)))
          }
        }
      },
      Program: {
        exit(path) {
          // Only mutate JSX
          if (!imports.size) return

          // Flatten three.js imports
          const THREEImports = t.importDeclaration([...imports.values()], t.stringLiteral('three'))

          // Import extend and call it
          const extendImport = t.importSpecifier(path.scope.generateUidIdentifier('extend'), t.identifier('extend'))
          const extendCall = t.expressionStatement(
            t.callExpression(extendImport.local, [
              t.objectExpression(
                (THREEImports.specifiers as t.ImportSpecifier[]).map((importSpecifier) =>
                  t.objectProperty(importSpecifier.imported, importSpecifier.local, false, true),
                ),
              ),
            ]),
          )

          // Flatten R3F imports
          const R3FExports = t.importDeclaration([extendImport], t.stringLiteral('@react-three/fiber'))

          // Add statements in reverse order; imports must be top-level
          for (const node of [extendCall, R3FExports, THREEImports]) {
            if (lastImport) lastImport.insertAfter(node)
            else path.unshiftContainer('body', node)
          }
        },
      },
    },
  }
}
