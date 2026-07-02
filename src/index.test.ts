import * as babel7 from '@babel/core'
import * as babel8 from 'babel-core-8'
import { it, expect, describe } from 'vitest'
import plugin from '../src/index'

function transformWith(babelCore: typeof babel7, code: string): string {
  return babelCore.transformSync(code.replace(/\s+/g, ' '), { plugins: [plugin] })!.code!
}

describe.each([
  { name: 'Babel 7', babel: babel7 },
  { name: 'Babel 8', babel: babel8 as unknown as typeof babel7 },
])('$name', ({ babel }) => {
  it('removes namespaced extend calls', () => {
    const code = transformWith(
      babel,
      `
        import * as THREE from "three";
        import { extend } from "@react-three/fiber";

        extend(THREE);
      `,
    )
    expect(code).toMatchSnapshot()
  })

  it('handles JSX', () => {
    const code = transformWith(
      babel,
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
    const code = transformWith(
      babel,
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
    const code = transformWith(
      babel,
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
    const code = transformWith(
      babel,
      `
        function Material(props) {
          const Comp = \`mesh\$\{props.type\}Material\`;
          return <Comp color="royalblue" />;
        }
      `,
    )
    expect(code).toMatchSnapshot()
  })
})
