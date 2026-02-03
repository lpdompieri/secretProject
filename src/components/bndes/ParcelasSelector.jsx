import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function ParcelasSelector({ valorTotal, parcelas, setParcelas }) {
    const JUROS_POR_PARCELA = 5.00;
    
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const calcularJuros = (numParcelas) => numParcelas * JUROS_POR_PARCELA;
    const calcularTotal = (numParcelas) => valorTotal + calcularJuros(numParcelas);
    const calcularValorParcela = (numParcelas) => calcularTotal(numParcelas) / numParcelas;

    const opcoesPopulares = [1, 3, 6, 12, 24, 36];

    return (
        <div className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-br from-emerald-600 to-green-800 rounded-2xl text-white">
                <p className="text-emerald-200 text-sm mb-1">Valor do Pedido</p>
                <p className="text-3xl font-bold">{formatCurrency(valorTotal)}</p>
            </div>

            <div>
                <h3 className="font-semibold text-slate-800 mb-4">Opções populares</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {opcoesPopulares.map((num) => {
                        const jurosTotal = calcularJuros(num);
                        const totalComJuros = calcularTotal(num);
                        const valorParcela = calcularValorParcela(num);
                        const isSelected = parcelas === num;

                        return (
                            <motion.button
                                key={num}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setParcelas(num)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    isSelected 
                                        ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100' 
                                        : 'border-slate-200 bg-white hover:border-emerald-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xl font-bold ${isSelected ? 'text-emerald-600' : 'text-slate-800'}`}>
                                        {num}x
                                    </span>
                                    {isSelected && (
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600">
                                    {formatCurrency(valorParcela)}/mês
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Juros: {formatCurrency(jurosTotal)}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <Label htmlFor="parcelas-custom" className="text-sm text-slate-600">
                    Ou escolha de 1x a 36x:
                </Label>
                <select
                    id="parcelas-custom"
                    value={parcelas}
                    onChange={(e) => setParcelas(parseInt(e.target.value))}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                >
                    {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                            {num}x — Juros por parcela: R$5,00 — Juros total: {formatCurrency(calcularJuros(num))}
                        </option>
                    ))}
                </select>
            </div>

            <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white space-y-4">
                <div className="flex justify-between">
                    <span className="text-slate-400">Valor do pedido</span>
                    <span>{formatCurrency(valorTotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Juros por parcela</span>
                    <span className="text-amber-400">R$ 5,00</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Juros total ({parcelas}x)</span>
                    <span className="text-amber-400">{formatCurrency(calcularJuros(parcelas))}</span>
                </div>
                <div className="border-t border-slate-700 pt-4 flex justify-between">
                    <span className="font-semibold">Total a pagar</span>
                    <span className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(calcularTotal(parcelas))}
                    </span>
                </div>
                <div className="text-center text-slate-400 text-sm">
                    {parcelas}x de {formatCurrency(calcularValorParcela(parcelas))}
                </div>
            </div>
        </div>
    );
}
