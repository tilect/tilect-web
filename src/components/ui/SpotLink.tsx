import { PressLink } from "./PressLink";

/**
 * Text link with the logo's spotlight: a light follows the pointer and lights
 * the letters under it, the underline grows from the center, and a press fills
 * a soft pill (see `.spot-link` in globals.css).
 */
export function SpotLink({ href, text }: { href: string; text: string }) {
  return (
    <PressLink href={href} spot className="spot-link">
      <span className="spot-text">{text}</span>
    </PressLink>
  );
}
