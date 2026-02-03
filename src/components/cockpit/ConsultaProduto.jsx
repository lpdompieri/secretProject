import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Package, Search, Loader2, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConsultaProduto() {
    const [codigoProduto, setCodigoProduto] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [erro, setErro] = useState('');

    const handleConsultar = async (e) => {
        e.preventDefault();
        if (!codigoProduto.trim()) return;

        setIsLoading(true);
        setResultado(null);
        setErro('');

        try {
            const response = await fetch(`https://eshfg37ovylo7or35lk3sa5jwy0sutqg.lambda-url.sa-east-1.on.aws/?sku=${encodeURIComponent(codigoProduto.trim())}`);
            const data = await response.json();

            if (data && data.sku) {
                setResultado({
                    sku: data.sku,
                    eligible: data.eligible,
                    ruleVersion: data.ruleVersion
                });
            } else {
                setErro('Produto não encontrado na base de dados.');
            }
        } catch (error) {
            setErro('Erro ao consultar produto. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                    <Package className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Consulta de Produtos</h2>
                <p className="text-slate-500 mt-1">Verifique a elegibilidade do produto para Cartão BNDES</p>
            </div>

            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-lg">Consultar Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleConsultar} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="codigoProduto" className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-purple-600" />
                                Código do Produto (SKU)
                            </Label>
                            <Input
                                id="codigoProduto"
                                value={codigoProduto}
                                onChange={(e) => setCodigoProduto(e.target.value)}
                                placeholder="Ex: PROD-001"
                                className="h-12"
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !codigoProduto.trim()}
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700"
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
                    </form>

                    {/* Resultado */}
                    <AnimatePresence>
                        {resultado && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-6"
                            >
                                <div className={`p-4 rounded-xl ${
                                    resultado.eligible 
                                        ? 'bg-emerald-50 border border-emerald-200' 
                                        : 'bg-amber-50 border border-amber-200'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        {resultado.eligible ? (
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                        ) : (
                                            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <h3 className={`font-semibold ${
                                                resultado.eligible ? 'text-emerald-800' : 'text-amber-800'
                                            }`}>
                                                {resultado.eligible 
                                                    ? 'Produto Elegível!' 
                                                    : 'Produto Não Elegível'}
                                            </h3>
                                            <p className={`text-sm mt-1 ${
                                                resultado.eligible ? 'text-emerald-700' : 'text-amber-700'
                                            }`}>
                                                {resultado.eligible 
                                                    ? 'Este produto está apto para venda com Cartão BNDES.' 
                                                    : 'Este produto não está habilitado para Cartão BNDES.'}
                                            </p>
                                            <div className="mt-3 pt-3 border-t border-current/10 space-y-1">
                                                <p className="text-xs">
                                                    <span className="font-medium">SKU:</span> {resultado.sku}
                                                </p>
                                                <p className="text-xs">
                                                    <span className="font-medium">Versão da Regra:</span> {resultado.ruleVersion}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {erro && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                            >
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="text-sm">{erro}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Info de teste */}
            <Card className="max-w-md mx-auto bg-purple-50 border-purple-200">
                <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div className="text-xs text-purple-700">
                            <p className="font-medium mb-1">Códigos de teste:</p>
                            <p>• SKU elegível: <code className="bg-white px-1 rounded">PROD-001</code></p>
                            <p>• SKU não elegível: <code className="bg-white px-1 rounded">PROD-999</code></p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
