import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, setAuthUser } from "../app/auth";
import { routes } from "../app/routes";
import ThemeToggle from "../shared/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username.trim()) {
      setError("Informe o usuario.");
      return;
    }
    if (!password.trim()) {
      setError("Informe a senha.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });
      if (!response.ok) {
        setError("Usuario ou senha invalidos.");
        return;
      }
      const payload = (await response.json()) as { token: string; user?: { name?: string } };
      const name = payload?.user?.name || username.trim();
      setAuthUser(name, remember, payload?.token);
      navigate(routes.dashboard);
    } catch {
      setError("Falha ao conectar no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
          <img src="/favicon.png" alt="Logo" className="h-10 w-10 object-contain" />
        </div>
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="text-center">
          <div className="text-xl font-semibold">Sistema de Gestao</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">Acesse sua conta</div>
        </div>
      </div>

      <form className="space-y-4">
        <div>
          <label className="text-sm">Usuario</label>
          <input
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (error) setError("");
            }}
            className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/30"
            placeholder="Digite seu usuario"
          />
        </div>

        <div>
          <label className="text-sm">Senha</label>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600/30">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent px-1 py-1 outline-none"
              placeholder="Digite sua senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Lembrar login
        </label>

        {error && <div className="text-xs text-red-500">{error}</div>}

        <button
          type="button"
          className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="text-center text-xs text-gray-500 dark:text-slate-400 pt-2">
          Sistema interno - Acesso restrito a equipe
        </div>
      </form>
    </div>
  );
}
