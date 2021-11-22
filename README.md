# react-three-babel

A babel plugin that automatically builds the extend catalogue of known native Threejs elements which enables granular usage of Threejs and therefore tree shaking.

```bash
npm install @react-three/babel
```

```javascript babel.config.js
module.exports = {
  plugins: ['@react-three/babel'],
}
```

#### In

```jsx
import { createRoot } from '@react-three/fiber'

createRoot(canvasNode).render((
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
))
```

#### Out

```jsx
import { createRoot, extend } from '@react-three/fiber'
import { Mesh, BoxGeometry, MeshStandardMaterial } from 'three'

extend({ Mesh, BoxGeometry, MeshStandardMaterial })

createRoot(canvasNode).render((
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
))
```
