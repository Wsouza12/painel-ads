"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { login, signup, signInWithGoogle } from "./actions";

function SubmitButtons() {
  const { pending, action } = useFormStatus();
  
  // action returns the reference to the server action being executed
  // We can use it to determine which button is loading if we wanted,
  // but for simplicity, we just disable both when any is pending.
  
  return (
    <div className="pt-2 flex gap-3">
      <button
        formAction={login}
        disabled={pending}
        className="flex-1 bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-neutral-200 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {pending ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        ) : (
          "Entrar"
        )}
      </button>
      <button
        formAction={signup}
        disabled={pending}
        className="flex-1 bg-neutral-800 text-white border border-neutral-700 font-bold py-3 px-4 rounded-lg hover:bg-neutral-700 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {pending ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          "Criar Conta"
        )}
      </button>
    </div>
  );
}

import { createBrowserClient } from "@supabase/ssr";

function GoogleButton() {
  const { pending } = useFormStatus();
  const [loading, setLoading] = useState(false);
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };
  
  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={pending || loading}
      className="w-full flex items-center justify-center gap-3 bg-neutral-900 border border-neutral-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-neutral-800 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {(pending || loading) ? "Conectando..." : "Continuar com Google"}
    </button>
  );
}

export default function LoginForm({ searchParams }: { searchParams: { error?: string; message?: string } }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          placeholder="seu@email.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="password">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      {searchParams?.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 text-center">
          {searchParams.error}
        </div>
      )}
      {searchParams?.message && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg p-3 text-center">
          {searchParams.message}
        </div>
      )}

      <SubmitButtons />
      
      <p className="text-xs text-neutral-500 text-center mt-2">
        Ao criar uma conta por e-mail, enviaremos um link de confirmação obrigatório.
      </p>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-neutral-800 flex-1"></div>
        <span className="text-neutral-500 text-sm">ou</span>
        <div className="h-px bg-neutral-800 flex-1"></div>
      </div>

      <GoogleButton />
    </form>
  );
}
