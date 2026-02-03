import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function HomeButton() {
    return (
        <Link to={createPageUrl('Home')}>
            <Button
                variant="outline"
                size="sm"
                className="fixed bottom-6 right-6 z-50 shadow-lg bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-full px-4"
            >
                <Home className="w-4 h-4 mr-2" />
                Início
            </Button>
        </Link>
    );
}
