import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

export default function ItemForm({ onAddItem }) {
    const [item, setItem] = useState({
        codigo_produto: '',
        descricao_produto: '',
        valor_produto: '',
        flag_bndes: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!item.codigo_produto || !item.valor_produto || parseFloat(item.valor_produto) <= 0) return;
        
        onAddItem({
            ...item,
            valor_produto: parseFloat(item.valor_produto)
        });
        
        setItem({
            codigo_produto: '',
            descricao_produto: '',
            valor_produto: '',
            flag_bndes: true
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="codigo" className="text-slate-700 font-medium">
                        Código do Produto *
                    </Label>
                    <Input
                        id="codigo"
                        value={item.codigo_produto}
                        onChange={(e) => setItem({...item, codigo_produto: e.target.value})}
                        placeholder="Ex: CNC-1000"
                        className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="valor" className="text-slate-700 font-medium">
                        Valor (R$) *
                    </Label>
                    <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.valor_produto}
                        onChange={(e) => setItem({...item, valor_produto: e.target.value})}
                        placeholder="0,00"
                        className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="descricao" className="text-slate-700 font-medium">
                    Descrição (opcional)
                </Label>
                <Input
                    id="descricao"
                    value={item.descricao_produto}
                    onChange={(e) => setItem({...item, descricao_produto: e.target.value})}
                    placeholder="Descrição do produto"
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.flag_bndes ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <Label htmlFor="flag_bndes" className="text-slate-700 cursor-pointer">
                        Elegível para Cartão BNDES
                    </Label>
                </div>
                <Switch
                    id="flag_bndes"
                    checked={item.flag_bndes}
                    onCheckedChange={(checked) => setItem({...item, flag_bndes: checked})}
                    className="data-[state=checked]:bg-emerald-600"
                />
            </div>
            
            <Button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-all"
                disabled={!item.codigo_produto || !item.valor_produto || parseFloat(item.valor_produto) <= 0}
            >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item ao Pedido
            </Button>
        </form>
    );
}
