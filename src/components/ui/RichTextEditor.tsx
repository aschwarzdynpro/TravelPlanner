"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  type LucideIcon,
} from "@/components/icons";

function ToolButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-md transition hover:bg-black/[0.06] dark:hover:bg-white/[0.08] ${
        active
          ? "bg-black/[0.08] text-[var(--foreground)] dark:bg-white/[0.12]"
          : "text-[var(--muted)]"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}

// Controlled-ish rich-text editor. Emits HTML into a hidden <input name> so it
// posts with a normal form. `initialHTML` seeds the content once.
export default function RichTextEditor({
  name,
  initialHTML = "",
  placeholder = "Schreib etwas …",
}: {
  name: string;
  initialHTML?: string;
  placeholder?: string;
}) {
  const [html, setHtml] = useState(initialHTML);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHTML,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "richtext min-h-40 w-full rounded-b-lg px-3 py-2 text-sm outline-none",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const isEmpty = editor.isEmpty;
      setHtml(isEmpty ? "" : editor.getHTML());
    },
  });

  return (
    <div className="rounded-lg border bg-[var(--surface)] focus-within:border-[var(--ring)] focus-within:ring-2 focus-within:ring-[var(--ring)]/30">
      <input type="hidden" name={name} value={html} />
      {editor && (
        <div className="flex flex-wrap items-center gap-1 border-b px-1.5 py-1">
          <ToolButton
            icon={Bold}
            label="Fett"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolButton
            icon={Italic}
            label="Kursiv"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolButton
            icon={Heading2}
            label="Überschrift"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <ToolButton
            icon={List}
            label="Aufzählung"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolButton
            icon={ListOrdered}
            label="Nummerierte Liste"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolButton
            icon={Quote}
            label="Zitat"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
