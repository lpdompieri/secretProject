import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Search, CreditCard, LogOut, Users, FileText, Menu, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('cockpit_authenticated');
        if (!isAuthenticated) {
            navigate(createPageUrl('AcessoCockpit'));
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('cockpit_authenticated');
        navigate(createPageUrl('AcessoCockpit'));
    };

    const menuItems = [
        { id: 'pagamento', label: 'Pagamento', icon: CreditCard, page: 'Pedido' },
        { id: 'consulta-pedido', label: 'Consulta Pedido', icon: FileText, page: 'Cockpit', tab: 'pagamento' },
        { id: 'consulta-cliente', label: 'Consulta Cliente', icon: Users, page: 'Cockpit', tab: 'cliente' },
        { id: 'produtos', label: 'Produtos', icon: Package, page: 'Cockpit', tab: 'consulta-produto' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
            {/* Header com Menu */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center">
                                <span className="text-white font-bold">B</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-slate-800">Cartão BNDES</h1>
                            </div>
                        </div>

                        {/* Desktop Menu */}
                        <nav className="hidden md:flex items-center gap-1">
                            {menuItems.map((item) => (
                                <Link 
                                    key={item.id} 
                                    to={item.tab ? `${createPageUrl(item.page)}?tab=${item.tab}` : createPageUrl(item.page)}
                                >
                                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50">
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </Button>
                                </Link>
                            ))}
                            <div className="w-px h-6 bg-slate-200 mx-2" />
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleLogout}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sair
                            </Button>
                        </nav>

                        {/* Mobile Menu Button */}
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

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-slate-100 bg-white"
                        >
                            <div className="p-4 space-y-2">
                                {menuItems.map((item) => (
                                    <Link 
                                        key={item.id} 
                                        to={item.tab ? `${createPageUrl(item.page)}?tab=${item.tab}` : createPageUrl(item.page)}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button variant="ghost" className="w-full justify-start text-slate-600">
                                            <item.icon className="w-4 h-4 mr-3" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                ))}
                                <div className="border-t border-slate-100 pt-2">
                                    <Button 
                                        variant="ghost" 
                                        onClick={handleLogout}
                                        className="w-full justify-start text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4 mr-3" />
                                        Sair
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Conteúdo Principal */}
            <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Logo e Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center shadow-xl shadow-emerald-200">
                        <CreditCard className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Cartão BNDES</h1>
                    <p className="text-slate-500">Simulador de Pagamento</p>
                </div>

                {/* Card Principal */}
                <Card className="shadow-xl border-0">
                    <CardContent className="p-8">
                        <h2 className="text-center text-lg font-semibold text-slate-700 mb-8">
                            Simular processo de pagamento via:
                        </h2>

                        <div className="space-y-4">
                            {/* Botão Jornada de Venda */}
                            <Link to={createPageUrl('Pedido')}>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button className="w-full h-16 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold text-lg rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-3">
                                        <ShoppingCart className="w-6 h-6" />
                                        Jornada de Venda
                                    </Button>
                                </motion.div>
                            </Link>

                            {/* Botão Consulta de Pedidos */}
                            <Link to={`${createPageUrl('Cockpit')}?tab=pagamento`}>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button variant="outline" className="w-full h-16 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold text-lg rounded-xl flex items-center justify-center gap-3">
                                        <Search className="w-6 h-6" />
                                        Consulta de Pedidos
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    Ambiente de simulação • Não realiza transações reais
                </p>
            </motion.div>
            </div>
        </div>
    );
}
