"use client";

import { useCallback, useState } from "react";
import { Schema } from "effect";
import { useMountSubscription } from "@/hooks/use-mount-subscription";
import { DEFAULT_PROFILE, type LocalProfile } from "./local-profile-types";
import { profileAvatarColor } from "./local-profile-utils";

const PROFILE_KEY = "local-studio.profile";
const PROFILE_EVENT = "local-studio:profile-change";
const LocalProfileSchema = Schema.Struct({
  name: Schema.String,
  hue: Schema.Number,
  imageUrl: Schema.optionalKey(Schema.String),
});

const decodeLocalProfile = Schema.decodeUnknownOption(LocalProfileSchema);

function readLocalProfile(): LocalProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const option = decodeLocalProfile(
      JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "null"),
    );
    if (option._tag !== "Some") return DEFAULT_PROFILE;
    return {
      name: option.value.name,
      hue: option.value.hue,
      ...(option.value.imageUrl ? { imageUrl: option.value.imageUrl } : {}),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function writeLocalProfile(profile: LocalProfile): void {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {}
}

export function useLocalProfile(): [LocalProfile, (patch: Partial<LocalProfile>) => void] {
  const [profile, setProfile] = useState<LocalProfile>(DEFAULT_PROFILE);
  useMountSubscription(() => {
    const sync = () => setProfile(readLocalProfile());
    sync();
    window.addEventListener(PROFILE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PROFILE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const update = useCallback((patch: Partial<LocalProfile>) => {
    const next = { ...readLocalProfile(), ...patch };
    setProfile(next);
    writeLocalProfile(next);
  }, []);
  return [profile, update];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "S";
  const second = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return `${first}${second}`.toUpperCase();
}

export function ProfileAvatar({ profile, size = 22 }: { profile: LocalProfile; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-cover bg-center font-medium text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        backgroundColor: profileAvatarColor(profile.hue),
        ...(profile.imageUrl
          ? { backgroundImage: `url(${JSON.stringify(profile.imageUrl).slice(1, -1)})` }
          : {}),
      }}
      aria-hidden
    >
      {profile.imageUrl ? null : initials(profile.name)}
    </span>
  );
}
