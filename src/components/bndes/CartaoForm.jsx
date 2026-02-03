import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, User, Calendar, Lock, Camera, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import CameraScanCartao from "./CameraScanCartao";

export default function CartaoForm({ dados, setDados }) {
    const [showScanner, setShowScanner] = useState(false);
    const [camposDestaque, setCamposDestaque] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detectar se é mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleDadosCapturados = (dadosCapturados) => {
        setDados({
            ...dados,
            numero: dadosCapturados.numero || dados.numero,
            titular: dadosCapturados.titular || dados.titular,
            validade: dadosCapturados.validade || dados.validade,
            cvv: '' // CVV sempre vazio por segurança
        });
        
        // Destacar campos que não foram lidos
        setCamposDestaque(dadosCapturados.camposNaoLidos);
        
        // Remover destaque após 5 segundos
        setTimeout(() => {
            setCamposDestaque({});
        }, 5000);
    };
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const maskCardNumber = (value) => {
        if (!value) return '';
        const clean = value.replace(/\s/g, '');
        if (clean.length <= 4) return clean;
        const masked = clean.slice(0, -4).replace(/./g, '•') + clean.slice(-4);
        return masked.match(/.{1,4}/g)?.join(' ') || masked;
    };

    const getInputClass = (campo) => {
        const baseClass = "h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500";
        if (camposDestaque[campo]) {
            return `${baseClass} border-amber-400 bg-amber-50 ring-2 ring-amber-200 animate-pulse`;
        }
        return baseClass;
    };

    return (
        <div className="space-y-6">
            {/* Botão de Scan - Apenas Mobile */}
            {isMobile && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="w-full h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-200"
                    >
                        <Camera className="w-5 h-5 mr-3" />
                        <span>Escanear Cartão com Câmera</span>
                        <Smartphone className="w-4 h-4 ml-2 opacity-70" />
                    </Button>
                    <p className="text-xs text-center text-slate-500 mt-2">
                        Tire uma foto do seu cartão para preencher automaticamente
                    </p>
                </motion.div>
            )}

            {isMobile && (
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-500">ou digite manualmente</span>
                    </div>
                </div>
            )}

            {/* Card Preview */}
            <div className="relative h-48 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 p-6 text-white shadow-xl overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-200 text-xs font-medium tracking-wider">CARTÃO</p>
                            <p className="text-xl font-bold tracking-wide">BNDES</p>
                        </div>
                        <div className="w-12 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md" />
                    </div>
                    
                    <div>
                        <p className="text-lg tracking-[0.25em] font-mono">
                            {dados.numero ? maskCardNumber(dados.numero) : '•••• •••• •••• ••••'}
                        </p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-emerald-200 text-[10px] uppercase tracking-wider">Titular</p>
                            <p className="text-sm font-medium uppercase tracking-wide">
                                {dados.titular || 'NOME DO TITULAR'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-emerald-200 text-[10px] uppercase tracking-wider">Validade</p>
                            <p className="text-sm font-medium">{dados.validade || 'MM/AA'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="numero" className="text-slate-700 font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        Número do Cartão
                        {camposDestaque.numero && (
                            <span className="text-xs text-amber-600 font-normal">(preencha manualmente)</span>
                        )}
                    </Label>
                    <Input
                        id="numero"
                        placeholder="0000 0000 0000 0000"
                        value={dados.numero}
                        onChange={(e) => {
                            setDados({...dados, numero: formatCardNumber(e.target.value)});
                            if (camposDestaque.numero) {
                                setCamposDestaque({...camposDestaque, numero: false});
                            }
                        }}
                        maxLength={19}
                        className={`${getInputClass('numero')} text-lg tracking-wider font-mono`}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="titular" className="text-slate-700 font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        Nome do Titular
                        {camposDestaque.titular && (
                            <span className="text-xs text-amber-600 font-normal">(preencha manualmente)</span>
                        )}
                    </Label>
                    <Input
                        id="titular"
                        placeholder="Como está no cartão"
                        value={dados.titular}
                        onChange={(e) => {
                            setDados({...dados, titular: e.target.value.toUpperCase()});
                            if (camposDestaque.titular) {
                                setCamposDestaque({...camposDestaque, titular: false});
                            }
                        }}
                        className={`${getInputClass('titular')} uppercase`}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="validade" className="text-slate-700 font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            Validade
                            {camposDestaque.validade && (
                                <span className="text-xs text-amber-600 font-normal">(preencha)</span>
                            )}
                        </Label>
                        <Input
                            id="validade"
                            placeholder="MM/AA"
                            value={dados.validade}
                            onChange={(e) => {
                                setDados({...dados, validade: formatExpiry(e.target.value)});
                                if (camposDestaque.validade) {
                                    setCamposDestaque({...camposDestaque, validade: false});
                                }
                            }}
                            maxLength={5}
                            className={`${getInputClass('validade')} text-center font-mono`}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-slate-700 font-medium flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-600" />
                            CVV
                            {camposDestaque.cvv && (
                                <span className="text-xs text-amber-600 font-normal">(obrigatório)</span>
                            )}
                        </Label>
                        <Input
                            id="cvv"
                            type="password"
                            placeholder="•••"
                            value={dados.cvv}
                            onChange={(e) => {
                                setDados({...dados, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)});
                                if (camposDestaque.cvv) {
                                    setCamposDestaque({...camposDestaque, cvv: false});
                                }
                            }}
                            maxLength={4}
                            className={`${getInputClass('cvv')} text-center font-mono`}
                        />
                    </div>
                </div>
            </div>

            {/* Scanner Modal */}
            <CameraScanCartao
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onDadosCapturados={handleDadosCapturados}
            />
        </div>
    );
}
