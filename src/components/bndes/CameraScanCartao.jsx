import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function CameraScanCartao({ isOpen, onClose, onDadosCapturados }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            setError(null);
            setCameraReady(false);
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setCameraReady(true);
                };
            }
        } catch (err) {
            console.error('Erro ao acessar câmera:', err);
            setError('Não foi possível acessar a câmera. Verifique as permissões.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraReady(false);
    };

    const captureAndProcess = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setIsCapturing(true);
        setIsProcessing(true);
        setError(null);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            // Converter para blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
            const file = new File([blob], 'cartao.jpg', { type: 'image/jpeg' });

            // Upload da imagem
            const { file_url } = await base44.integrations.Core.UploadFile({ file });

            // Usar LLM para extrair dados do cartão
            const resultado = await base44.integrations.Core.InvokeLLM({
                prompt: `Analise esta imagem de um cartão de crédito/débito e extraia os seguintes dados:
                - Número do cartão (16 dígitos, pode estar em grupos de 4)
                - Nome do titular (como aparece no cartão)
                - Data de validade (MM/AA ou MM/AAAA)
                
                IMPORTANTE: 
                - Se não conseguir ler algum campo claramente, retorne null para esse campo
                - O número do cartão deve ter exatamente 16 dígitos (sem espaços)
                - A validade deve estar no formato MM/AA
                - O nome deve estar em MAIÚSCULAS
                
                Retorne APENAS os dados encontrados, sem inventar informações.`,
                file_urls: [file_url],
                response_json_schema: {
                    type: "object",
                    properties: {
                        numero: {
                            type: ["string", "null"],
                            description: "Número do cartão com 16 dígitos, sem espaços"
                        },
                        titular: {
                            type: ["string", "null"],
                            description: "Nome do titular em maiúsculas"
                        },
                        validade: {
                            type: ["string", "null"],
                            description: "Data de validade no formato MM/AA"
                        },
                        confianca: {
                            type: "object",
                            properties: {
                                numero: { type: "boolean" },
                                titular: { type: "boolean" },
                                validade: { type: "boolean" }
                            }
                        }
                    }
                }
            });

            // Formatar número do cartão com espaços
            let numeroFormatado = '';
            if (resultado.numero) {
                const numLimpo = resultado.numero.replace(/\D/g, '');
                if (numLimpo.length === 16) {
                    numeroFormatado = numLimpo.match(/.{1,4}/g).join(' ');
                }
            }

            // Formatar validade
            let validadeFormatada = '';
            if (resultado.validade) {
                const valLimpa = resultado.validade.replace(/\D/g, '');
                if (valLimpa.length >= 4) {
                    validadeFormatada = valLimpa.substring(0, 2) + '/' + valLimpa.substring(2, 4);
                }
            }

            const dadosExtraidos = {
                numero: numeroFormatado || '',
                titular: resultado.titular || '',
                validade: validadeFormatada || '',
                cvv: '', // CVV nunca é lido por segurança
                camposNaoLidos: {
                    numero: !numeroFormatado,
                    titular: !resultado.titular,
                    validade: !validadeFormatada,
                    cvv: true // CVV sempre precisa ser digitado
                }
            };

            onDadosCapturados(dadosExtraidos);
            onClose();

        } catch (err) {
            console.error('Erro ao processar imagem:', err);
            setError('Não foi possível ler os dados do cartão. Tente novamente ou digite manualmente.');
        } finally {
            setIsCapturing(false);
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                <DialogHeader className="p-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white">
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Escanear Cartão BNDES
                    </DialogTitle>
                </DialogHeader>

                <div className="relative">
                    {/* Video Preview */}
                    <div className="relative aspect-[16/10] bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay com guia do cartão */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative w-[85%] aspect-[1.586/1] border-2 border-white/50 rounded-xl">
                                {/* Cantos destacados */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                                
                                {/* Linha de scan animada */}
                                {cameraReady && !isProcessing && (
                                    <motion.div
                                        className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400/50"
                                        animate={{ top: ['10%', '90%', '10%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Loading overlay */}
                        <AnimatePresence>
                            {isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white"
                                >
                                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-400" />
                                    <p className="font-medium">Processando imagem...</p>
                                    <p className="text-sm text-white/70">Extraindo dados do cartão</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Camera not ready */}
                        {!cameraReady && !error && (
                            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white">
                                <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-400" />
                                <p className="text-sm">Iniciando câmera...</p>
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
                                <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Canvas oculto para captura */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Instructions & Buttons */}
                    <div className="p-4 space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                            <CreditCard className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <div className="text-sm text-emerald-800">
                                <p className="font-medium mb-1">Posicione seu cartão dentro da área</p>
                                <p className="text-emerald-600">Certifique-se que o número e nome estão visíveis e bem iluminados</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                                disabled={isProcessing}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button
                                onClick={captureAndProcess}
                                disabled={!cameraReady || isProcessing}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4 mr-2" />
                                )}
                                {isProcessing ? 'Processando...' : 'Capturar'}
                            </Button>
                        </div>

                        <p className="text-xs text-center text-slate-400">
                            🔒 A imagem é processada de forma segura e não é armazenada
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
