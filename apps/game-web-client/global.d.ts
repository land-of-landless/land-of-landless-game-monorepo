declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

import * as ReactThreeFiber from "@react-three/fiber";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ReactThreeFiber.ThreeElements {}
    }
  }
}
