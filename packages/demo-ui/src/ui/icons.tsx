import type { SVGProps } from "react";
export { Folder, FolderOpen } from "lucide-react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, className, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden
      {...{ className }}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.4 2 8 6.6 12.6 2 14 3.4 9.4 8 14 12.6 12.6 14 8 9.4 3.4 14 2 12.6 6.6 8 2 3.4 3.4 2z" />
    </Svg>
  );
}

export function GitBranchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 2a2 2 0 0 1 .8 3.8v4.4a2 2 0 1 1-1.6 0V5.8A2 2 0 0 1 4 2zm8 0a2 2 0 0 1 .8 3.8C12.6 8.5 10.5 9 8.8 9.2A2 2 0 1 1 7.4 7.7c1.5-.2 3.2-.6 3.7-2A2 2 0 0 1 12 2z" />
    </Svg>
  );
}
