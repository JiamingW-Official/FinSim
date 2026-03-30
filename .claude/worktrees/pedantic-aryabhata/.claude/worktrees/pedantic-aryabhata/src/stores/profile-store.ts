import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileState {
 displayName: string;
 avatarEmoji: string;
 avatarColor: string;
 bio: string;
 featuredAchievementId: string | null;

 setDisplayName: (name: string) => void;
 setAvatar: (emoji: string, color: string) => void;
 setBio: (bio: string) => void;
 setFeaturedAchievement: (id: string | null) => void;
}

export const useProfileStore = create<ProfileState>()(
 persist(
 (set) => ({
 displayName: "Trader",
 avatarEmoji: "Bull",
 avatarColor: "#10b981",
 bio: "",
 featuredAchievementId: null,

 setDisplayName: (name) => set({ displayName: name.slice(0, 20) }),
 setAvatar: (emoji, color) => set({ avatarEmoji: emoji, avatarColor: color }),
 setBio: (bio) => set({ bio: bio.slice(0, 140) }),
 setFeaturedAchievement: (id) => set({ featuredAchievementId: id }),
 }),
 {
 name: "alpha-deck-profile",
 },
 ),
);
