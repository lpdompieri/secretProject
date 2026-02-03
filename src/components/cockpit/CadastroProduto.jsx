import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PackagePlus, Upload, FileSpreadsheet, Loader2, CheckCircle2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CadastroProduto() {
    const [activeTab, setActiveTab] = useState('manual');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [success, setSuccess] = useState(false);

    // Form state para cadastro manual
    const [formData, setFormData] = useState({
        sku: '',
        ncm: '',
        origem: ''
    });

    // CSV state
    const [csvFile, setCsvFile] = useState(null);

    const origensOptions = [
        { value: 'nacional', label: 'Nacional' },
        { value: 'importado', label: 'Importado' },
        { value: 'mercosul', label: 'Mercosul' },
    ];

    const handleSubmitManual = async (e) => {
        e.preventDefault();
        if (!formData.sku || !formData.ncm || !formData.origem) return;
        await processarCadastro();
    };

    const handleSubmitCSV = async (e) => {
        e.preventDefault();
        if (!csvFile) return;
        await processarCadastro();
    };

    const processarCadastro = async () => {
        setIsProcessing(true);
        setSuccess(false);

        // Step 1: Cadastrando produtos
        setProcessingStep('Cadastrando produtos na base…');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 2: Validando elegibilidade
        setProcessingStep('Validando produtos elegíveis para venda com BNDES…');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Finalizado
        setIsProcessing(false);
        setSuccess(true);
        setFormData({ sku: '', ncm: '', origem: '' });
        setCsvFile(null);

        // Reset success after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
            setCsvFile(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
                    <PackagePlus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Cadastro de Produtos</h2>
                <p className="text-slate-500 mt-1">Cadastre produtos para venda com Cartão BNDES</p>
            </div>

            {/* Processing Modal */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center"
                        >
                            <Loader2 className="w-12 h-12 text-indigo-600 mx-auto animate-spin mb-4" />
                            <p className="text-slate-700 font-medium">{processingStep}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">Produtos cadastrados com sucesso.</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-lg">Novo Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="manual" className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Manual
                            </TabsTrigger>
                            <TabsTrigger value="csv" className="flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4" />
                                CSV
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="manual">
                            <form onSubmit={handleSubmitManual} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        placeholder="Código do produto"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ncm">NCM</Label>
                                    <Input
                                        id="ncm"
                                        value={formData.ncm}
                                        onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                                        placeholder="Ex: 8471.30.19"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="origem">Origem do Produto</Label>
                                    <Select
                                        value={formData.origem}
                                        onValueChange={(value) => setFormData({ ...formData, origem: value })}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Selecione a origem" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {origensOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!formData.sku || !formData.ncm || !formData.origem}
                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <PackagePlus className="w-5 h-5 mr-2" />
                                    Cadastrar Produto
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="csv">
                            <form onSubmit={handleSubmitCSV} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Arquivo CSV</Label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="csv-upload"
                                        />
                                        <label htmlFor="csv-upload" className="cursor-pointer">
                                            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                            {csvFile ? (
                                                <p className="text-sm text-indigo-600 font-medium">{csvFile.name}</p>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-slate-600 font-medium">
                                                        Clique para selecionar
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Formato: CSV com colunas SKU, NCM, Origem
                                                    </p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!csvFile}
                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <FileSpreadsheet className="w-5 h-5 mr-2" />
                                    Importar CSV
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
