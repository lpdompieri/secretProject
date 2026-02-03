import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, ArrowLeft, Copy, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ResumoFinal({ transacao, onVoltar, simulouFalha = false }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleGerarRecibo = () => {
        const recibo = {
            ...transacao,
            gerado_em: new Date().toISOString(),
            tipo: "RECIBO_SIMULACAO_BNDES"
        };

        const blob = new Blob([JSON.stringify(recibo, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo_bndes_${transacao.transacao_id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Recibo baixado com sucesso!');
    };

    const handleCopiarId = () => {
        navigator.clipboard.writeText(transacao.transacao_id);
        toast.success('ID copiado!');
    };

    if (simulouFalha) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
            >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Falha no Processamento</h2>
                <p className="text-slate-600 mb-8">Tente novamente.</p>
                <Button onClick={onVoltar} className="bg-emerald-600 hover:bg-emerald-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tentar Novamente
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
        >
            {/* Success Header */}
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"
                >
                    <CheckCircle2 className="w-14 h-14 text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Pagamento Aprovado!</h2>
                <p className="text-slate-600">Transação processada com sucesso</p>
            </div>

            {/* Sandbox Notice */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="text-amber-800 text-sm font-medium">
                    🧪 Esta é uma simulação em ambiente sandbox
                </p>
            </div>

            {/* Transaction Details */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-emerald-600 to-green-800 text-white">
                    <p className="text-emerald-200 text-sm mb-1">ID da Transação</p>
                    <div className="flex items-center gap-2">
                        <code className="text-sm font-mono truncate">{transacao.transacao_id}</code>
                        <button onClick={handleCopiarId} className="text-emerald-200 hover:text-white">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Resumo do Pagamento</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500">Valor do Pedido</p>
                            <p className="font-semibold text-slate-800">
                                {formatCurrency(transacao.valor_total_pedido)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Parcelas</p>
                            <p className="font-semibold text-slate-800">
                                {transacao.quantidade_parcelas}x
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Juros Total</p>
                            <p className="font-semibold text-amber-600">
                                {formatCurrency(transacao.juros_total)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Pago</p>
                            <p className="font-bold text-lg text-emerald-600">
                                {formatCurrency(transacao.valor_total_pagamento)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Dados de Autorização</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500">Autorizador</p>
                            <p className="font-mono text-sm text-slate-800">{transacao.autorizador}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Código de Autorização</p>
                            <p className="font-mono text-sm text-slate-800">{transacao.codigo_autorizacao}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Status</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                {transacao.status.toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Data/Hora</p>
                            <p className="font-mono text-sm text-slate-800">{transacao.timestamp}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="outline"
                    onClick={onVoltar}
                    className="flex-1 h-12"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Pedido
                </Button>
                <Button
                    onClick={handleGerarRecibo}
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Recibo
                </Button>
            </div>
        </motion.div>
    );
}
