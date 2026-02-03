import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import ItemForm from "@/components/bndes/ItemForm";
import ItemList from "@/components/bndes/ItemList";
import HomeButton from "@/components/shared/HomeButton";

export default function Pedido() {
    const [items, setItems] = useState([
        { codigo_produto: "CNC-1000", descricao_produto: "Máquina CNC Industrial", valor_produto: 250000.00, flag_bndes: true }
    ]);

    const handleAddItem = (item) => {
        setItems([...items, item]);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const valorTotal = items.reduce((sum, item) => sum + item.valor_produto, 0);
    const temItemInvalido = items.some(item => item.valor_produto <= 0);
    const canProceed = items.length > 0 && !temItemInvalido;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">B</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Cartão BNDES</h1>
                                <p className="text-sm text-slate-500">Simulador de Pagamento</p>
                            </div>
                        </div>
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Tela de Pedido</h2>
                        <p className="text-slate-600">Adicione os itens do seu pedido</p>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-6">
                        {/* Add Item Form */}
                        <div className="lg:col-span-2">
                            <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle className="text-lg">Adicionar Item</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ItemForm onAddItem={handleAddItem} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Items List */}
                        <div className="lg:col-span-3 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span>Itens do Pedido</span>
                                        <span className="text-sm font-normal text-slate-500">
                                            {items.length} {items.length === 1 ? 'item' : 'itens'}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ItemList items={items} onRemoveItem={handleRemoveItem} />
                                </CardContent>
                            </Card>

                            {/* Summary */}
                            {items.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="text-slate-300">Total do Pedido</span>
                                                <span className="text-3xl font-bold">{formatCurrency(valorTotal)}</span>
                                            </div>

                                            {temItemInvalido && (
                                                <div className="flex items-center gap-2 p-3 bg-amber-500/20 rounded-xl mb-4">
                                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                                    <span className="text-amber-200 text-sm">
                                                        Há itens com valor inválido. Remova-os para continuar.
                                                    </span>
                                                </div>
                                            )}

                                            <Link
                                                to={canProceed ? `${createPageUrl('Validacao')}?items=${encodeURIComponent(JSON.stringify(items))}` : '#'}
                                                onClick={(e) => !canProceed && e.preventDefault()}
                                            >
                                                <Button
                                                    className={`w-full h-14 text-lg font-semibold transition-all ${
                                                        canProceed
                                                            ? 'bg-emerald-600 hover:bg-emerald-500'
                                                            : 'bg-slate-600 cursor-not-allowed'
                                                    }`}
                                                    disabled={!canProceed}
                                                >
                                                    <CreditCard className="w-5 h-5 mr-2" />
                                                    Pagar com Cartão BNDES
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Test Data Info */}
                    <Card className="bg-emerald-50 border-emerald-200">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-emerald-800 mb-3">📋 Dados de Teste</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-white rounded-lg">
                                    <p className="font-medium text-slate-700">Item elegível BNDES:</p>
                                    <code className="text-xs text-slate-600">CNC-1000 - R$ 250.000,00</code>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                    <p className="font-medium text-slate-700">Item NÃO elegível:</p>
                                    <code className="text-xs text-slate-600">FILTRO-200 - R$ 500,00</code>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            {/* Botão Home Fixo */}
            <HomeButton />
        </div>
    );
}
