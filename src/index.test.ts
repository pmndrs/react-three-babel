import * as babel from '@babel/core'
import { it, expect } from 'vitest'
import plugin from '../src/index'

function transform(code: string): string {
  return babel.transform(code.replace(/\s+/g, ' '), { plugins: [plugin] })!.code!
}

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
      import { animated } from "@react-spring/three";

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
