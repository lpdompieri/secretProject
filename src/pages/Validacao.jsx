import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ArrowLeft, CreditCard, ShieldCheck, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import ParcelasSelector from "@/components/bndes/ParcelasSelector";
import AprovacaoModal from "@/components/bndes/AprovacaoModal";
import ResumoFinal from "@/components/bndes/ResumoFinal";
import CartaoForm from "@/components/bndes/CartaoForm";
import HomeButton from "@/components/shared/HomeButton";
import { base44 } from "@/api/base44Client";

export default function Validacao() {
    const [items, setItems] = useState([]);
    const [parcelas, setParcelas] = useState(12);
    const [showAprovacao, setShowAprovacao] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transacaoFinalizada, setTransacaoFinalizada] = useState(null);
    const [simularFalha, setSimularFalha] = useState(false);
    const [mostrarFalha, setMostrarFalha] = useState(false);
    const [dadosCartao, setDadosCartao] = useState({
        numero: '',
        titular: '',
        validade: '',
        cvv: ''
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const itemsParam = urlParams.get('items');
        if (itemsParam) {
            try {
                setItems(JSON.parse(decodeURIComponent(itemsParam)));
            } catch (e) {
                console.error('Erro ao parsear items:', e);
            }
        }
    }, []);

    const JUROS_POR_PARCELA = 5.00;
    const temItemNaoElegivel = items.some(item => !item.flag_bndes);
    const valorTotal = items.reduce((sum, item) => sum + item.valor_produto, 0);
    const jurosTotal = parcelas * JUROS_POR_PARCELA;
    const valorTotalPagamento = valorTotal + jurosTotal;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const gerarUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleIniciarPagamento = () => {
        setShowAprovacao(true);
    };

    const handleConfirmarPagamento = async () => {
        setIsProcessing(true);

        // Simular processamento de 2 segundos
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (simularFalha) {
            setIsProcessing(false);
            setShowAprovacao(false);
            setMostrarFalha(true);
            return;
        }

        const transacao = {
            transacao_id: gerarUUID(),
            pedido_id: gerarUUID(),
            valor_total_pedido: valorTotal,
            quantidade_parcelas: parcelas,
            juros_total: jurosTotal,
            valor_total_pagamento: valorTotalPagamento,
            status: "aprovado",
            autorizador: "BNDES-SIMULADO",
            codigo_autorizacao: `APPROVED-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            timestamp: new Date().toISOString()
        };

        // Salvar transação no banco (opcional)
        try {
            await base44.entities.TransacaoBNDES.create(transacao);
        } catch (e) {
            console.log('Transação salva em simulação');
        }

        setIsProcessing(false);
        setShowAprovacao(false);
        setTransacaoFinalizada(transacao);
    };

    const handleVoltar = () => {
        setTransacaoFinalizada(null);
        setMostrarFalha(false);
    };

    // Tela de finalização
    if (transacaoFinalizada || mostrarFalha) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
                <header className="bg-white border-b border-slate-200">
                    <div className="max-w-2xl mx-auto px-4 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">B</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Cartão BNDES</h1>
                                <p className="text-sm text-slate-500">Finalização</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-2xl mx-auto px-4 py-8">
                    <ResumoFinal 
                        transacao={transacaoFinalizada} 
                        onVoltar={handleVoltar}
                        simulouFalha={mostrarFalha}
                    />
                </main>
            </div>
        );
    }

    // Tela de bloqueio por item não elegível
    if (temItemNaoElegivel) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
                <header className="bg-white border-b border-slate-200">
                    <div className="max-w-2xl mx-auto px-4 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">B</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Cartão BNDES</h1>
                                <p className="text-sm text-slate-500">Validação de Pedido</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-2xl mx-auto px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Card className="border-2 border-amber-300 bg-amber-50">
                            <CardContent className="pt-8 pb-8 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                                    <AlertTriangle className="w-10 h-10 text-amber-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-amber-800 mb-4">
                                    Pedido Contém Itens Não Elegíveis
                                </h2>
                                <p className="text-amber-700 max-w-md mx-auto mb-6">
                                    Este pedido contém itens que <strong>não podem ser pagos com cartão BNDES</strong>. 
                                    Favor trocá-los para seguir com a venda.
                                </p>

                                <div className="bg-white rounded-xl p-4 mb-6">
                                    <h3 className="font-semibold text-slate-700 mb-3">Itens não elegíveis:</h3>
                                    <div className="space-y-2">
                                        {items.filter(item => !item.flag_bndes).map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                                    <span className="font-medium text-slate-800">{item.codigo_produto}</span>
                                                </div>
                                                <span className="text-slate-600">{formatCurrency(item.valor_produto)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Link to={createPageUrl('Pedido')}>
                                    <Button className="bg-amber-600 hover:bg-amber-700">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Voltar e Editar Pedido
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                </main>
            </div>
        );
    }

    const isCartaoValido = dadosCartao.numero.replace(/\s/g, '').length >= 16 && 
                            dadosCartao.titular.length >= 3 &&
                            dadosCartao.validade.length === 5 &&
                            dadosCartao.cvv.length >= 3;

    // Tela normal de checkout
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">B</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Cartão BNDES</h1>
                                <p className="text-sm text-slate-500">Checkout Seguro</p>
                            </div>
                        </div>
                        <Link to={createPageUrl('Pedido')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-emerald-700 mb-6">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-sm font-medium">Pagamento seguro com criptografia</span>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column - Card Form */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-emerald-600" />
                                        Dados do Cartão BNDES
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CartaoForm 
                                        dados={dadosCartao}
                                        setDados={setDadosCartao}
                                    />
                                </CardContent>
                            </Card>

                            {/* Simulate Failure Option */}
                            <Card className="border-dashed">
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox 
                                            id="simular-falha" 
                                            checked={simularFalha}
                                            onCheckedChange={setSimularFalha}
                                        />
                                        <Label 
                                            htmlFor="simular-falha" 
                                            className="text-sm text-slate-600 cursor-pointer"
                                        >
                                            🧪 Simular falha de processamento (modo de teste)
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Order Summary & Parcelas */}
                        <div className="space-y-6">
                            {/* Items Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-slate-800">{item.codigo_produto}</p>
                                                    {item.descricao_produto && (
                                                        <p className="text-sm text-slate-500">{item.descricao_produto}</p>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-slate-800">
                                                    {formatCurrency(item.valor_produto)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Parcelas Selector */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-emerald-600" />
                                        Parcelamento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ParcelasSelector 
                                        valorTotal={valorTotal}
                                        parcelas={parcelas}
                                        setParcelas={setParcelas}
                                    />
                                </CardContent>
                            </Card>

                            {/* Pay Button */}
                            <Button
                                onClick={handleIniciarPagamento}
                                disabled={!isCartaoValido}
                                className={`w-full h-14 text-lg font-semibold shadow-lg transition-all ${
                                    isCartaoValido 
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 shadow-emerald-200'
                                        : 'bg-slate-300 cursor-not-allowed shadow-none'
                                }`}
                            >
                                <CreditCard className="w-5 h-5 mr-2" />
                                {isCartaoValido ? 'Iniciar Pagamento' : 'Preencha os dados do cartão'}
                            </Button>

                            {/* Test Info */}
                            <p className="text-xs text-center text-slate-400">
                                Código de aprovação para teste: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">5579</span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Aprovação Modal */}
            <AprovacaoModal
                isOpen={showAprovacao}
                onClose={() => setShowAprovacao(false)}
                onConfirm={handleConfirmarPagamento}
                isProcessing={isProcessing}
            />

            {/* Botão Home Fixo */}
            <HomeButton />
        </div>
    );
}
