import { SVGProps } from "./types";

/** Thin outline mark: 1.5 stroke on a 24 grid, so it stays crisp at any size. */
const InstagramIcon: React.FC<SVGProps> = ({ color, size }) => (
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
    <rect x="4.5" y="4.5" width="15" height="15" rx="4.2" />
    <circle cx="12" cy="12" r="3.4" />
    <circle cx="16.4" cy="7.6" r="0.6" fill={color} stroke="none" />
  </svg>
);

export default InstagramIcon;
