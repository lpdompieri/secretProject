import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { CreditCard, LogOut, Users, Receipt, Menu, X, Package, PackagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConsultaCliente from "@/components/cockpit/ConsultaCliente";
import ConsultaPedido from "@/components/cockpit/ConsultaPedido";
import ConsultaProduto from "@/components/cockpit/ConsultaProduto";
import CadastroProduto from "@/components/cockpit/CadastroProduto";
import HomeButton from "@/components/shared/HomeButton";

export default function Cockpit() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Ler tab da URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') || 'pagamento';
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        // Verificar se está autenticado
        const isAuthenticated = sessionStorage.getItem('cockpit_authenticated');
        if (!isAuthenticated) {
            navigate(createPageUrl('AcessoCockpit'));
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('cockpit_authenticated');
        navigate(createPageUrl('Home'));
    };

    const menuItems = [
        { id: 'pagamento', label: 'Pagamento', icon: Receipt },
        { id: 'cliente', label: 'Consulta Cliente', icon: Users },
        { id: 'consulta-produto', label: 'Consulta Produto', icon: Package },
        { id: 'cadastro-produto', label: 'Cadastro Produto', icon: PackagePlus },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
            {/* Header Fixo */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo e Menu */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="font-bold text-slate-800">BNDES</p>
                                    <p className="text-xs text-slate-500">Cockpit</p>
                                </div>
                            </div>

                            {/* Menu Desktop */}
                            <nav className="hidden md:flex items-center gap-1">
                                {menuItems.map((item) => (
                                    <Button
                                        key={item.id}
                                        variant={activeTab === item.id ? "default" : "ghost"}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`${
                                            activeTab === item.id
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                                        }`}
                                    >
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </Button>
                                ))}
                            </nav>
                        </div>

                        {/* Logout e Menu Mobile */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>

                            {/* Botão Menu Mobile */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Menu Mobile */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-slate-100 bg-white"
                        >
                            <div className="p-2 space-y-1">
                                {menuItems.map((item) => (
                                    <Button
                                        key={item.id}
                                        variant={activeTab === item.id ? "default" : "ghost"}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full justify-start ${
                                            activeTab === item.id
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                                        }`}
                                    >
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Conteúdo Principal */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'pagamento' && <ConsultaPedido />}
                        {activeTab === 'cliente' && <ConsultaCliente />}
                        {activeTab === 'consulta-produto' && <ConsultaProduto />}
                        {activeTab === 'cadastro-produto' && <CadastroProduto />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Botão Home Fixo */}
            <HomeButton />
        </div>
    );
}
