"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

/*
  Four Lucide glyphs that the lucide-animated set (the other files in this folder) does not have: megaphone,
  handshake, database and unplug. They are animated the same way as the set: Lucide's own paths, one short move each,
  and the same handle (startAnimation / stopAnimation), so the icon well plays them like the others.
*/

export interface CustomIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type IconProps = HTMLAttributes<HTMLDivElement> & { size?: number };

function useHandle(ref: Ref<CustomIconHandle>) {
  const controls = useAnimation();
  useImperativeHandle(ref, () => ({
    startAnimation: () => controls.start("animate"),
    stopAnimation: () => controls.start("normal"),
  }));
  return controls;
}

function Glyph({ size, children, className, ...props }: IconProps & { children: ReactNode }) {
  return (
    <div className={cn(className)} {...props}>
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {children}
      </svg>
    </div>
  );
}

/* Megaphone: it lifts and calls out, swinging on its handle. */
const CALL: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -14, 9, -6, 3, 0], transition: { duration: 0.8, ease: "easeInOut" } },
};

const MegaphoneIcon = forwardRef<CustomIconHandle, IconProps>(({ size = 28, ...props }, ref) => {
  const controls = useHandle(ref);
  return (
    <Glyph size={size} {...props}>
      <motion.g animate={controls} variants={CALL} initial="normal" style={{ originX: "20%", originY: "60%" }}>
        <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
        <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" />
        <path d="M8 6v8" />
      </motion.g>
    </Glyph>
  );
});
MegaphoneIcon.displayName = "MegaphoneIcon";

/* Handshake: the two hands shake, up and down twice. */
const SHAKE: Variants = {
  normal: { y: 0, rotate: 0 },
  animate: { y: [0, -2.4, 1.8, -1.4, 0.8, 0], rotate: [0, -4, 3, -2, 1, 0], transition: { duration: 0.75, ease: "easeInOut" } },
};

const HandshakeIcon = forwardRef<CustomIconHandle, IconProps>(({ size = 28, ...props }, ref) => {
  const controls = useHandle(ref);
  return (
    <Glyph size={size} {...props}>
      <motion.g animate={controls} variants={SHAKE} initial="normal" style={{ originX: "50%", originY: "50%" }}>
        <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
        <path d="m21 3 1 11h-2" />
        <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
        <path d="M3 4h8" />
      </motion.g>
    </Glyph>
  );
});
HandshakeIcon.displayName = "HandshakeIcon";

/* Database: the lid lifts and settles, and the middle ring is drawn again round the drum. */
const LID: Variants = {
  normal: { y: 0 },
  animate: { y: [0, -3, 0], transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const RING: Variants = {
  normal: { pathLength: 1, opacity: 1 },
  animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.55, delay: 0.15, ease: "easeOut" } },
};

const DatabaseIcon = forwardRef<CustomIconHandle, IconProps>(({ size = 28, ...props }, ref) => {
  const controls = useHandle(ref);
  return (
    <Glyph size={size} {...props}>
      <motion.ellipse cx="12" cy="5" rx="9" ry="3" animate={controls} variants={LID} initial="normal" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <motion.path d="M3 12A9 3 0 0 0 21 12" animate={controls} variants={RING} initial="normal" />
    </Glyph>
  );
});
DatabaseIcon.displayName = "DatabaseIcon";

/* Unplug: the plug and the socket pull apart and come back, still not joined. */
const PLUG: Variants = {
  normal: { x: 0, y: 0 },
  animate: { x: [0, -2, 0], y: [0, 2, 0], transition: { duration: 0.7, ease: "easeInOut" } },
};
const SOCKET: Variants = {
  normal: { x: 0, y: 0 },
  animate: { x: [0, 2, 0], y: [0, -2, 0], transition: { duration: 0.7, ease: "easeInOut" } },
};

const UnplugIcon = forwardRef<CustomIconHandle, IconProps>(({ size = 28, ...props }, ref) => {
  const controls = useHandle(ref);
  return (
    <Glyph size={size} {...props}>
      <motion.g animate={controls} variants={SOCKET} initial="normal">
        <path d="m19 5 3-3" />
        <path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z" />
      </motion.g>
      <motion.g animate={controls} variants={PLUG} initial="normal">
        <path d="m2 22 3-3" />
        <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z" />
        <path d="M7.5 13.5 10 11" />
        <path d="M10.5 16.5 13 14" />
      </motion.g>
    </Glyph>
  );
});
UnplugIcon.displayName = "UnplugIcon";

export { DatabaseIcon, HandshakeIcon, MegaphoneIcon, UnplugIcon };
