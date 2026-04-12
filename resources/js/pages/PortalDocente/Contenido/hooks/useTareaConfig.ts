import { useState } from 'react';

export interface TareaConfig {
    max_file_size: string;
    allowed_formats: string[];
    max_attempts: string;
}

export function useTareaConfig() {
    const [config, setConfig] = useState<TareaConfig>({
        max_file_size: '50',
        allowed_formats: ['pdf', 'docx', 'zip'],
        max_attempts: '1'
    });

    const updateMaxFileSize = (size: string) => {
        setConfig(prev => ({ ...prev, max_file_size: size }));
    };

    const updateMaxAttempts = (attempts: string) => {
        setConfig(prev => ({ ...prev, max_attempts: attempts }));
    };

    const toggleFormat = (format: string) => {
        setConfig(prev => ({
            ...prev,
            allowed_formats: prev.allowed_formats.includes(format)
                ? prev.allowed_formats.filter(f => f !== format)
                : [...prev.allowed_formats, format]
        }));
    };

    return {
        config,
        updateMaxFileSize,
        updateMaxAttempts,
        toggleFormat
    };
}
