export type IconName = "telegram" | "soundcloud" | "instagram" | "github";

export type IconProps = {
  color?: string;
  width?: string | number;
  height?: string | number;
  size?: string | number;
  icon: IconName;
};

export type SVGProps = {
  color?: string;
  width?: string | number;
  height?: string | number;
  size?: string | number;
};
