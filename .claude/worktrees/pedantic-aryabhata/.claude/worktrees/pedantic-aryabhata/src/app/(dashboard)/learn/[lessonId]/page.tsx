"use client";

import { use } from "react";
import { getLessonById } from "@/data/lessons";
import { LessonPlayer } from "@/components/learn/LessonPlayer";
import { notFound } from "next/navigation";

export default function LessonPage({
 params,
}: {
 params: Promise<{ lessonId: string }>;
}) {
 const { lessonId } = use(params);
 const lesson = getLessonById(lessonId);

 if (!lesson) {
 notFound();
 }

 return <LessonPlayer lesson={lesson} />;
}
