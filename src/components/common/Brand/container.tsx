import { BrandView } from "./index";

interface Props {
  size?: number;
  withText?: boolean;
  className?: string;
}

export function Brand({ size = 28, withText = true, className = "" }: Props) {
  return <BrandView size={size} withText={withText} className={className} />;
}
