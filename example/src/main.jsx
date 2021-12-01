import React, { useRef } from "react";
import { createRoot, useFrame } from "@react-three/fiber";
import "./index.css";

function Box(props) {
  const ref = useRef();
  useFrame(() => (ref.current.rotation.y = ref.current.rotation.x += 0.01));
  return (
    <mesh {...props} ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function App() {
  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[0, 0, 0]} />
    </>
  );
}

const canvasNode = document.getElementById("canvas");

createRoot(canvasNode).render(<App />, canvasNode);
