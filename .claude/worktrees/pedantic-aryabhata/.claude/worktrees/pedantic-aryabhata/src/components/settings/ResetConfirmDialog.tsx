"use client";

import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { soundEngine } from "@/services/audio/sound-engine";

interface ResetConfirmDialogProps {
 open: boolean;
 onConfirm: () => void;
 onCancel: () => void;
 title: string;
 description: string;
 confirmLabel: string;
}

export function ResetConfirmDialog({
 open,
 onConfirm,
 onCancel,
 title,
 description,
 confirmLabel,
}: ResetConfirmDialogProps) {
 return (
 <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
 <DialogContent className="glass max-w-xs border-border p-0">
 <div className="rounded-t-lg bg-destructive/10 px-4 py-3">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
 <AlertTriangle className="h-4 w-4" />
 {title}
 </DialogTitle>
 </DialogHeader>
 </div>

 <div className="space-y-4 px-4 pb-4">
 <p className="text-[11px] leading-relaxed text-muted-foreground">
 {description}
 </p>

 <div className="flex gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 soundEngine.playClick();
 onCancel();
 }}
 className="flex-1 text-xs"
 >
 Cancel
 </Button>
 <Button
 size="sm"
 onClick={() => {
 soundEngine.playError();
 onConfirm();
 }}
 className="flex-1 bg-destructive text-xs font-semibold text-destructive-foreground hover:bg-destructive/90"
 >
 {confirmLabel}
 </Button>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 );
}
