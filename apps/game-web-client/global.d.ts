declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

import * as ReactThreeFiber from "@react-three/fiber";

declare global {
  namespace React {
    namespace JSX {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      interface IntrinsicElements extends ReactThreeFiber.ThreeElements {}
    }
  }
}

declare module "*.mp3" {
  const src: string;
  export default src;
}
// Similarly for other audio formats
declare module "*.wav" {
  const src: string;
  export default src;
}
declare module "*.ogg" {
  const src: string;
  export default src;
}
