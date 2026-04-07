import { Plus, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import SectionCard from '@/components/shared/SectionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs:   BreadcrumbItem[];
    pageTitle:     string;
    subtitle:      string;
    iconColor:     string;
    icon:          LucideIcon;
    search:        string;
    onSearch:      (v: string) => void;
    flashSuccess?: string | null;
    btnLabel?:     string;
    onNew?:        () => void;
    children:      React.ReactNode;
};

export default function ResourcePage({
    breadcrumbs, pageTitle, subtitle, icon, iconColor,
    search, onSearch, flashSuccess, btnLabel, onNew, children,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
                <PageHeader icon={icon} title={pageTitle} subtitle={subtitle} iconColor={iconColor} />

                {flashSuccess && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flashSuccess}
                    </div>
                )}

                <SectionCard title={`Listado de ${pageTitle}`}>
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex w-full sm:w-auto gap-2">
                            <Input
                                value={search}
                                onChange={(e) => onSearch(e.target.value)}
                                placeholder="Buscar..."
                                className="flex-1 sm:w-64"
                            />
                            <Button variant="outline" size="icon" className="shrink-0">
                                <Search className="size-4" />
                            </Button>
                        </div>
                        {btnLabel && onNew && (
                            <Button onClick={onNew} className="bg-[#00a65a] w-full sm:w-auto hover:bg-[#008d4c] text-white gap-2">
                                <Plus className="size-4" /> {btnLabel}
                            </Button>
                        )}
                    </div>
                    {children}
                </SectionCard>
            </div>
        </AppLayout>
    );
}
