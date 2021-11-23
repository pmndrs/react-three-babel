import React from "react";
import { createRoot } from "@react-three/fiber";
import "./index.css";

const canvasNode = document.getElementById("canvas");


createRoot(canvasNode).render(
  <mesh>
    <boxGeometry />
    <meshBasicMaterial color='orange' />
  </mesh>,
  canvasNode
);
