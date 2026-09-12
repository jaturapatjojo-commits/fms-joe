"use client";

import { useId, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

// Dynamically import TinyMCE Editor to avoid SSR / window undefined errors
const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] w-full items-center justify-center rounded-md border border-input bg-muted/20 text-muted-foreground">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>กำลังโหลด Rich Text Editor...</span>
        </div>
      </div>
    ),
  },
);

export interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: number | string;
  id?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
  height = 340,
  id,
}: RichTextEditorProps) {
  const generatedId = useId();
  const editorId = id || generatedId;
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="flex w-full items-center justify-center rounded-md border border-input bg-muted/20 text-muted-foreground"
      >
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>กำลังโหลด Rich Text Editor...</span>
        </div>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="rich-text-editor-container overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
      <style
        dangerouslySetInnerHTML={{
          __html: `.tox-tinymce-aux { z-index: 99999 !important; }`,
        }}
      />
      <Editor
        id={editorId}
        licenseKey="gpl"
        tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.6.0/tinymce.min.js"
        value={value}
        rollback={false}
        onEditorChange={(newContent) => {
          onChange(newContent);
        }}
        disabled={disabled}
        init={{
          height,
          menubar: false,
          branding: false,
          promotion: false,
          placeholder: placeholder || "",
          setup: (editor: { getContent: () => string; on: (events: string, fn: () => void) => void }) => {
            const sync = () => {
              const current = editor.getContent();
              onChange(current);
            };
            editor.on("change keyup input NodeChange SetContent", sync);
          },
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table link image | removeformat code fullscreen",
          skin: isDark ? "oxide-dark" : "oxide",
          content_css: isDark ? "dark" : "default",
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              padding: 12px;
            }
            img { max-width: 100%; height: auto; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px; }
          `,
          statusbar: true,
          resize: true,
        }}
      />
    </div>
  );
}
