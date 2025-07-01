"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequest, loginRequestSchema } from "@/app/_types/LoginRequest";
import { UserProfile, userProfileSchema } from "../_types/UserProfile";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { faSpinner, faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import NextLink from "next/link";
import { ApiResponse } from "../_types/ApiResponse";
import { decodeJwt } from "jose";
import { mutate } from "swr";
import { useRouter } from "next/navigation";
import { AUTH } from "@/config/auth";

const Page: React.FC = () => {
  const c_Email = "email";
  const c_Password = "password";

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoginCompleted, setIsLoginCompleted] = useState(false);

  const formMethods = useForm<LoginRequest>({
    mode: "onChange",
    resolver: zodResolver(loginRequestSchema),
  });
  const {
    formState: { errors: fieldErrors },
    setError,
    clearErrors,
    watch,
    handleSubmit,
    setValue,
  } = formMethods;

  const setRootError = (errorMsg: string) => {
    setError("root", { type: "manual", message: errorMsg });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get(c_Email);
    setValue(c_Email, email || "");
  }, [setValue]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === c_Email || name === c_Password) {
        clearErrors("root");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, clearErrors]);

  useEffect(() => {
    if (isLoginCompleted) {
      router.replace("/");
      router.refresh();
    }
  }, [isLoginCompleted, router]);

  // --- ▼▼▼ 修正箇所 ▼▼▼ ---
  const onSubmit: SubmitHandler<LoginRequest> = async (formValues) => {
    setIsPending(true);
    setRootError(""); // 古いエラーをクリア

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      // ステータスコードに関わらず、レスポンスボディをJSONとして解析
      const result: ApiResponse<any> = await response.json();

      // レスポンスがNG、またはボディのsuccessフラグがfalseの場合
      if (!response.ok || !result.success) {
        // APIから返されたエラーメッセージをフォームのエラーとして設定
        setRootError(result.message || "ログインに失敗しました。");
        return; // 処理を中断
      }

      // --- ログイン成功時の処理 (元のロジックを維持) ---
      if (AUTH.isSession) {
        setUserProfile(userProfileSchema.parse(result.payload));
      } else {
        const jwt = result.payload as string;
        localStorage.setItem("jwt", jwt);
        setUserProfile(userProfileSchema.parse(decodeJwt(jwt)));
      }
      // SWRのキャッシュを更新して、他のコンポーネントの認証状態を更新
      mutate("/api/auth", result, false);
      setIsLoginCompleted(true);

    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : "予期せぬエラーが発生しました。";
      setRootError(errorMsg);
    } finally {
      // 成功・失敗に関わらず、ローディング状態を解除
      setIsPending(false);
    }
  };
  // --- ▲▲▲ 修正箇所 ▲▲▲ ---

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faRightToBracket} className="mr-1.5" />
        Login
      </div>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className={twMerge(
          "mt-4 flex flex-col gap-y-4",
          isLoginCompleted && "cursor-not-allowed opacity-50",
        )}
      >
        <div>
          <label htmlFor={c_Email} className="mb-2 block font-bold">
            メールアドレス（ログインID）
          </label>
          <TextInputField
            {...formMethods.register(c_Email)}
            id={c_Email}
            placeholder="name@example.com"
            type="email"
            disabled={isPending || isLoginCompleted}
            error={!!fieldErrors.email}
            autoComplete="email"
          />
          <ErrorMsgField msg={fieldErrors.email?.message} />
        </div>

        <div>
          <label htmlFor={c_Password} className="mb-2 block font-bold">
            パスワード
          </label>
          <TextInputField
            {...formMethods.register(c_Password)}
            id={c_Password}
            placeholder="*****"
            type="password"
            disabled={isPending || isLoginCompleted}
            error={!!fieldErrors.password}
            autoComplete="current-password"
          />
          <ErrorMsgField msg={fieldErrors.password?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className={twMerge("tracking-widest")}
          isBusy={isPending}
          disabled={
            !formMethods.formState.isValid || isPending || isLoginCompleted
          }
        >
          ログイン
        </Button>
      </form>

      {isLoginCompleted && (
        <div>
          <div className="mt-4 flex items-center gap-x-2">
            <FontAwesomeIcon icon={faSpinner} spin />
            <div>ようこそ、{userProfile?.name} さん。</div>
          </div>
          <NextLink href="/" className="text-blue-500 hover:underline">
            自動的に画面が切り替わらないときはこちらをクリックしてください。
          </NextLink>
        </div>
      )}
    </main>
  );
};

export default Page;
