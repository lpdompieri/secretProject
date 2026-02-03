import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Receipt, XCircle, AlertTriangle, Loader2, FileSearch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PEDIDO_VALIDO = '112233';
const PEDIDO_BLOQUEADO = '445566';

export default function ConsultaPedido() {
    const navigate = useNavigate();
    const [numeroPedido, setNumeroPedido] = useState('');
    const [resultado, setResultado] = useState(null); // null, 'bloqueado', 'nao_encontrado'
    const [isLoading, setIsLoading] = useState(false);

    const handleConsultar = async () => {
        if (!numeroPedido.trim()) return;

        setIsLoading(true);
        setResultado(null);

        // Simular delay de consulta
        await new Promise(resolve => setTimeout(resolve, 800));

        if (numeroPedido === PEDIDO_VALIDO) {
            // Pedido válido - redirecionar para validação
            const itemSimulado = [{
                codigo_produto: 'EQUIP-BNDES-001',
                descricao_produto: 'Equipamento Industrial - Linha BNDES',
                valor_produto: 10000,
                flag_bndes: true
            }];
            
            navigate(`${createPageUrl('Validacao')}?items=${encodeURIComponent(JSON.stringify(itemSimulado))}&pedido=${numeroPedido}`);
        } else if (numeroPedido === PEDIDO_BLOQUEADO) {
            setResultado('bloqueado');
        } else {
            setResultado('nao_encontrado');
        }

        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Receipt className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Consulta de Pedido</h2>
                <p className="text-slate-500 mt-2">Consulte o pedido para pagamento com Cartão BNDES</p>
            </div>

            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileSearch className="w-5 h-5 text-emerald-600" />
                        Consulte o pedido para pagamento
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pedido" className="text-slate-700 font-medium">
                            Número do Pedido
                        </Label>
                        <Input
                            id="pedido"
                            value={numeroPedido}
                            onChange={(e) => {
                                setNumeroPedido(e.target.value);
                                setResultado(null);
                            }}
                            placeholder="Digite o número do pedido"
                            className="h-12 text-lg font-mono border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleConsultar()}
                        />
                    </div>

                    <Button
                        onClick={handleConsultar}
                        disabled={isLoading || !numeroPedido.trim()}
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
                                Consultar Pedido
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
                        {resultado === 'bloqueado' && (
                            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                                            <AlertTriangle className="w-10 h-10 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-amber-800 mb-2">
                                            Pedido Bloqueado
                                        </h3>
                                        <p className="text-amber-700">
                                            Este pedido não pode ser pago com cartão BNDES pois contém itens não aceitos.
                                        </p>
                                        <div className="mt-4 p-3 bg-white rounded-xl border border-amber-200">
                                            <p className="text-sm text-slate-600">Pedido Consultado:</p>
                                            <p className="font-mono font-semibold text-slate-800">#{numeroPedido}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {resultado === 'nao_encontrado' && (
                            <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                            <XCircle className="w-10 h-10 text-slate-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                                            Pedido Não Encontrado
                                        </h3>
                                        <p className="text-slate-600">
                                            Pedido não encontrado para pagamento. Verifique o número e tente novamente.
                                        </p>
                                        <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200">
                                            <p className="text-sm text-slate-600">Pedido Consultado:</p>
                                            <p className="font-mono font-semibold text-slate-800">#{numeroPedido}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dica de teste */}
            <div className="max-w-xl mx-auto p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-xs text-emerald-700 text-center mb-2">📋 Pedidos de teste:</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center text-xs text-emerald-600">
                    <span className="bg-white px-3 py-1 rounded">
                        <span className="font-mono font-semibold">112233</span> → Pedido válido (R$ 10.000)
                    </span>
                    <span className="bg-white px-3 py-1 rounded">
                        <span className="font-mono font-semibold">445566</span> → Pedido bloqueado
                    </span>
                </div>
            </div>
        </div>
    );
}
