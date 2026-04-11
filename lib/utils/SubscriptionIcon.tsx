import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, View } from "react-native";

// ── PNG assets you already have in /assets/icons ──────────────────────────────
// Add more as you add PNGs to your assets folder
const LOGO_ASSET_MAP: Record<string, any> = {
  spotify:               require("../../assets/icons/spotify.png"),
  notion:                require("../../assets/icons/notion.png"),
  // Add yours here as you add PNGs:
  netflix:            require("../../assets/icons/netflix.png"),
  github:             require("../../assets/icons/github.png"),
  // slack:              require("../../assets/icons/slack.png"),
  // figma:              require("../../assets/icons/figma.png"),
  adobe:              require("../../assets/icons/adobe.png"),
};

// ── Vector icon fallbacks ─────────────────────────────────────────────────────
type VectorConfig =
  | { lib: "fa5"; name: string; brand?: boolean }
  | { lib: "mci"; name: string };

const SERVICE_VECTOR_MAP: Record<string, VectorConfig> = {
  // Streaming
  netflix:              { lib: "mci", name: "netflix" },
  youtube:              { lib: "fa5", name: "youtube", brand: true },
  "youtube premium":    { lib: "fa5", name: "youtube", brand: true },
  twitch:               { lib: "fa5", name: "twitch", brand: true },
  "disney+":            { lib: "mci", name: "movie-open-outline" },
  hulu:                 { lib: "mci", name: "television-play" },
  "amazon prime":       { lib: "fa5", name: "amazon", brand: true },
  "prime video":        { lib: "fa5", name: "amazon", brand: true },
  hbo:                  { lib: "mci", name: "television-classic" },
  "hbo max":            { lib: "mci", name: "television-classic" },
  max:                  { lib: "mci", name: "television-classic" },
  peacock:              { lib: "mci", name: "television-shimmer" },
  paramount:            { lib: "mci", name: "star-circle-outline" },
  "paramount+":         { lib: "mci", name: "star-circle-outline" },
  crunchyroll:          { lib: "mci", name: "television-play" },
  appletv:              { lib: "fa5", name: "apple", brand: true },
  "apple tv+":          { lib: "fa5", name: "apple", brand: true },

  // Music
  "apple music":        { lib: "fa5", name: "apple", brand: true },
  tidal:                { lib: "mci", name: "music-circle-outline" },
  deezer:               { lib: "mci", name: "music-note" },
  soundcloud:           { lib: "fa5", name: "soundcloud", brand: true },

  // AI Tools
  chatgpt:              { lib: "mci", name: "robot-outline" },
  openai:               { lib: "mci", name: "robot-outline" },
  "claude ai":          { lib: "mci", name: "robot-excited-outline" },
  claude:               { lib: "mci", name: "robot-excited-outline" },
  anthropic:            { lib: "mci", name: "robot-excited-outline" },
  midjourney:           { lib: "mci", name: "image-filter-vintage" },
  "github copilot":     { lib: "fa5", name: "github", brand: true },
  gemini:               { lib: "mci", name: "google" },
  perplexity:           { lib: "mci", name: "magnify-scan" },
  cursor:               { lib: "mci", name: "cursor-text" },

  // Developer Tools
  github:               { lib: "fa5", name: "github", brand: true },
  gitlab:               { lib: "fa5", name: "gitlab", brand: true },
  jira:                 { lib: "fa5", name: "jira", brand: true },
  bitbucket:            { lib: "fa5", name: "bitbucket", brand: true },
  vercel:               { lib: "mci", name: "triangle-outline" },
  netlify:              { lib: "mci", name: "cloud-upload-outline" },
  digitalocean:         { lib: "fa5", name: "digital-ocean", brand: true },
  aws:                  { lib: "fa5", name: "aws", brand: true },
  azure:                { lib: "fa5", name: "microsoft", brand: true },
  "google cloud":       { lib: "fa5", name: "google", brand: true },
  sentry:               { lib: "mci", name: "bug-outline" },
  linear:               { lib: "mci", name: "chart-timeline-variant-shimmer" },
  datadog:              { lib: "mci", name: "dog-side" },

  // Design
  figma:                { lib: "fa5", name: "figma", brand: true },
  "adobe creative cloud":{ lib: "fa5", name: "adobe", brand: true },
  adobe:                { lib: "fa5", name: "adobe", brand: true },
  canva:                { lib: "mci", name: "palette-outline" },
  sketch:               { lib: "mci", name: "vector-bezier" },

  // Productivity
  notion:               { lib: "mci", name: "notebook-outline" },
  slack:                { lib: "fa5", name: "slack", brand: true },
  evernote:             { lib: "fa5", name: "evernote", brand: true },
  dropbox:              { lib: "fa5", name: "dropbox", brand: true },
  "google workspace":   { lib: "fa5", name: "google", brand: true },
  "google one":         { lib: "fa5", name: "google", brand: true },
  "microsoft 365":      { lib: "fa5", name: "microsoft", brand: true },
  "office 365":         { lib: "fa5", name: "microsoft", brand: true },
  zoom:                 { lib: "mci", name: "video-outline" },
  trello:               { lib: "fa5", name: "trello", brand: true },
  "1password":          { lib: "mci", name: "lock-outline" },
  nordvpn:              { lib: "mci", name: "shield-outline" },
  expressvpn:           { lib: "mci", name: "shield-lock-outline" },

  // Cloud / Storage
  icloud:               { lib: "fa5", name: "apple", brand: true },
  "google drive":       { lib: "fa5", name: "google-drive", brand: true },
  onedrive:             { lib: "fa5", name: "microsoft", brand: true },

  // Gaming
  "xbox game pass":     { lib: "fa5", name: "xbox", brand: true },
  "playstation plus":   { lib: "fa5", name: "playstation", brand: true },
  "ps plus":            { lib: "fa5", name: "playstation", brand: true },
  "nintendo online":    { lib: "mci", name: "nintendo-game-boy" },
  steam:                { lib: "fa5", name: "steam", brand: true },
};

