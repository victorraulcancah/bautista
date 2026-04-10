import { cn } from "@/lib/utils";
import { BookOpen, Bell, FileText, BarChart2, MessageSquare, Users, Settings } from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    icon: any;
    count?: number;
}

interface CourseTabsProps {
    activeTab: string;
    onChange: (id: string) => void;
    role: 'student' | 'teacher';
}

export default function CourseTabs({ activeTab, onChange, role }: CourseTabsProps) {
    const commonTabs: Tab[] = [
        { id: 'content', label: 'Contenido', icon: BookOpen },
        { id: 'announcements', label: 'Anuncios', icon: Bell },
        { id: 'grades', label: 'Calificaciones', icon: BarChart2 },
        { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    ];

    const teacherTabs: Tab[] = [
        ...commonTabs,
        { id: 'roster', label: 'Alumnos', icon: Users },
        { id: 'settings', label: 'Ajustes', icon: Settings },
    ];

    const studentTabs: Tab[] = [
        ...commonTabs,
    ];

    const tabs = role === 'teacher' ? teacherTabs : studentTabs;

    return (
        <div className="w-full border-b border-gray-100 bg-white dark:bg-gray-900 sticky top-0 z-40">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onChange(tab.id)}
                                className={cn(
                                    "flex items-center gap-2.5 px-6 py-5 text-sm font-black transition-all relative whitespace-nowrap",
                                    isActive 
                                        ? "text-primary bg-primary/5" 
                                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                )}
                            >
                                <Icon size={18} className={cn("transition-colors", isActive ? "text-primary" : "text-gray-400")} />
                                <span className={cn("uppercase tracking-widest text-[11px]", isActive ? "opacity-100" : "opacity-70")}>
                                    {tab.label}
                                </span>
                                
                                {tab.count !== undefined && (
                                    <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-md">
                                        {tab.count}
                                    </span>
                                )}

                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(var(--primary),0.3)]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
