# react-three-babel

A Babel plugin that automatically builds the `extend` catalogue of known native Three.js elements which enables granular usage of Three.js and therefore tree shaking.

```bash
npm install --save-dev @react-three/babel
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
import {
  Mesh as _Mesh, 
  BoxGeometry as _BoxGeometry, 
  MeshStandardMaterial as _MeshStandardMaterial
} from 'three'

extend({
  Mesh: _Mesh,
  BoxGeometry: _BoxGeometry,
  MeshStandardMaterial: _MeshStandardMaterial
})

createRoot(canvasNode).render((
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
))
```
