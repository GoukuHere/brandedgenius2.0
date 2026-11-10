/*
  v11's animated icons. Fifteen come from lucide-animated (https://lucide-animated.com, MIT, see LICENSE in this
  folder), copied unchanged; four are animated here in the same way (custom.tsx). All are Lucide's own shapes and
  share one handle: startAnimation() plays the icon's move, stopAnimation() returns it to rest.
*/

import { BotIcon } from "./bot";
import { ChartColumnIncreasingIcon } from "./chart-column-increasing";
import { DatabaseIcon, HandshakeIcon, MegaphoneIcon, UnplugIcon } from "./custom";
import { GaugeIcon } from "./gauge";
import { GraduationCapIcon } from "./graduation-cap";
import { HandIcon } from "./hand";
import { LayersIcon } from "./layers";
import { RocketIcon } from "./rocket";
import { RouteIcon } from "./route";
import { TimerIcon } from "./timer";
import { TrendingUpIcon } from "./trending-up";
import { UserCheckIcon } from "./user-check";
import { UsersIcon } from "./users";
import { WaypointsIcon } from "./waypoints";
import { WorkflowIcon } from "./workflow";
import { ZapIcon } from "./zap";

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export const ANIMATED_ICONS = {
  bot: BotIcon,
  "chart-column-increasing": ChartColumnIncreasingIcon,
  database: DatabaseIcon,
  gauge: GaugeIcon,
  "graduation-cap": GraduationCapIcon,
  hand: HandIcon,
  handshake: HandshakeIcon,
  layers: LayersIcon,
  megaphone: MegaphoneIcon,
  rocket: RocketIcon,
  route: RouteIcon,
  timer: TimerIcon,
  "trending-up": TrendingUpIcon,
  unplug: UnplugIcon,
  "user-check": UserCheckIcon,
  users: UsersIcon,
  waypoints: WaypointsIcon,
  workflow: WorkflowIcon,
  zap: ZapIcon,
} as const;

export type IconName = keyof typeof ANIMATED_ICONS;
