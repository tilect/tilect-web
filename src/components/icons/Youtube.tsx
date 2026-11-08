import { SVGProps } from "./types";

/** Thin outline mark: 1.5 stroke on a 24 grid, so it stays crisp at any size. */
const YoutubeIcon: React.FC<SVGProps> = ({ color, size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    shapeRendering="geometricPrecision"
  >
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="M10 9.5v5l4.5-2.5z" />
  </svg>
);

export default YoutubeIcon;
