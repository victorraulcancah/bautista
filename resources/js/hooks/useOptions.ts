import { useEffect, useState } from 'react';
import api from '@/lib/api';

export function useOptions<T>(endpoint: string) {
    const [options, setOptions] = useState<T[]>([]);

    useEffect(() => {
        api.get(endpoint, { params: { per_page: 200 } })
            .then(({ data }) => setOptions(data.data ?? []));
    }, [endpoint]);

    return options;
}
