"use client";

import type { SerializedEditorState } from "lexical";
import { ArrowLeft, ArrowUpRight, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { deleteProductAction, saveProductAction, type ProductActionResult } from "@/app/(frontend)/admin/(portal)/cms/products/actions";
import { discardUploadedImageAction } from "@/app/(frontend)/admin/media-actions";
import { ImageField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AdminMediaItem } from "@/lib/admin-media";
import { emptyDescription, type AdminProduct } from "@/lib/admin-products";

const slugify = (value: string) => value.normalize("NFKD").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type Draft = Omit<AdminProduct, "updatedAt">;

export function ProductEditor({ blobUploadsEnabled, product }: { blobUploadsEnabled: boolean; product: AdminProduct | null }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => product ? { ...product } : {
    brand: "", category: "", description: emptyDescription, id: 0, image: null, name: "", price: 0, purchaseLink: "", slug: "", staffPick: false, type: "product",
  });
  const [savedDraft, setSavedDraft] = useState(() => JSON.stringify(draft));
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const [pendingUploadID, setPendingUploadID] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<ProductActionResult>({});
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(draft) !== savedDraft;

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    const captureLinks = (event: MouseEvent) => {
      if (!dirty || event.defaultPrevented || event.button !== 0) return;
      const link = (event.target as Element | null)?.closest("a");
      if (link && link.href.startsWith(window.location.origin) && !window.confirm("Discard unsaved changes?")) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", captureLinks, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", captureLinks, true);
    };
  }, [dirty]);

  const fieldError = (field: string) => result.errors?.[field]?.[0];

  function setField<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setResult({});
  }

  function changeImage(image: AdminMediaItem | null) {
    const orphanID = pendingUploadID && pendingUploadID !== image?.id ? pendingUploadID : null;
    setPendingUploadID(image && image.id !== product?.image?.id ? image.id : null);
    setField("image", image);
    if (orphanID) void discardUploadedImageAction(orphanID);
  }

  function save() {
    startTransition(async () => {
      const response = await saveProductAction({ ...draft, id: draft.id || null, imageID: draft.image?.id ?? null });
      setResult(response);
      if (response.product) {
        const next = { ...draft, id: response.product.id, slug: response.product.slug };
        setDraft(next);
        setSavedDraft(JSON.stringify(next));
        setPendingUploadID(null);
        router.push("/admin/cms/products");
        router.refresh();
      }
    });
  }

  function cancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    startTransition(async () => {
      if (pendingUploadID) await discardUploadedImageAction(pendingUploadID);
      router.push("/admin/cms/products");
    });
  }

  function remove() {
    if (!draft.id) return;
    setDeleting(true);
    startTransition(async () => {
      const response = await deleteProductAction(draft.id);
      if (response.error) {
        setResult(response);
        setDeleting(false);
      } else router.replace("/admin/cms/products");
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button asChild className="-ml-3 mb-7 text-muted-foreground hover:bg-transparent hover:text-foreground" variant="ghost"><Link href="/admin/cms/products"><ArrowLeft />Products</Link></Button>
          <h1 className="text-3xl font-normal">{product ? product.name : "New item"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{product ? "Edit product details and publishing content." : "Create a product or subscription."}</p>
        </div>
        {draft.slug ? <Button asChild size="sm" variant="outline"><Link href={`/products/${draft.slug}`} target="_blank">Preview<ArrowUpRight /></Link></Button> : null}
      </div>

      {result.error ? <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">{result.error}</div> : null}

      <form className="mt-10 space-y-8" onSubmit={(event) => { event.preventDefault(); save(); }}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input aria-invalid={Boolean(fieldError("name"))} id="name" maxLength={160} onChange={(event) => {
              const name = event.target.value;
              setDraft((current) => ({ ...current, name, slug: slugEdited ? current.slug : slugify(name) }));
            }} required value={draft.name} />
            {fieldError("name") ? <p className="text-sm text-destructive">{fieldError("name")}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select onValueChange={(value: "product" | "subscription") => setField("type", value)} value={draft.type}>
              <SelectTrigger className="w-full" id="type"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="product">Product</SelectItem><SelectItem value="subscription">Subscription</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input aria-invalid={Boolean(fieldError("price"))} id="price" min="0" onChange={(event) => setField("price", Number(event.target.value))} required step="0.01" type="number" value={draft.price} />
            {fieldError("price") ? <p className="text-sm text-destructive">{fieldError("price")}</p> : null}
          </div>
          <div className="space-y-2"><Label htmlFor="brand">Brand</Label><Input id="brand" maxLength={120} onChange={(event) => setField("brand", event.target.value)} required value={draft.brand} />{fieldError("brand") ? <p className="text-sm text-destructive">{fieldError("brand")}</p> : null}</div>
          <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" maxLength={120} onChange={(event) => setField("category", event.target.value)} required value={draft.category} />{fieldError("category") ? <p className="text-sm text-destructive">{fieldError("category")}</p> : null}</div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="purchaseLink">Purchase link</Label><Input id="purchaseLink" maxLength={2048} onChange={(event) => setField("purchaseLink", event.target.value)} required type="url" value={draft.purchaseLink} />{fieldError("purchaseLink") ? <p className="text-sm text-destructive">{fieldError("purchaseLink")}</p> : null}</div>
        </div>

        <div className="space-y-3">
          <Label>Image</Label>
          <ImageField alt={draft.name} blobUploadsEnabled={blobUploadsEnabled} busy={pending} image={draft.image} onChange={changeImage} />
        </div>

        <div className="space-y-2"><Label>About / description</Label><RichTextEditor onChange={(value) => setField("description", value as Draft["description"])} value={draft.description as SerializedEditorState} />{fieldError("description") ? <p className="text-sm text-destructive">{fieldError("description")}</p> : null}</div>

        <div className="flex items-center justify-between rounded-xl border p-4"><div><Label htmlFor="staffPick">Staff pick</Label><p className="mt-1 text-sm text-muted-foreground">Highlight this item in the catalogue.</p></div><Switch checked={draft.staffPick} id="staffPick" onCheckedChange={(checked) => setField("staffPick", checked)} /></div>

        <details className="rounded-xl border p-4"><summary className="cursor-pointer text-sm font-medium">Advanced</summary><div className="mt-4 space-y-2"><Label htmlFor="slug">Slug</Label><Input id="slug" maxLength={160} onChange={(event) => { setSlugEdited(true); setField("slug", slugify(event.target.value)); }} required value={draft.slug} />{fieldError("slug") ? <p className="text-sm text-destructive">{fieldError("slug")}</p> : null}</div></details>

        <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background/90 py-4 backdrop-blur-md">
          <div>{product ? <AlertDialog><AlertDialogTrigger asChild><Button disabled={pending} type="button" variant="ghost">{deleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />}{deleting ? "Deleting…" : "Delete"}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {draft.name}?</AlertDialogTitle><AlertDialogDescription>This permanently removes the item and its image from the public catalogue.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={remove}>Delete item</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog> : null}</div>
          <div className="flex items-center gap-2"><span aria-live="polite" className="text-sm text-muted-foreground">{result.success}</span><Button disabled={pending} onClick={cancel} type="button" variant="ghost">Cancel</Button><Button disabled={!dirty || pending} type="submit">{pending && !deleting ? <LoaderCircle className="animate-spin" /> : null}{pending && !deleting ? "Saving…" : "Save"}</Button></div>
        </div>
      </form>
    </div>
  );
}
