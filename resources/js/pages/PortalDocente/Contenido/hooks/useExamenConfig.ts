import { useState } from 'react';

export interface ExamenConfig {
    tiempo_limite: string;
    auto_submit: boolean;
    randomize_questions: boolean;
    lock_navigation: boolean;
    password: string;
    passing_score: string;
    show_grade: boolean;
}

export function useExamenConfig() {
    const [config, setConfig] = useState<ExamenConfig>({
        tiempo_limite: '60',
        auto_submit: true,
        randomize_questions: false,
        lock_navigation: false,
        password: '',
        passing_score: '11',
        show_grade: true
    });

    const updateField = (field: keyof ExamenConfig, value: string | boolean) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    return {
        config,
        updateField
    };
}
