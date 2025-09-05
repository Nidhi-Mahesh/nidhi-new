declare namespace JSX {
  interface IntrinsicElements {
    'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      url: string;
      "event-target-element"?: string;
      "scene-width"?: string;
      "scene-height"?: string;
    };
  }
}
