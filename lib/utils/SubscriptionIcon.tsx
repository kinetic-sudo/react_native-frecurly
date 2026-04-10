import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

type IconConfig =
  | { lib: "fa5"; name: string }
  | { lib: "mci"; name: string }
  | { lib: "ion"; name: string };

// Map common service names → brand/category icons
const SERVICE_ICON_MAP: Record<string, IconConfig> = {
  // Streaming
  netflix: { lib: "fa5", name: "film" },
  youtube: { lib: "fa5", name: "youtube" },
  "youtube premium": { lib: "fa5", name: "youtube" },
  spotify: { lib: "fa5", name: "spotify" },
  "apple music": { lib: "fa5", name: "apple" }, // Stayed here
  "apple tv": { lib: "fa5", name: "apple" },
  "apple tv+": { lib: "fa5", name: "apple" },
  "disney+": { lib: "mci", name: "movie-open" },
  hulu: { lib: "mci", name: "television-play" },
  "amazon prime": { lib: "fa5", name: "amazon" },
  "prime video": { lib: "fa5", name: "amazon" },
  hbo: { lib: "mci", name: "television-classic" },
  "hbo max": { lib: "mci", name: "television-classic" },
  "max": { lib: "mci", name: "television-classic" },
  peacock: { lib: "mci", name: "feather" },
  paramount: { lib: "mci", name: "star-circle" },
  "paramount+": { lib: "mci", name: "star-circle" },
  crunchyroll: { lib: "mci", name: "television-play" },
  twitch: { lib: "fa5", name: "twitch" },

  // Music
  "tidal": { lib: "mci", name: "music-circle" },
  deezer: { lib: "mci", name: "music" },
  soundcloud: { lib: "fa5", name: "soundcloud" },

  // AI Tools
  chatgpt: { lib: "mci", name: "robot" },
  openai: { lib: "mci", name: "robot" },
  "claude ai": { lib: "mci", name: "robot-outline" },
  claude: { lib: "mci", name: "robot-outline" },
  anthropic: { lib: "mci", name: "robot-outline" },
  midjourney: { lib: "mci", name: "image-outline" },
  "github copilot": { lib: "fa5", name: "github" },
  gemini: { lib: "mci", name: "google" },

  // Developer Tools
  github: { lib: "fa5", name: "github" },
  gitlab: { lib: "fa5", name: "gitlab" },
  jira: { lib: "fa5", name: "jira" },
  bitbucket: { lib: "fa5", name: "bitbucket" },
  vercel: { lib: "mci", name: "triangle-outline" },
  netlify: { lib: "mci", name: "cloud-upload" },
  heroku: { lib: "fa5", name: "salesforce" },
  digitalocean: { lib: "fa5", name: "digital-ocean" },
  aws: { lib: "fa5", name: "aws" },
  azure: { lib: "fa5", name: "microsoft" },
  "google cloud": { lib: "fa5", name: "google" },
  datadog: { lib: "mci", name: "dog" },
  sentry: { lib: "mci", name: "bug-outline" },
  linear: { lib: "mci", name: "chart-timeline-variant" },
  notion: { lib: "mci", name: "notebook-outline" }, // Stayed here

  // Design
  figma: { lib: "fa5", name: "figma" },
  "adobe creative cloud": { lib: "fa5", name: "adobe" },
  adobe: { lib: "fa5", name: "adobe" },
  sketch: { lib: "mci", name: "vector-bezier" },
  canva: { lib: "mci", name: "palette" },
  framer: { lib: "mci", name: "motion" },

  // Productivity
  slack: { lib: "fa5", name: "slack" },
  evernote: { lib: "fa5", name: "evernote" },
  dropbox: { lib: "fa5", name: "dropbox" },
  "google workspace": { lib: "fa5", name: "google" },
  "google one": { lib: "fa5", name: "google" },
  "microsoft 365": { lib: "fa5", name: "microsoft" },
  "office 365": { lib: "fa5", name: "microsoft" },
  zoom: { lib: "mci", name: "video" },
  trello: { lib: "fa5", name: "trello" },
  asana: { lib: "mci", name: "checkbox-marked-circle-outline" },
  "1password": { lib: "mci", name: "lock" },
  lastpass: { lib: "mci", name: "lock-outline" },
  nord: { lib: "mci", name: "shield-outline" },
  nordvpn: { lib: "mci", name: "shield" },
  expressvpn: { lib: "mci", name: "shield-lock" },

  // Cloud Storage
  icloud: { lib: "fa5", name: "apple" },
  "google drive": { lib: "fa5", name: "google-drive" },
  onedrive: { lib: "fa5", name: "microsoft" },

  // Gaming
  "xbox game pass": { lib: "fa5", name: "xbox" },
  "playstation plus": { lib: "fa5", name: "playstation" },
  "ps plus": { lib: "fa5", name: "playstation" },
  "nintendo online": { lib: "mci", name: "controller-classic" },
  steam: { lib: "fa5", name: "steam" },

  // Finance
  mint: { lib: "mci", name: "cash" },
  "personal capital": { lib: "mci", name: "chart-line" },
};

// Category fallback icons
const CATEGORY_ICON_MAP: Record<string, IconConfig> = {
  Entertainment: { lib: "mci", name: "television-play" },
  "AI Tools":    { lib: "mci", name: "robot" },
  "Developer Tools": { lib: "mci", name: "code-braces" },
  Design:        { lib: "mci", name: "palette" },
  Productivity:  { lib: "mci", name: "briefcase-outline" },
  Cloud:         { lib: "mci", name: "cloud-outline" },
  Music:         { lib: "mci", name: "music-note" },
  Other:         { lib: "mci", name: "view-grid-outline" },
};

export function getIconConfig(name: string, category?: string): IconConfig {
  const key = name.trim().toLowerCase();
  return (
    SERVICE_ICON_MAP[key] ??
    (category ? CATEGORY_ICON_MAP[category] : null) ??
    { lib: "mci", name: "view-grid-outline" }
  );
}

interface SubscriptionIconProps {
  name: string;
  category?: string;
  size?: number;
  color?: string;
}

export function SubscriptionIcon({
  name,
  category,
  size = 22,
  color = "#081126",
}: SubscriptionIconProps) {
  const config = getIconConfig(name, category);

  if (config.lib === "fa5") {
    return (
      <FontAwesome5
        name={config.name as any}
        size={size}
        color={color}
        brand // enables brand icons in FontAwesome5
      />
    );
  }
  if (config.lib === "mci") {
    return (
      <MaterialCommunityIcons
        name={config.name as any}
        size={size}
        color={color}
      />
    );
  }
  return (
    <Ionicons name={config.name as any} size={size} color={color} />
  );
}