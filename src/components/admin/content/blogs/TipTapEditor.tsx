"use client";

import React, { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/admin/ui/button";
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  Quote, 
  Link as LinkIcon, 
  Unlink, 
  Image as ImageIcon,
  Loader2 
} from "lucide-react";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#A38B68] underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl border max-h-[400px] object-cover mx-auto my-6 block",
        },
      }),
    ],
    content: content || "<p></p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose-base focus:outline-none min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 border border-[var(--border)] rounded-xl bg-white text-black font-sans leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-[#D9C2A0] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-neutral-50 prose-blockquote:py-1",
      },
    },
  });

  // Sync content only if it differs from current editor HTML (prevents cursors jumping)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "<p></p>");
    }
  }, [content, editor]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleH2 = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  }, [editor]);

  const toggleH3 = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 3 }).run();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Keçid üçün URL daxil edin:", previousUrl);

    // cancelled
    if (url === null) return;

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch(`${API_URL}/api/uploads`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Şəkil yüklənərkən xəta baş verdi.");
      }

      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } catch (err) {
      alert("Şəkil yüklənə bilmədi. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-neutral-50 border border-[var(--border)] rounded-xl items-center">
        {/* Bold */}
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="icon"
          onClick={toggleBold}
          className="h-8 w-8"
          title="Qalın (Bold)"
        >
          <Bold size={16} />
        </Button>

        {/* Italic */}
        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="icon"
          onClick={toggleItalic}
          className="h-8 w-8"
          title="Kursiv (Italic)"
        >
          <Italic size={16} />
        </Button>

        <div className="w-[1px] h-6 bg-neutral-300 mx-1" />

        {/* Heading 2 */}
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          size="icon"
          onClick={toggleH2}
          className="h-8 w-8"
          title="Başlıq H2"
        >
          <Heading2 size={16} />
        </Button>

        {/* Heading 3 */}
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
          size="icon"
          onClick={toggleH3}
          className="h-8 w-8"
          title="Başlıq H3"
        >
          <Heading3 size={16} />
        </Button>

        <div className="w-[1px] h-6 bg-neutral-300 mx-1" />

        {/* Blockquote */}
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          size="icon"
          onClick={toggleBlockquote}
          className="h-8 w-8"
          title="Sitat (Blockquote)"
        >
          <Quote size={16} />
        </Button>

        {/* Link */}
        <Button
          type="button"
          variant={editor.isActive("link") ? "secondary" : "ghost"}
          size="icon"
          onClick={setLink}
          className="h-8 w-8"
          title="Keçid əlavə et"
        >
          <LinkIcon size={16} />
        </Button>

        {editor.isActive("link") && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            title="Keçidi sil"
          >
            <Unlink size={16} />
          </Button>
        )}

        <div className="w-[1px] h-6 bg-neutral-300 mx-1" />

        {/* Image Upload */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleImageUploadClick}
          className="h-8 w-8 relative"
          disabled={isUploading}
          title="Şəkil əlavə et"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        </Button>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleImageFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
