"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/login?next=/admin/products");
  return user;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string) {
  const root = base || "product";
  let slug = root;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

function refreshStorefront() {
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

const ProductInput = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  cas: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  price: z.coerce.number().min(0),
  sizeMg: z.coerce.number().int().min(0),
  purity: z.string().trim().min(1),
  description: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
  featured: z.boolean(),
  inStock: z.boolean(),
});

export async function toggleStock(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id },
    select: { inStock: true },
  });
  if (product) {
    await prisma.product.update({
      where: { id },
      data: { inStock: !product.inStock },
    });
  }
  refreshStorefront();
}

export async function toggleFeatured(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id },
    select: { featured: true },
  });
  if (product) {
    await prisma.product.update({
      where: { id },
      data: { featured: !product.featured },
    });
  }
  refreshStorefront();
}

export async function updatePrice(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const price = Number(formData.get("price"));
  if (id && Number.isFinite(price) && price >= 0) {
    await prisma.product.update({
      where: { id },
      data: { priceCents: Math.round(price * 100) },
    });
  }
  refreshStorefront();
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const inUse = await prisma.orderItem.count({ where: { productId: id } });
  if (inUse > 0) {
    redirect(
      `/admin/products?error=${encodeURIComponent(
        "That product appears in past orders, so it can't be deleted. Mark it Out of stock instead.",
      )}`,
    );
  }
  await prisma.product.delete({ where: { id } });
  refreshStorefront();
  redirect(`/admin/products?saved=${encodeURIComponent("Product deleted")}`);
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const parsed = ProductInput.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    cas: formData.get("cas") ?? undefined,
    price: formData.get("price"),
    sizeMg: formData.get("sizeMg"),
    purity: formData.get("purity"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    featured: formData.get("featured") === "on",
    inStock: formData.get("inStock") === "on",
  });

  if (!parsed.success) {
    const target = id
      ? `/admin/products/${id}/edit`
      : "/admin/products/new";
    redirect(
      `${target}?error=${encodeURIComponent(
        "Please fill in all required fields (name, category, price, purity, description).",
      )}`,
    );
  }

  const d = parsed.data;
  const data = {
    name: d.name,
    category: d.category,
    cas: d.cas,
    priceCents: Math.round(d.price * 100),
    sizeMg: d.sizeMg,
    purity: d.purity,
    description: d.description,
    imageUrl: d.imageUrl,
    featured: d.featured,
    inStock: d.inStock,
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    const slug = await uniqueSlug(slugify(d.name));
    await prisma.product.create({ data: { ...data, slug } });
  }

  refreshStorefront();
  redirect(`/admin/products?saved=${encodeURIComponent("Product saved")}`);
}