// ── Category fallbacks ────────────────────────────────────────────────────────
const CATEGORY_VECTOR_MAP: Record<string, VectorConfig> = {
  Entertainment:     { lib: "mci", name: "television-play" },
  "AI Tools":        { lib: "mci", name: "robot-outline" },
  "Developer Tools": { lib: "mci", name: "code-braces" },
  Design:            { lib: "mci", name: "palette-outline" },
  Productivity:      { lib: "mci", name: "briefcase-outline" },
  Cloud:             { lib: "mci", name: "cloud-outline" },
  Music:             { lib: "mci", name: "music-note-outline" },
  Other:             { lib: "mci", name: "view-grid-outline" },
};

// ── Component ─────────────────────────────────────────────────────────────────
interface SubscriptionIconProps {
  name: string;
  category?: string;
  size?: number;
  color?: string;
  icon?: any; // the ImageSourcePropType from subscription data
}

export function getIconAsset(key: string): any | null {
  return LOGO_ASSET_MAP[key.trim().toLowerCase()] ?? null;
}

export function SubscriptionIcon({
  name,
  category,
  size = 22,
  color = "#081126",
  icon,
}: SubscriptionIconProps) {
  const key = name.trim().toLowerCase();

  // 1️⃣ PNG asset map by name — highest priority
  if (LOGO_ASSET_MAP[key]) {
    return (
      <View style={{
        width: size + 10,
        height: size + 10,
        borderRadius: (size + 10) / 2,
        backgroundColor: "rgba(0,0,0,0.06)",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Image
          source={LOGO_ASSET_MAP[key]}
          style={{ width: size, height: size, borderRadius: size / 4 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // 2️⃣ Vector icon — service-specific or category fallback
  const vectorConfig =
    SERVICE_VECTOR_MAP[key] ??
    (category ? CATEGORY_VECTOR_MAP[category] : null);

  if (vectorConfig) {
    if (vectorConfig.lib === "fa5") {
      return (
        <FontAwesome5
          name={vectorConfig.name as any}
          size={size}
          color={color}
          brand={vectorConfig.brand ?? false}
        />
      );
    }
    return (
      <MaterialCommunityIcons
        name={vectorConfig.name as any}
        size={size}
        color={color}
      />
    );
  }

  // 3️⃣ Passed icon prop (wallet fallback) — only if nothing else matched
  if (icon) {
    return (
      <Image
        source={icon}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  // 4️⃣ Absolute last resort
  return (
    <MaterialCommunityIcons
      name="view-grid-outline"
      size={size}
      color={color}
    />
  );
}