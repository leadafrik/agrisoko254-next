import { redirect } from "next/navigation";

type Props = {
  params: {
    id: string;
  };
};

export default function B2BRfqDetailRedirect({ params }: Props) {
  redirect(`/bulk/orders/${params.id}`);
}
