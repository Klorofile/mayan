"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginResponse } from "@mayan/shared";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { persistSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@mayan.local", password: "password123" }
  });

  const mutation = useMutation({
    mutationFn: async (payload: LoginForm) => {
      const { data } = await api.post<LoginResponse>("/auth/login", payload);
      return data;
    },
    onSuccess: (session) => {
      persistSession(session);
      router.push("/dashboard");
    }
  });

  const errorMessage =
    mutation.error instanceof AxiosError ? mutation.error.response?.data?.message ?? mutation.error.message : undefined;

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_35%),linear-gradient(135deg,_#f8fafc,_#eef2ff)] lg:grid-cols-2">
      <section className="hidden items-center justify-center p-12 lg:flex">
        <div className="max-w-lg">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-primary">MAYAN</p>
          <h1 className="text-5xl font-bold tracking-tight">HR operations, cleanly orchestrated.</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Kelola employee lifecycle, attendance, leave, payroll, dan permission dalam satu platform enterprise-ready.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login to MAYAN</CardTitle>
            <CardDescription>Use your company account to access HRIS workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>
              {errorMessage && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
              <Button className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
