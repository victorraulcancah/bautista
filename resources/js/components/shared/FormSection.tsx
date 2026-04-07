type Props = {
    title:    string;
    cols?:    2 | 3;
    children: React.ReactNode;
};

export default function FormSection({ title, cols = 2, children }: Props) {
    return (
        <section>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">{title}</p>
            <div className={`grid gap-4 ${cols === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {children}
            </div>
        </section>
    );
}
