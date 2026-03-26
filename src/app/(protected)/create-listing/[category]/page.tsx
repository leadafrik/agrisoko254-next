import { notFound } from "next/navigation";
import CreateListingCategoryForm from "@/components/marketplace/CreateListingCategoryForm";
import { normalizeBrowseCategory } from "@/lib/marketplace";

export default function CreateListingCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = normalizeBrowseCategory(params.category);
  if (!category) {
    notFound();
  }

  return <CreateListingCategoryForm category={category} />;
}
