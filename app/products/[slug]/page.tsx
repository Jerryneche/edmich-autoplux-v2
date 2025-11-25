// app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailsClient from "./ProductDetailsClient";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slugOrId: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: slugOrId },
        { id: slugOrId }, // fallback to ID
      ],
    },
    include: {
      supplier: {
        select: {
          id: true,
          businessName: true,
          city: true,
          state: true,
          verified: true,
          userId: true,
        },
      },
    },
  });

  return product;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Fix the type issue: make slug always a string
  const safeProduct = {
    ...product,
    slug: product.slug ?? product.id, // use ID as fallback slug
    image: product.image ?? "/placeholder.jpg",
  };

  return (
    <>
      <Header />
      <ProductDetailsClient product={safeProduct} />
      <Footer />
    </>
  );
}
