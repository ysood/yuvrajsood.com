import { ProductEditor } from "@/components/admin/product-editor";

export default function NewProductPage() {
  return <ProductEditor blobUploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} product={null} />;
}
