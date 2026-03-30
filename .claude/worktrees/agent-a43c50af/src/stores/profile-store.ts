import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileState {
  displayName: string;
  avatarEmoji: string;
  avatarColor: string;
  bio: string;
  motto: string;
  strategyStyle: string;
  featuredAchievementId: string | null;

  setDisplayName: (name: string) => void;
  setAvatar: (emoji: string, color: string) => void;
  setBio: (bio: string) => void;
  setMotto: (motto: string) => void;
  setStrategyStyle: (style: string) => void;
  setFeaturedAchievement: (id: string | null) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      displayName: "Trader",
      avatarEmoji: "🐂",
      avatarColor: "#10b981",
      bio: "",
      motto: "",
      strategyStyle: "",
      featuredAchievementId: null,

      setDisplayName: (name) => set({ displayName: name.slice(0, 20) }),
      setAvatar: (emoji, color) => set({ avatarEmoji: emoji, avatarColor: color }),
      setBio: (bio) => set({ bio: bio.slice(0, 140) }),
      setMotto: (motto) => set({ motto: motto.slice(0, 60) }),
      setStrategyStyle: (style) => set({ strategyStyle: style }),
      setFeaturedAchievement: (id) => set({ featuredAchievementId: id }),
    }),
    {
      name: "alpha-deck-profile",
    },
  ),
);
