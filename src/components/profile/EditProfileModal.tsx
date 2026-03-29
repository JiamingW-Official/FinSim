"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfileStore } from "@/stores/profile-store";
import { cn } from "@/lib/utils";

const AVATAR_EMOJIS = [
  "🐂", "🐻", "🦅", "🦊", "🐺", "🦁", "🐲", "🦄", "🎯", "💎",
  "🔥", "⚡", "🚀", "📈", "🏆", "👑", "🎲", "🃏", "🛡️", "⭐",
];

const AVATAR_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#f97316",
];

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const store = useProfileStore();
  const [name, setName] = useState(store.displayName);
  const [emoji, setEmoji] = useState(store.avatarEmoji);
  const [color, setColor] = useState(store.avatarColor);
  const [bio, setBio] = useState(store.bio);

  const handleSave = () => {
    store.setDisplayName(name);
    store.setAvatar(emoji, color);
    store.setBio(bio);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
              placeholder="Trader"
            />
            <p className="mt-0.5 text-right text-[11px] text-muted-foreground">{name.length}/20</p>
          </div>

          {/* Avatar Emoji */}
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">
              Avatar
            </label>
            <div className="grid grid-cols-10 gap-1">
              {AVATAR_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all",
                    emoji === e
                      ? "bg-primary/15 ring-2 ring-primary/40 scale-110"
                      : "hover:bg-accent",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Color */}
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">
              Color
            </label>
            <div className="flex gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all",
                    color === c && "ring-2 ring-white/40 ring-offset-2 ring-offset-background scale-110",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 140))}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary"
              placeholder="Tell the market about yourself..."
            />
            <p className="mt-0.5 text-right text-[11px] text-muted-foreground">{bio.length}/140</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
