"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { signIn, signUp } from "@/lib/auth-client";

const schema = (mode: "login" | "register") =>
  z.object({
    name: mode === "register" ? z.string().min(2) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8),
  });

type FormValues = { name?: string; email: string; password: string };

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useTranslations("auth");
  const tt = useTranslations("toast");
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema(mode)) as Resolver<FormValues>,
  });

  async function onSubmit(values: FormValues): Promise<void> {
    if (mode === "login") {
      const { error } = await signIn.email({
        email: values.email,
        password: values.password,
      });
      if (error) {
        toast.error(tt("loginError"));
        return;
      }
      toast.success(tt("loginSuccess"));
    } else {
      const { error } = await signUp.email({
        name: values.name!,
        email: values.email,
        password: values.password,
      });
      if (error) {
        toast.error(error.message || tt("signupError"));
        return;
      }
      toast.success(tt("loginSuccess"));
    }
    router.push(redirect);
    router.refresh();
  }

  async function googleSignIn() {
    await signIn.social({
      provider: "google",
      callbackURL: `/${locale}${redirect}`,
    });
  }

  const [quick, setQuick] = useState<"customer" | "admin" | null>(null);
  const DEMO = {
    customer: { email: "customer@koshary.test", password: "Customer12345" },
    admin: { email: "admin@koshary.test", password: "Admin12345" },
  } as const;

  async function quickLogin(role: "customer" | "admin") {
    setQuick(role);
    const { error } = await signIn.email(DEMO[role]);
    if (error) {
      toast.error(tt("loginError"));
      setQuick(null);
      return;
    }
    toast.success(tt("loginSuccess"));
    router.push(role === "admin" ? "/admin" : redirect);
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {mode === "login" ? t("loginTitle") : t("registerTitle")}
          </CardTitle>
          <CardDescription>
            {mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "login" && (
            <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
              <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
                {t("quickTitle")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={quick !== null}
                  onClick={() => quickLogin("customer")}
                >
                  {quick === "customer" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <User className="size-4" />
                  )}
                  {t("asCustomer")}
                </Button>
                <Button
                  type="button"
                  disabled={quick !== null}
                  onClick={() => quickLogin("admin")}
                >
                  {quick === "admin" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  {t("asAdmin")}
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("name")}</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">{t("name")}</p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">{t("email")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-xs text-destructive">8+</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {mode === "login"
                ? isSubmitting
                  ? t("signingIn")
                  : t("signIn")
                : isSubmitting
                  ? t("signingUp")
                  : t("signUp")}
            </Button>
          </form>

          <div className="relative text-center">
            <span className="relative z-10 bg-card px-3 text-xs text-muted-foreground">
              {t("or")}
            </span>
            <span className="absolute top-1/2 inset-x-0 -z-0 h-px bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={googleSignIn}
          >
            <GoogleIcon />
            {t("google")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? t("noAccount") : t("haveAccount")}{" "}
            <Link
              href={mode === "login" ? "/register" : "/login"}
              className="font-medium text-primary hover:underline"
            >
              {mode === "login" ? t("signUp") : t("signIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
