import React, { useRef, useState } from "react";
import { createRoot, useFrame, useThree, events } from "@react-three/fiber";
import "./index.css";

function Box(props) {
  const ref = useRef();
  const [active, setActive] = useState(false);
  useFrame(() => (ref.current.rotation.y += 0.01));
  return (
    <mesh
      {...props}
      ref={ref}
      onClick={() => setActive(!active)}
      scale={active ? 1.5 : 1}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={active ? "red" : "orange"} />
    </mesh>
  );
}

function App() {
  const camera = useThree(({ camera }) => camera);
  const domElement = useThree(({ gl }) => gl.domElement);
  return (
    <>
      <orbitControls args={[camera, domElement]} />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[0, 0, 0]} />
    </>
  );
}

const canvasNode = document.getElementById("canvas");

createRoot(canvasNode, { events }).render(<App />, canvasNode);
