import { permanentRedirect } from "next/navigation";

interface Props {
  params: { slug: string };
}

export default function BlogPostPage({ params }: Props) {
  permanentRedirect(`/learn/insights/${params.slug}`);
}
