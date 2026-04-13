import { useState } from 'react';

export interface Alternative {
    contenido: string;
    es_correcta: boolean;
}

export interface Question {
    cabecera: string;
    tipo_respuesta: 'multiple' | 'true_false' | 'likert' | 'open';
    valor_nota: number;
    alternativas: Alternative[];
}

export interface ExamenConfig {
    duracion: string;
    auto_submit: boolean;
    randomize_questions: boolean;
    lock_navigation: boolean;
    password: string;
    passing_score: string;
    show_grade: boolean;
    questions: Question[];
}

export function useExamenConfig() {
    const [config, setConfig] = useState<ExamenConfig>({
        duracion: '60',
        auto_submit: true,
        randomize_questions: false,
        lock_navigation: false,
        password: '',
        passing_score: '11',
        show_grade: true,
        questions: []
    });

    const updateField = (field: keyof ExamenConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            cabecera: '',
            tipo_respuesta: 'multiple',
            valor_nota: 1,
            alternativas: [
                { contenido: 'Opción 1', es_correcta: true },
                { contenido: 'Opción 2', es_correcta: false }
            ]
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
