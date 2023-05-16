import * as babel from '@babel/core'
import { it, expect } from 'vitest'
import plugin from '../src/index'

it('works', () => {
  {
    const result = babel.transform(
      `
        import { animated } from "@react-spring/three";
        import { createRoot } from "@react-three/fiber";

        function Box(props) {
          const Comp = props.foo ? 'meshBasicMaterial' : 'meshStandardMaterial';
          return (
            <animated.instancedMesh {...props}>
              <boxGeometry />
              <Comp color="royalblue" />
            </animated.instancedMesh>
          );
        }

        createRoot(canvasNode).render(<Box />);
      `.replace(/\s+/g, ' '),
      { plugins: [plugin] },
    )
    expect(result?.code).toMatchSnapshot()
  }

  {
    const result = babel.transform(
      `
        function Box(props) {
          const Comp = \`mesh\$\{props.type\}Material\`;
          return (
            <mesh {...props}>
              <boxGeometry />
              <Comp color="royalblue" />
            </mesh>
          );
        }
      `.replace(/\s+/g, ' '),
      { plugins: [plugin] },
    )
    expect(result?.code).toMatchSnapshot()
  }
})
