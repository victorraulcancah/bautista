import { useState } from 'react';

export interface Alternative {
    contenido: string;
    es_correcta: boolean;
}

export interface Question {
    cabecera: string;
    tipo_respuesta: 'multiple' | 'true_false' | 'likert' | 'open';
    valor_nota: number;
    recurso_imagen?: string | null;
    alternativas: Alternative[];
}

export interface CuestionarioConfig {
    default_question_type: string;
    all_required: boolean;
    show_correct_answer: boolean;
    completion_message: string;
    is_anonymous: boolean;
    show_summary: boolean;
    duracion: number;
    questions: Question[];
}

export function useCuestionarioConfig() {
    const [config, setConfig] = useState<CuestionarioConfig>({
        default_question_type: 'multiple',
        all_required: true,
        show_correct_answer: false,
        completion_message: 'Gracias por completar el cuestionario',
        is_anonymous: false,
        show_summary: false,
        duracion: 60,
        questions: []
    });

    const updateField = (field: keyof CuestionarioConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            cabecera: '',
            tipo_respuesta: (config.default_question_type as any) || 'multiple',
            valor_nota: 1,
            alternativas: config.default_question_type === 'multiple' ? [
                { contenido: 'Opción 1', es_correcta: true },
                { contenido: 'Opción 2', es_correcta: false }
            ] : config.default_question_type === 'true_false' ? [
                { contenido: 'Verdadero', es_correcta: true },
                { contenido: 'Falso', es_correcta: false }
            ] : []
        };
        setConfig(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    };

    const removeQuestion = (index: number) => {
        setConfig(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
    };

    const updateQuestion = (index: number, updatedQuestion: Question) => {
        setConfig(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[index] = updatedQuestion;
            return { ...prev, questions: newQuestions };
        });
    };

    return {
        config,
        updateField,
        addQuestion,
        removeQuestion,
        updateQuestion
    };
}
