"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Shield } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useGameStore } from "@/stores/game-store";
import { EditProfileModal } from "./EditProfileModal";

export function ProfileHeader() {
  const [editOpen, setEditOpen] = useState(false);
  const displayName = useProfileStore((s) => s.displayName);
  const avatarEmoji = useProfileStore((s) => s.avatarEmoji);
  const avatarColor = useProfileStore((s) => s.avatarColor);
  const bio = useProfileStore((s) => s.bio);
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);

  return (
    <>
      <div className="relative overflow-hidden rounded-md border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-md text-lg"
            style={{ backgroundColor: `${avatarColor}20` }}
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {avatarEmoji}
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{displayName}</h1>
              <motion.button
                type="button"
                onClick={() => setEditOpen(true)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </motion.button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="badge-premium flex items-center gap-1 rounded-md px-2 py-0.5">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  Lv.{level} {title}
                </span>
              </div>
            </div>
            {bio && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">{bio}</p>
            )}
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl" />
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
