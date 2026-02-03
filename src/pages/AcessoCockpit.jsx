import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, User, Lock, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CREDENCIAIS_VALIDAS = {
    usuario: 'paymentcard',
    senha: 'q1w2e3r$'
};

export default function AcessoCockpit() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setIsLoading(true);

        // Simular delay de autenticação
        await new Promise(resolve => setTimeout(resolve, 800));

        if (usuario === CREDENCIAIS_VALIDAS.usuario && senha === CREDENCIAIS_VALIDAS.senha) {
            // Login bem-sucedido
            sessionStorage.setItem('cockpit_authenticated', 'true');
            navigate(createPageUrl('Home'));
        } else {
            setErro('Usuário ou senha inválidos. Verifique suas credenciais.');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo e Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">Plataforma BNDES</h1>
                    <p className="text-sm text-slate-500">Cockpit de Gerenciamento</p>
                </div>

                {/* Card de Acesso */}
                <Card className="shadow-xl border-0">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-center text-lg text-slate-700">
                            Acesse sua conta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="usuario" className="text-slate-700 font-medium flex items-center gap-2">
                                    <User className="w-4 h-4 text-emerald-600" />
                                    Usuário
                                </Label>
                                <Input
                                    id="usuario"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    placeholder="Digite seu usuário"
                                    className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="senha" className="text-slate-700 font-medium flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-emerald-600" />
                                    Senha
                                </Label>
                                <Input
                                    id="senha"
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    placeholder="Digite sua senha"
                                    className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Mensagem de Erro */}
                            <AnimatePresence>
                                {erro && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700"
                                    >
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm">{erro}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                type="submit"
                                disabled={isLoading || !usuario || !senha}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Autenticando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </form>


                    </CardContent>
                </Card>

                {/* Dica de credenciais para teste */}
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-xs text-emerald-700 text-center font-medium mb-2">
                        📋 Credenciais de teste:
                    </p>
                    <div className="text-xs text-emerald-600 text-center space-y-1">
                        <p>Usuário: <span className="font-mono bg-white px-2 py-0.5 rounded">paymentcard</span></p>
                        <p>Senha: <span className="font-mono bg-white px-2 py-0.5 rounded">q1w2e3r$</span></p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
