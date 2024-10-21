import * as React from "react";
import type { SVGProps } from "react";
const SvgGallery = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M17.4 14.85V5.5c0-1.45-1.15-2.6-2.6-2.6H5.5c-1.45 0-2.6 1.15-2.6 2.6v9.35c0 1.45 1.15 2.6 2.6 2.6h9.35c1.4-.05 2.55-1.2 2.55-2.6m2.2-7.35v8.05c0 2.25-1.85 4.1-4.1 4.1H7.45c-.3 0-.45.35-.25.55.5.55 1.2.9 2.05.9h6.7c2.85 0 5.15-2.3 5.15-5.15v-6.7c0-.8-.35-1.55-.9-2.05-.25-.2-.6 0-.6.3"
    />
  </svg>
);
export default SvgGallery;
