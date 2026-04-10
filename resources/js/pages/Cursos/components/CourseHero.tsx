import { Calendar, Users, BookOpen, Clock } from 'lucide-react';

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
        <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-[3rem] shadow-2xl shadow-gray-200/50 dark:shadow-none">
            {/* Background Layer */}
            <div 
                className="absolute inset-0 transition-transform duration-700 hover:scale-105" 
                style={{ backgroundColor: color }}
            >
                {image ? (
                    <img src={image} alt={title} className="size-full object-cover opacity-40 mix-blend-overlay" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/20" />
                )}
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                <div className="max-w-4xl space-y-4">
                    {/* Course Identifiers */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-xl bg-white/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/10">
                            {courseCode}
                        </span>
                        <span className="inline-flex items-center rounded-xl bg-primary/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                            {term}
                        </span>
                        {professor && (
                            <span className="inline-flex items-center rounded-xl bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/5">
                                PROF: {professor}
                            </span>
                        )}
                        <span className="inline-flex items-center rounded-xl bg-emerald-500/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                            EN CURSO
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none drop-shadow-lg">
                        {title}
                    </h1>

                    {/* Stats/Badges */}
                    <div className="flex flex-wrap items-center gap-6 pt-2 text-white/80">
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-white" />
                            <span className="text-xs font-bold">{role === 'teacher' ? 'Ver mis 32 alumnos' : 'Aula compartida'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-white" />
                            <span className="text-xs font-bold">Lunes y Miércoles • 08:00 AM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-white" />
                            <span className="text-xs font-bold">8 Unidades Temáticas</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute top-0 right-0 p-12 hidden lg:block opacity-20 transform translate-x-12 -translate-y-12">
                <BookOpen size={300} className="text-white" />
            </div>
        </div>
    );
}
