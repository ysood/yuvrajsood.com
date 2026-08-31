"use client";

import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { ListItemNode, ListNode, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND, type SerializedEditorState } from "lexical";
import { Bold, Italic, Link as LinkIcon, List } from "lucide-react";

import { Button } from "@/components/ui/button";

function Toolbar() {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="flex gap-1 border-b p-2" role="toolbar" aria-label="Text formatting">
      <Button aria-label="Bold" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")} size="icon-sm" type="button" variant="ghost"><Bold /></Button>
      <Button aria-label="Italic" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")} size="icon-sm" type="button" variant="ghost"><Italic /></Button>
      <Button aria-label="Bulleted list" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} size="icon-sm" type="button" variant="ghost"><List /></Button>
      <Button
        aria-label="Add link"
        onClick={() => {
          const url = window.prompt("Enter an https URL");
          if (!url) return;
          try {
            const parsed = new URL(url);
            if (!["http:", "https:"].includes(parsed.protocol)) return;
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, parsed.toString());
          } catch {
            return;
          }
        }}
        size="icon-sm"
        type="button"
        variant="ghost"
      ><LinkIcon /></Button>
    </div>
  );
}

export function RichTextEditor({ onChange, value }: { onChange: (value: SerializedEditorState) => void; value: SerializedEditorState }) {
  return (
    <LexicalComposer
      initialConfig={{
        editorState: JSON.stringify(value),
        namespace: "admin-product-description",
        nodes: [LinkNode, ListNode, ListItemNode],
        onError: (error) => { throw error; },
        theme: { link: "underline underline-offset-2", list: { ul: "ml-6 list-disc" }, paragraph: "mb-3" },
      }}
    >
      <div className="overflow-hidden rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable aria-label="About or description" className="min-h-44 px-3 py-3 text-sm outline-none" />}
          ErrorBoundary={({ children }) => children}
          placeholder={<div className="pointer-events-none absolute px-3 py-3 text-sm text-muted-foreground">Describe this item…</div>}
        />
        <HistoryPlugin />
        <LinkPlugin />
        <ListPlugin />
        <OnChangePlugin onChange={(editorState) => onChange(editorState.toJSON())} />
      </div>
    </LexicalComposer>
  );
}
