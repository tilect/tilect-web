import { SVGProps } from "./types";

/** Thin outline mark: 1.5 stroke on a 24 grid, so it stays crisp at any size. */
const SoundcloudIcon: React.FC<SVGProps> = ({ color, size }) => (
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
    <path d="M3 14v2.5M6 12.5v4M9 11v6.5" />
    <path d="M12 17.5h7a3.25 3.25 0 0 0 .4-6.47A5.25 5.25 0 0 0 12 8.3z" />
  </svg>
);

export default SoundcloudIcon;
