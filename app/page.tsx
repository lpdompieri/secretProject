import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não possui uma conta?{" "}
          <a
            href="/cadastro"
            className="font-medium text-secondary hover:text-secondary/80 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            Cadastre-se
          </a>
        </p>
      </div>
    </main>
  )
}
