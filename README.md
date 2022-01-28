# react-three-babel

A Babel plugin that automatically builds the `extend` catalogue of known native Three.js elements which enables granular usage of Three.js and therefore tree shaking.

- [Install](#install)
- [Usage](#usage)
  - [Default](#default)
  - [Custom import source](#custom-import-source)
- [How it Works](#how-it-works)
- [Limitations](#limitations)

## Install

```bash
npm install --save-dev @react-three/babel
```

## Usage

### Default

```javascript babel.config.js
module.exports = {
  plugins: ["module:@react-three/babel"],
};
```

**In**

```jsx
import { createRoot } from "@react-three/fiber";

createRoot(canvasNode).render(
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
);
```

**Out**

```jsx
import { createRoot, extend } from "@react-three/fiber";
import {
  Mesh as _Mesh,
  BoxGeometry as _BoxGeometry,
  MeshStandardMaterial as _MeshStandardMaterial,
} from "three";

extend({
  Mesh: _Mesh,
  BoxGeometry: _BoxGeometry,
  MeshStandardMaterial: _MeshStandardMaterial,
});

createRoot(canvasNode).render(
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
);
```

### Custom import source

```javascript babel.config.js
module.exports = {
  plugins: [
    "module:@react-three/babel",
    {
      importSource: "three-stdlib", // default: three
    },
  ],
};
```

**In**

```jsx
import { createRoot } from "@react-three/fiber";

createRoot(canvasNode).render(<mesh />);
```

**Out**

```jsx
import { createRoot, extend } from "@react-three/fiber";
import { Mesh as _Mesh } from "three-stdlib";

extend({ Mesh: _Mesh });

createRoot(canvasNode).render(<mesh />);
```

## How it Works

The plugin starts by looking at all the JSX elements that you include in your source 
code files (ex. `<h1/>`, `<p/>`, `<ambientLight/>`, etc.). If any of them match an import
from the `three` namespace (or `importSource`, as shown in example above), then it is
added to a set.

Once all the JSX elements in a file are examined, the plugin adds the following imports to that file:

- Import `extend` function from `@react-three/fiber`
- For each name in the set, a named import from the `three` namespace (ex. `import { Mesh } from 'three'`)
  
Finally, it adds a call to `extend` with the named imports.

## Limitations

This plugin relies on static analysis of JSX identifiers, which means that **if you wrap any elements or generate elements dynamically, they will not be picked up by this plugin**. 

However, the `animated` elements from `@react-spring/three`, like `<animated.mesh />`, WILL be picked up by this plugin. 

But something like this will not:

```jsx
const StyledMesh = styled('mesh')

<StyledMesh />
```
