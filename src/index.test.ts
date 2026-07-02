import * as babel from '@babel/core'
import { it, expect, describe } from 'vitest'
import semver from 'semver'
import plugin from '../src/index'

function transform(code: string): string {
  return babel.transform(code.replace(/\s+/g, ' '), { plugins: [plugin] })!.code!
}

/**
 * Creates a mock Babel API object for a given version string.
 * Used to verify the plugin's version assertion accepts both Babel 7 and Babel 8.
 */
function createMockApi(version: string) {
  return {
    assertVersion(range: string | number) {
      const rangeStr = typeof range === 'number' ? `^${range}.0.0-0` : range
      if (!semver.satisfies(version, rangeStr)) {
        throw new Error(
          `Requires Babel "${rangeStr}", but was loaded with "${version}".`,
        )
      }
    },
    // Minimal polyfills expected by declare()
    targets: () => ({}),
    assumption: () => undefined,
  }
}

describe('babel version compatibility', () => {
  it('loads with Babel 7', () => {
    const api = createMockApi('7.21.8')
    expect(() => (plugin as any)(api, {}, process.cwd())).not.toThrow()
  })

  it('loads with Babel 8', () => {
    const api = createMockApi('8.0.1')
    expect(() => (plugin as any)(api, {}, process.cwd())).not.toThrow()
  })

  it('rejects Babel 6', () => {
    const api = createMockApi('6.26.3')
    expect(() => (plugin as any)(api, {}, process.cwd())).toThrow(/Requires Babel/)
  })

  it('transforms correctly with current Babel version', () => {
    // Ensure the full transform pipeline works end-to-end
    const code = transform(`
      function Box() {
        return <mesh><boxGeometry /></mesh>;
      }
    `)
    expect(code).toContain('import { Mesh')
    expect(code).toContain('from "three"')
    expect(code).toContain('import { extend')
    expect(code).toContain('from "@react-three/fiber"')
  })
})

it('removes namespaced extend calls', () => {
  const code = transform(
    `
      import * as THREE from "three";
      import { extend } from "@react-three/fiber";

      extend(THREE);
    `,
  )
  expect(code).toMatchSnapshot()
})

it('handles JSX', () => {
  const code = transform(
    `
      function Box(props) {
        return (
          <mesh {...props}>
            <boxGeometry />
            <meshBasicMaterial />
          </mesh>
        );
      }
    `,
  )
  expect(code).toMatchSnapshot()
})

it('handles JSX member expressions', () => {
  const code = transform(
    `
      import { animated } from "@react-spring/three";

      function Box(props) {
        return (
          <animated.mesh {...props}>
            <boxGeometry />
            <meshBasicMaterial />
          </animated.mesh>
        );
      }
    `,
  )
  expect(code).toMatchSnapshot()
})

it('handles dynamic expressions', () => {
  const code = transform(
    `
      function Material(props) {
        const Comp = props.foo ? 'meshBasicMaterial' : 'meshStandardMaterial';
        return <Comp color="royalblue" />;
      }
    `,
  )
  expect(code).toMatchSnapshot()
})

it('handles template strings', () => {
  const code = transform(
    `
      function Material(props) {
        const Comp = \`mesh\$\{props.type\}Material\`;
        return <Comp color="royalblue" />;
      }
    `,
  )
  expect(code).toMatchSnapshot()
})
