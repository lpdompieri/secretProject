import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, CheckCircle, XCircle, Building2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CNPJ_HABILITADO = '54289996000126';

export default function ConsultaCliente() {
    const [cnpj, setCnpj] = useState('');
    const [resultado, setResultado] = useState(null); // null, 'habilitado', 'nao_habilitado', 'invalido'
    const [isLoading, setIsLoading] = useState(false);

    const formatCNPJ = (value) => {
        const numeros = value.replace(/\D/g, '');
        if (numeros.length <= 14) {
            return numeros
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        }
        return value;
    };

    const validarCNPJ = (cnpj) => {
        const numeros = cnpj.replace(/\D/g, '');
        if (numeros.length !== 14) return false;
        
        // Verificação básica - todos iguais
        if (/^(\d)\1{13}$/.test(numeros)) return false;
        
        return true;
    };

    const handleConsultar = async () => {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        
        if (!validarCNPJ(cnpjLimpo)) {
            setResultado('invalido');
            return;
        }

        setIsLoading(true);
        setResultado(null);

        // Simular delay de consulta
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (cnpjLimpo === CNPJ_HABILITADO) {
            setResultado('habilitado');
        } else {
            setResultado('nao_habilitado');
        }

        setIsLoading(false);
    };

    const handleCnpjChange = (e) => {
        setCnpj(formatCNPJ(e.target.value));
        setResultado(null);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Consulta de Cliente</h2>
                <p className="text-slate-500 mt-2">Verifique se o cliente está habilitado para Cartão BNDES</p>
            </div>

            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="w-5 h-5 text-emerald-600" />
                        Digite o CNPJ do cliente para consulta
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cnpj" className="text-slate-700 font-medium">
                            CNPJ
                        </Label>
                        <Input
                            id="cnpj"
                            value={cnpj}
                            onChange={handleCnpjChange}
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                            className="h-12 text-lg font-mono border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                    </div>

                    <Button
                        onClick={handleConsultar}
                        disabled={isLoading || cnpj.replace(/\D/g, '').length < 14}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Consultando...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5 mr-2" />
                                Consultar
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Resultados */}
            <AnimatePresence>
                {resultado && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-xl mx-auto"
                    >
                        {resultado === 'habilitado' && (
                            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-emerald-800 mb-2">
                                            Cliente Habilitado
                                        </h3>
                                        <p className="text-emerald-700">
                                            Este cliente está habilitado para compras com cartão BNDES.
                                        </p>
                                        <div className="mt-4 p-3 bg-white rounded-xl border border-emerald-200">
                                            <p className="text-sm text-slate-600">CNPJ Consultado:</p>
                                            <p className="font-mono font-semibold text-slate-800">{cnpj}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {resultado === 'nao_habilitado' && (
                            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                                            <XCircle className="w-10 h-10 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-amber-800 mb-2">
                                            Cliente Não Habilitado
                                        </h3>
                                        <p className="text-amber-700">
                                            Este cliente ainda não está habilitado para compras com cartão BNDES.
                                        </p>
                                        <div className="mt-4 p-3 bg-white rounded-xl border border-amber-200">
                                            <p className="text-sm text-slate-600">CNPJ Consultado:</p>
                                            <p className="font-mono font-semibold text-slate-800">{cnpj}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {resultado === 'invalido' && (
                            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                                            <XCircle className="w-8 h-8 text-red-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-red-800 mb-2">
                                            CNPJ Inválido
                                        </h3>
                                        <p className="text-red-700 text-sm">
                                            O CNPJ informado não é válido. Verifique e tente novamente.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dica de teste */}
            <div className="max-w-xl mx-auto p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-xs text-emerald-700 text-center">
                    📋 CNPJ habilitado para teste: <span className="font-mono bg-white px-2 py-0.5 rounded">54.289.996/0001-26</span>
                </p>
            </div>
        </div>
    );
}
