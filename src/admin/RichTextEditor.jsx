import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import { TableKit } from "@tiptap/extension-table";
import { supabase } from "../lib/supabaseClient";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function ToolbarButton({ onClick, active, disabled, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
        active ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageResize.configure({ minWidth: 50 }),
      TableKit.configure({
        table: { resizable: true },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[140px] px-4 py-3 focus:outline-none",
      },
    },
  });

  const handleInsertImageClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploadError(null);

    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("La imagen supera el tamaño máximo de 5MB.");
      return;
    }

    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      editor.chain().focus().setImage({ src: data.publicUrl }).run();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-slate-700 bg-slate-900/40">
        <ToolbarButton
          label="Negrita"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          label="Cursiva"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          label="Título grande"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Título pequeño"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          label="Lista con viñetas"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Lista
        </ToolbarButton>
        <ToolbarButton
          label="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Lista
        </ToolbarButton>
        <ToolbarButton label="Insertar imagen" disabled={uploading} onClick={handleInsertImageClick}>
          {uploading ? "Subiendo..." : "🖼 Imagen"}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />
        <ToolbarButton
          label="Insertar tabla"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: false }).run()
          }
        >
          ▦ Tabla
        </ToolbarButton>
        {editor.isActive("table") && (
          <>
            <ToolbarButton label="Agregar columna" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              + Col
            </ToolbarButton>
            <ToolbarButton label="Quitar columna" onClick={() => editor.chain().focus().deleteColumn().run()}>
              − Col
            </ToolbarButton>
            <ToolbarButton label="Agregar fila" onClick={() => editor.chain().focus().addRowAfter().run()}>
              + Fila
            </ToolbarButton>
            <ToolbarButton label="Quitar fila" onClick={() => editor.chain().focus().deleteRow().run()}>
              − Fila
            </ToolbarButton>
            <ToolbarButton label="Eliminar tabla" onClick={() => editor.chain().focus().deleteTable().run()}>
              ✕ Tabla
            </ToolbarButton>
          </>
        )}
      </div>
      {uploadError && <p className="px-3 pt-2 text-xs text-red-400">{uploadError}</p>}
      <EditorContent editor={editor} />
    </div>
  );
}
