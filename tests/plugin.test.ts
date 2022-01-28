import * as babel from "@babel/core";
import plugin from "../src/index";

const example = `
import { createRoot } from '@react-three/fiber'

createRoot(canvasNode).render(
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
)
`;

it("works", () => {
  const { code } = babel.transform(example, {
    plugins: [plugin],
    sourceType: "module",
  })!;
  expect(code).toMatchSnapshot();
});

const exampleWithDrei = `
import { createRoot } from '@react-three/fiber'
import { Html } from 'drei'

createRoot(canvasNode).render(
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
    <Html>
      <div>Hello World</div>
    </Html>
  </mesh>
)
`;

it("works with drei", () => {
  const { code } = babel.transform(exampleWithDrei, {
    plugins: [plugin],
    sourceType: "module",
  })!;
  expect(code).toMatchSnapshot();
});

const exampleWithImportShadowing = `
import { createRoot } from '@react-three/fiber'
import { BoxGeometry } from 'three'

createRoot(canvasNode).render(
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
)
`;

it("works with import shadowing", () => {
  const { code } = babel.transform(exampleWithImportShadowing, {
    plugins: [plugin],
    sourceType: "module",
  })!;
  expect(code).toMatchSnapshot();
});

const exampleWithThreeStdLib = `
import { createRoot } from '@react-three/fiber'

createRoot(canvasNode).render(
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
)
`;

it("allows customization of the import source", () => {
  const { code } = babel.transform(exampleWithThreeStdLib, {
    plugins: [
      [
        plugin,
        {
          importSource: "three-stdlib",
        },
      ],
    ],
    sourceType: "module",
  })!;
  expect(code).toMatchSnapshot();
});

const exampleWithExtend = `
import { createRoot, extend } from '@react-three/fiber'

createRoot(canvasNode).render(
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
)
`;

it("does not break if extend is already imported", () => {
  const { code } = babel.transform(exampleWithExtend, {
    plugins: [plugin],
    sourceType: "module",
  })!;
  expect(code).toMatchSnapshot();
});

const exampleWithReactSpring = `
import { useState } from "react";
import { createRoot } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";

function Box(props) {
  const [active, setActive] = useState(false);
  const { scale } = useSpring({ scale: active ? 1.5 : 1 });
  return (
    <animated.mesh
      scale={scale}
      onClick={() => setActive(!active)}
      {...props}
    >
      <boxGeometry />
      <meshPhongMaterial color="royalblue" />
    </animated.mesh>
  );
}

createRoot(canvasNode).render(<Box />);
`

it('works with animated from @react-spring/three', () => {
  const { code } = babel.transform(exampleWithReactSpring, {
    plugins: [plugin],
    sourceType: "module",
  })!;
  expect(code).toMatchSnapshot();
})