import * as React from "react";
import type { SVGProps } from "react";
const SvgPerson = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={22}
    fill="none"
    viewBox="0 0 20 22"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={2}
      d="M19 18.358c0-1.607-.895-3.15-2.517-4.328-1.62-1.177-3.91-1.936-6.483-1.936s-4.862.759-6.483 1.936C1.895 15.21 1 16.751 1 18.358c0 .805.217 1.265.508 1.569.315.329.831.594 1.64.776 1.394.313 3.252.304 5.49.292a258 258 0 0 1 2.725 0c2.237.012 4.095.021 5.489-.292.809-.182 1.325-.447 1.64-.776.29-.304.508-.764.508-1.569ZM13.5 4.538c0 1.962-1.575 3.539-3.5 3.539S6.5 6.5 6.5 4.538 8.075 1 10 1s3.5 1.576 3.5 3.538Z"
    />
  </svg>
);
export default SvgPerson;
