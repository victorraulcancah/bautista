import Quill from 'quill';
import { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';

type Props = {
    value:    string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: number;
};

const TOOLBAR = [
    [{ font: [] }],
    ['bold', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean'],
];

export default function RichTextEditor({ value, onChange, placeholder = '', minHeight = 180 }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef     = useRef<Quill | null>(null);
    const onChangeRef  = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (!containerRef.current || quillRef.current) {
return;
}

        const q = new Quill(containerRef.current, {
            theme:       'snow',
            placeholder,
            modules: {
                toolbar: TOOLBAR,
            },
        });

        // Sync inicial
        if (value) {
q.clipboard.dangerouslyPasteHTML(value);
}

        q.on('text-change', () => {
            const html = q.getSemanticHTML();
            onChangeRef.current(html === '<p></p>' ? '' : html);
        });

        quillRef.current = q;
    }, []);

    // Actualizar contenido desde fuera (ej. al resetear el modal)
    useEffect(() => {
        const q = quillRef.current;

        if (!q) {
return;
}

        const current = q.getSemanticHTML();
        const normalized = current === '<p></p>' ? '' : current;

        if (value !== normalized) {
            q.clipboard.dangerouslyPasteHTML(value ?? '');
        }
    }, [value]);

    return (
        <div className="quill-wrapper rounded-md border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#00a65a]">
            <div ref={containerRef} style={{ minHeight }} />
        </div>
    );
}
