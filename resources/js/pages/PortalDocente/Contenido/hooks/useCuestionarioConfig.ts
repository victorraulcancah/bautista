import { useState } from 'react';

export interface CuestionarioConfig {
    default_question_type: string;
    all_required: boolean;
    show_correct_answer: boolean;
    completion_message: string;
    is_anonymous: boolean;
    show_summary: boolean;
}

export function useCuestionarioConfig() {
    const [config, setConfig] = useState<CuestionarioConfig>({
        default_question_type: 'multiple',
        all_required: true,
        show_correct_answer: false,
        completion_message: 'Gracias por completar el cuestionario',
        is_anonymous: false,
        show_summary: false
    });

    const updateField = (field: keyof CuestionarioConfig, value: string | boolean) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    return {
        config,
        updateField
    };
}
