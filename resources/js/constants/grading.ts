/**
 * Grading System Constants
 */

export const GRADING_SYSTEM = {
    MAX_GRADE: 20,
    MIN_GRADE: 0,
    PASSING_GRADE: 11,
} as const;

export type GradeStatus = 'approved' | 'disapproved' | 'pending';

/**
 * Get the color and label for a grade
 */
export const getGradeStatus = (grade: number | string | null): { 
    status: GradeStatus, 
    label: string, 
    color: string,
    bg: string 
} => {
    if (grade === null || grade === undefined || grade === '') {
        return { 
            status: 'pending', 
            label: 'Pendiente', 
            color: 'text-gray-400',
            bg: 'bg-gray-100'
        };
    }

    const numericGrade = Number(grade);

    if (numericGrade >= GRADING_SYSTEM.PASSING_GRADE) {
        return { 
            status: 'approved', 
            label: 'Aprobado', 
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        };
    }

    return { 
        status: 'disapproved', 
        label: 'Desaprobado', 
        color: 'text-rose-600',
        bg: 'bg-rose-50'
    };
};
