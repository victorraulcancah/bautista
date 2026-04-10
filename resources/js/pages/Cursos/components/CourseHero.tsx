import { Calendar, Users, BookOpen, Clock, ShieldCheck, GraduationCap } from 'lucide-react';

interface CourseHeroProps {
    title: string;
    courseCode: string;
    color: string;
    image?: string;
    term?: string;
    professor?: string;
    role: 'student' | 'teacher';
}

export default function CourseHero({ 
    title, 
    courseCode, 
    color, 
    image, 
    term = "Ciclo 2024-I", 
    professor,
    role 
}: CourseHeroProps) {
    return (
        <div className="relative h-56 md:h-64 w-full overflow-hidden rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none group">
            {/* Background Layer with optimized aesthetics */}
            <div 
                className="absolute inset-0 bg-neutral-900" 
            >
                {image ? (
                    <img 
                        src={image} 
                        alt={title} 
                        className="size-full object-cover opacity-50 mix-blend-luminosity grayscale group-hover:scale-105 transition-transform duration-1000" 
                    />
                ) : (
                    <div 
                        className="absolute inset-0 opacity-80"
                        style={{ background: `linear-gradient(135deg, ${color} 0%, #000 100%)` }} 
                    />
                )}
                {/* Modern Glassy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                <div className="max-w-4xl space-y-3">
                    {/* Badges Flow */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-xl border border-white/10 group-hover:bg-white/20 transition-colors">
                            <ShieldCheck size={10} /> {courseCode}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-xl shadow-lg ring-1 ring-white/20">
                            {term}
                        </span>
                        {professor && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white/90 backdrop-blur-md border border-white/5">
                                <GraduationCap size={10} /> {professor}
                            </span>
                        )}
                    </div>

                    {/* Compact Bold Title */}
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
                        {title}
                    </h1>

                    {/* Stats/Badges Row */}
                    <div className="flex flex-wrap items-center gap-6 pt-1 text-white/70">
                        <div className="flex items-center gap-1.5 group/stat">
                            <Users size={14} className="text-primary group-hover/stat:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{role === 'teacher' ? 'Aula Asignada' : 'Mis Compañeros'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 group/stat">
                            <Clock size={14} className="text-secondary group-hover/stat:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">En Sesión</span>
                        </div>
                        <div className="flex items-center gap-1.5 group/stat">
                            <BookOpen size={14} className="text-indigo-400 group-hover/stat:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Activo</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Abstract Decoration */}
            <div className="absolute -top-10 -right-10 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                <GraduationCap size={240} className="text-white" />
            </div>
        </div>
    );
}
