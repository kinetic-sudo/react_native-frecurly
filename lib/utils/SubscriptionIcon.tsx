import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, View } from "react-native";

const LOGO_ASSET_MAP: Record<string, any> = {
  spotify:               require("../../assets/icons/spotify.png"),
  notion:                require("../../assets/icons/notion.png"),
  netflix:               require("../../assets/icons/netflix.png"),
  github:                require("../../assets/icons/github.png"),
  adobe:                 require("../../assets/icons/adobe.png"),
};

type VectorConfig = { lib: "mci"; name: string };

const SERVICE_VECTOR_MAP: Record<string, VectorConfig> = {
  adobe:                 { lib: "mci", name: "adobe" },
  "adobe creative cloud":{ lib: "mci", name: "adobe" },
  github:                { lib: "mci", name: "github" },
  "github copilot":      { lib: "mci", name: "github" },
  gitlab:                { lib: "mci", name: "gitlab" },
  slack:                 { lib: "mci", name: "slack" },
  figma:                 { lib: "mci", name: "figma" },
  dropbox:               { lib: "mci", name: "dropbox" },
  youtube:               { lib: "mci", name: "youtube" },
  "youtube premium":     { lib: "mci", name: "youtube" },
  twitch:                { lib: "mci", name: "twitch" },
  spotify:               { lib: "mci", name: "spotify" },
  "amazon prime":        { lib: "mci", name: "amazon" },
  "prime video":         { lib: "mci", name: "amazon" },
  steam:                 { lib: "mci", name: "steam" },
  trello:                { lib: "mci", name: "trello" },
  "google drive":        { lib: "mci", name: "google-drive" },
  "google workspace":    { lib: "mci", name: "google" },
  "google one":          { lib: "mci", name: "google" },
  "google cloud":        { lib: "mci", name: "google-cloud" },
  "microsoft 365":       { lib: "mci", name: "microsoft" },
  "office 365":          { lib: "mci", name: "microsoft" },
  azure:                 { lib: "mci", name: "microsoft-azure" },
  aws:                   { lib: "mci", name: "aws" },
  digitalocean:          { lib: "mci", name: "digital-ocean" },
  icloud:                { lib: "mci", name: "apple-icloud" },
  "apple music":         { lib: "mci", name: "music-circle" },
  "apple tv":            { lib: "mci", name: "television-play" },
  "apple tv+":           { lib: "mci", name: "television-play" },
  "xbox game pass":      { lib: "mci", name: "microsoft-xbox" },
  "playstation plus":    { lib: "mci", name: "sony-playstation" },
  "ps plus":             { lib: "mci", name: "sony-playstation" },
  soundcloud:            { lib: "mci", name: "soundcloud" },
  evernote:              { lib: "mci", name: "evernote" },
  jira:                  { lib: "mci", name: "jira" },
  bitbucket:             { lib: "mci", name: "bitbucket" },
  netflix:               { lib: "mci", name: "netflix" },
  "disney+":             { lib: "mci", name: "movie-open-outline" },
  hulu:                  { lib: "mci", name: "television-play" },
  hbo:                   { lib: "mci", name: "television-classic" },
  "hbo max":             { lib: "mci", name: "television-classic" },
  max:                   { lib: "mci", name: "television-classic" },
  chatgpt:               { lib: "mci", name: "robot-outline" },
  openai:                { lib: "mci", name: "robot-outline" },
  claude:                { lib: "mci", name: "robot-excited-outline" },
  "claude ai":           { lib: "mci", name: "robot-excited-outline" },
  anthropic:             { lib: "mci", name: "robot-excited-outline" },
  midjourney:            { lib: "mci", name: "image-filter-vintage" },
  gemini:                { lib: "mci", name: "google" },
  perplexity:            { lib: "mci", name: "magnify-scan" },
  notion:                { lib: "mci", name: "notebook-outline" },
  zoom:                  { lib: "mci", name: "video-outline" },
  "1password":           { lib: "mci", name: "lock-outline" },
  nordvpn:               { lib: "mci", name: "shield-outline" },
  canva:                 { lib: "mci", name: "palette-outline" },
  vercel:                { lib: "mci", name: "triangle-outline" },
  linear:                { lib: "mci", name: "chart-timeline-variant-shimmer" },
};

const CATEGORY_VECTOR_MAP: Record<string, VectorConfig> = {
  Entertainment:       { lib: "mci", name: "television-play" },
  "AI Tools":          { lib: "mci", name: "robot-outline" },
  "Developer Tools":   { lib: "mci", name: "code-braces" },
  Design:              { lib: "mci", name: "palette-outline" },
  Productivity:        { lib: "mci", name: "briefcase-outline" },
  Cloud:               { lib: "mci", name: "cloud-outline" },
  Music:               { lib: "mci", name: "music-note-outline" },
  Other:               { lib: "mci", name: "view-grid-outline" },
};

interface SubscriptionIconProps {
  name: string;
  category?: string;
  size?: number;
  color?: string;
  icon?: any;
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

  // 1️⃣ PNG asset by name
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

  // 2️⃣ Vector icon by service name
  const vectorConfig =
    SERVICE_VECTOR_MAP[key] ??
    (category ? CATEGORY_VECTOR_MAP[category] : null);

  if (vectorConfig) {
    return (
      <MaterialCommunityIcons
        name={vectorConfig.name as any}
        size={size}
        color={color}
      />
    );
  }

  // 3️⃣ Wallet PNG fallback
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