import { Suspense } from "react";
import { Editor } from "@/components/editor";
import { LoadingState } from "@/components/states";

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <LoadingState label="Loading document" />
        </div>
      }
    >
      <Editor />
    </Suspense>
  );
}