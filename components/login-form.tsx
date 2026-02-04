"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Constante para URL da API - ajuste conforme seu backend
const API_URL = "/api/login"

// Credenciais mockadas para teste enquanto o backend não está pronto
const MOCK_CREDENTIALS = {
  email: "lpdompieri@gmail.com",
  password: "q1w2e3r$",
  user: {
    name: "Lucas Dompieri",
    email: "lpdompieri@gmail.com",
  },
}

interface LoginCredentials {
  email: string
  password: string
}

// Validação básica de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleLogin(credentials: LoginCredentials) {
    // Validação de email
    if (!isValidEmail(credentials.email)) {
      throw new Error("Por favor, insira um e-mail válido")
    }

    if (!credentials.password || credentials.password.length < 4) {
      throw new Error("A senha deve ter pelo menos 4 caracteres")
    }

    // TODO: Descomentar quando o backend estiver pronto
    /*
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erro ao fazer login")
    }

    const data = await response.json()
    return data
    */

    // Simulação de delay da API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock: Verificar credenciais de teste
    if (
      credentials.email === MOCK_CREDENTIALS.email &&
      credentials.password === MOCK_CREDENTIALS.password
    ) {
      return {
        user: MOCK_CREDENTIALS.user,
        token: "mock_jwt_token_123", // Simulação de token JWT
      }
    }

    throw new Error("E-mail ou senha inválidos")
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const credentials: LoginCredentials = {
      email: email.trim().toLowerCase(),
      password,
    }

    try {
      const data = await handleLogin(credentials)
      
      // Login bem-sucedido
      login(data.user, data.token)
      setSuccess("Login realizado com sucesso! Redirecionando...")
      
      // Redirecionar para o dashboard após breve delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro inesperado"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-0">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-bold text-primary">BNDES</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold text-foreground">
          Bem-vindo de volta
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Acesse sua conta do Cartão BNDES
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-describedby={error ? "login-error" : undefined}
              disabled={isLoading || !!success}
              className="h-11 bg-background border-input focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-describedby={error ? "login-error" : undefined}
                disabled={isLoading || !!success}
                className="h-11 pr-10 bg-background border-input focus:border-primary focus:ring-primary"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                disabled={isLoading || !!success}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <a
              href="/esqueci-senha"
              className="text-sm font-medium text-secondary hover:text-secondary/80 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              Esqueci minha senha
            </a>
          </div>

          {error && (
            <div
              id="login-error"
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-lg"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{success}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors"
            disabled={isLoading || !!success}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Entrando...</span>
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
