import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { MessageSquare, Send, Reply, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CommentUser {
    id: number;
    name: string;
    nombre_completo: string;
    avatar: string | null;
}

interface Comment {
    id: number;
    contenido: string;
    created_at: string;
    user: CommentUser;
    replies?: Comment[];
}

export default function NoticiaComentarios({ noticiaId, comentarios }: Props) {
    const { auth } = usePage().props as any;
    const [replyTo, setReplyTo] = useState<number | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        contenido: '',
        parent_id: null as number | null,
    });

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/institucion/noticias/${noticiaId}/comentarios`, {
            onSuccess: () => {
                reset();
                setReplyTo(null);
            },
            preserveScroll: true,
        });
    };

    const handleReply = (parentId: number) => {
        setReplyTo(parentId);
        setData('parent_id', parentId);
    };

    const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
        <div className={`flex gap-4 ${isReply ? 'ml-12 mt-4 pb-4 border-l-2 border-neutral-100 pl-6' : 'py-6 border-b border-neutral-100'}`}>
            <Avatar className={isReply ? 'w-8 h-8' : 'w-10 h-10'}>
                <AvatarImage src={comment.user.avatar || ''} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                    {comment.user.nombre_completo.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-neutral-900 group flex items-center gap-2">
                        {comment.user.nombre_completo}
                        {auth.user?.id === comment.user.id && (
                            <span className="text-[9px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Tú</span>
                        )}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-medium">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                    </span>
                </div>
                
                <p className="text-sm text-neutral-600 leading-relaxed">
                    {comment.contenido}
                </p>

                {!isReply && (
                    <button 
                        onClick={() => handleReply(comment.id)}
                        className="text-[10px] font-black text-[#00a65a] uppercase tracking-widest flex items-center gap-1 mt-2 hover:underline"
                    >
                        <Reply className="w-3 h-3" /> Responder
                    </button>
                )}

                {replyTo === comment.id && !isReply && (
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                        <form onSubmit={submitComment} className="relative">
                            <textarea
                                value={data.contenido}
                                onChange={(e) => setData('contenido', e.target.value)}
                                placeholder={`Responde a ${comment.user.nombre_completo.split(' ')[0]}...`}
                                className="w-full rounded-2xl border-2 border-neutral-100 bg-neutral-50 px-4 py-3 text-sm focus:border-[#00a65a]/30 focus:ring-4 focus:ring-[#00a65a]/5 transition-all outline-none resize-none"
                                rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setReplyTo(null)}
                                    className="text-[10px] font-black uppercase"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    disabled={processing || !data.contenido.trim()} 
                                    size="sm"
                                    className="bg-[#00a65a] hover:bg-[#008d4c] text-white rounded-xl px-4 h-8"
                                >
                                    <Send className="w-3 h-3 mr-2" />
                                    Publicar Respuesta
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-2">
                        {comment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} isReply />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <section id="comentarios" className="py-16 border-t border-neutral-100 mt-20 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                        <MessageSquare className="w-6 h-6 text-[#00a65a]" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Debate en la Redacción</h3>
                        <p className="text-sm text-neutral-400 font-medium">{comentarios.length} comentarios publicados</p>
                    </div>
                </div>

                {/* Formulario Principal */}
                <div className="bg-neutral-50 rounded-[2.5rem] p-8 mb-12 border border-neutral-100">
                    <form onSubmit={submitComment} className="space-y-4">
                        <div className="flex gap-4">
                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                <AvatarImage src={auth.user?.avatar || ''} />
                                <AvatarFallback className="bg-neutral-200">
                                    <UserIcon className="w-5 h-5 text-neutral-400" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-4">
                                <textarea
                                    value={replyTo === null ? data.contenido : ''}
                                    onChange={(e) => {
                                        if (replyTo === null) {
                                            setData('contenido', e.target.value);
                                        } else {
                                            setReplyTo(null);
                                            setData({ contenido: e.target.value, parent_id: null });
                                        }
                                    }}
                                    placeholder="¿Qué opinas sobre esta crónica?"
                                    className="w-full rounded-2xl border-2 border-transparent bg-white px-5 py-4 text-sm focus:border-[#00a65a]/30 focus:ring-4 focus:ring-[#00a65a]/5 transition-all outline-none resize-none shadow-sm min-h-[100px]"
                                />
                                <div className="flex justify-end">
                                    <Button 
                                        disabled={processing || !data.contenido.trim() || replyTo !== null}
                                        className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-8 rounded-2xl font-black shadow-xl shadow-[#00a65a]/20 h-12 uppercase tracking-widest text-xs"
                                    >
                                        Publicar Comentario
                                        <Send className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Lista de Comentarios */}
                <div className="space-y-2">
                    {comentarios.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200">
                            <p className="text-neutral-400 italic">Aún no hay comentarios. ¡Sé el primero en participar!</p>
                        </div>
                    ) : (
                        comentarios.map(comment => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

interface Props {
    noticiaId: number;
    comentarios: Comment[];
}
