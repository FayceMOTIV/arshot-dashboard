/* eslint-disable @typescript-eslint/no-explicit-any */
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        "ios-src"?: string;
        alt?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "auto-rotate"?: boolean;
        "camera-controls"?: boolean | string;
        "shadow-intensity"?: string;
        poster?: string;
        slot?: string;
        [key: string]: any;
      };
    }
  }
}
