import * as React from "react";
import type { SVGProps } from "react";
const SvgComment = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={1.8}
      d="m3.929 18.04.107-.444-.265-.372A9.46 9.46 0 0 1 2 11.707C2 6.37 6.452 2 12 2c5.549 0 10 4.371 10 9.707s-4.451 9.707-10 9.707c-1.607 0-3.123-.368-4.465-1.019l-.427-.207-.43.2-3.46 1.6c-.03.014-.046.012-.056.01a.14.14 0 0 1-.066-.035.21.21 0 0 1-.063-.219z"
    />
  </svg>
);
export default SvgComment;
