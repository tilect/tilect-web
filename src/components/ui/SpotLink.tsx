import { PressLink } from "./PressLink";

/**
 * Email-style text link: on hover/press the underline grows from the center and
 * the text eases to the underline's color (see `.spot-link` in globals.css).
 */
export function SpotLink({ href, text }: { href: string; text: string }) {
  return (
    <PressLink href={href} spot className="spot-link">
      <span className="spot-text">{text}</span>
    </PressLink>
  );
}
