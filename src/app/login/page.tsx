import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  redirect(safeNextPath(typeof params.next === "string" ? params.next : "/"));
}

