import GithubIcon from "./Github";
import InstagramIcon from "./Instagram";
import SoundcloudIcon from "./Soundcloud";
import TelegramIcon from "./Telegram";
import { IconProps } from "./types";

const ICONS = {
  telegram: TelegramIcon,
  soundcloud: SoundcloudIcon,
  instagram: InstagramIcon,
  github: GithubIcon,
};

const Icon: React.FC<IconProps> = ({
  icon,
  color = "white",
  size = "100%",
}) => {
  const IconComponent = ICONS[icon];
  return <IconComponent color={color} size={size} />;
};

export default Icon;
