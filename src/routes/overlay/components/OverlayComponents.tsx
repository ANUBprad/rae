import React from "react";

export interface OverlayButtonProps {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
  customBgColor?: string; // Optional custom background color
  draggable?: boolean; // Whether the button should be draggable
}

export const OverlayButton = ({
  onClick,
  active = false,
  title,
  children,
  className = "",
  customBgColor = "",
  draggable = true,
}: OverlayButtonProps) => (
  <div onClick={onClick} className="h-full group aspect-square shrink-0 p-1">
    <button
    
    className={`${
      draggable ? "drag" : ""
    } h-full bg-transparent group-hover:dark:bg-zinc-900 group-hover:dark:text-white dark:text-zinc-400  flex items-center justify-center aspect-square shrink-0 rounded-lg transition-all duration-150   ${
      active ? `bg-foreground/20  text-surface ` : ""
    } ${className}`}
    title={title}
  >
    {children}
  </button>
  </div>
);

// Example usage (replace with your logic):
// <OverlayButton onClick={() => setMicOn(v => !v)} active={micOn} title="Voice">
//   <Mic size={16} />
// </OverlayButton>
