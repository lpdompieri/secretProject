import React from 'react';
import { Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function ItemList({ items, onRemoveItem }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                </div>
                <p>Nenhum item adicionado ao pedido</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence>
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                            item.flag_bndes 
                                ? 'bg-white border-emerald-100 hover:border-emerald-200' 
                                : 'bg-amber-50 border-amber-200 hover:border-amber-300'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {item.flag_bndes ? (
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-slate-800">{item.codigo_produto}</p>
                                    {item.descricao_produto && (
                                        <p className="text-sm text-slate-500">{item.descricao_produto}</p>
                                    )}
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        item.flag_bndes 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {item.flag_bndes ? 'Elegível BNDES' : 'Não elegível BNDES'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-slate-800">
                                    {formatCurrency(item.valor_produto)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemoveItem(index)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
