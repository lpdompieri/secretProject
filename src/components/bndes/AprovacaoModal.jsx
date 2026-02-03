import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Shield, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CODIGO_VALIDO = "5579";

export default function AprovacaoModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isProcessing 
}) {
    const [codigo, setCodigo] = useState('');
    const [validationState, setValidationState] = useState(null); // null, 'valid', 'invalid'

    const handleCodigoChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setCodigo(value);
        
        if (value.length >= 4) {
            if (value === CODIGO_VALIDO) {
                setValidationState('valid');
            } else {
                setValidationState('invalid');
            }
        } else {
            setValidationState(null);
        }
    };

    const handleClose = () => {
        setCodigo('');
        setValidationState(null);
        onClose();
    };

    const handleConfirm = () => {
        if (validationState === 'valid') {
            onConfirm();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-emerald-600" />
                        </div>
                        Aprovação Comercial
                    </DialogTitle>
                </DialogHeader>

                {isProcessing ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-12 text-center"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                        </div>
                        <p className="text-lg font-semibold text-slate-800">Processando pagamento...</p>
                        <p className="text-sm text-slate-500 mt-2">Aguarde a confirmação</p>
                    </motion.div>
                ) : (
                    <div className="space-y-6 py-4">
                        <p className="text-slate-600 text-sm">
                            Digite o código de aprovação comercial para prosseguir com o pagamento.
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="codigo" className="text-slate-700 font-medium">
                                Código de Aprovação
                            </Label>
                            <Input
                                id="codigo"
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                value={codigo}
                                onChange={handleCodigoChange}
                                placeholder="0000"
                                className={`text-center text-2xl tracking-widest font-mono h-14 ${
                                    validationState === 'valid' 
                                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100' 
                                        : validationState === 'invalid'
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                                            : 'border-slate-200 focus:border-emerald-500'
                                }`}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {validationState === 'valid' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl"
                                >
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    <span className="text-emerald-700 font-medium">
                                        Aprovação Comercial: OK
                                    </span>
                                </motion.div>
                            )}
                            {validationState === 'invalid' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2 p-3 bg-red-50 rounded-xl"
                                >
                                    <XCircle className="w-5 h-5 text-red-600" />
                                    <span className="text-red-700 font-medium">
                                        CÓDIGO INVÁLIDO
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 h-12"
                            >
                                Cancelar Pagamento
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={validationState !== 'valid'}
                                className={`flex-1 h-12 ${
                                    validationState === 'valid'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-slate-300'
                                }`}
                            >
                                Pagar
                            </Button>
                        </div>

                        <p className="text-xs text-slate-400 text-center">
                            Código para teste: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">5579</span>
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
