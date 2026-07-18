import LoginForm from "./login-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-purple-500/30">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-purple-600/10 blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-4">
              P
            </div>
            <h1 className="text-2xl font-bold mb-2">Bem-vindo ao PainelAds</h1>
            <p className="text-neutral-400 text-sm">
              Faça login para gerenciar seu catálogo
            </p>
          </div>

          <LoginForm searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
