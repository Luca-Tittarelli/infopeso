import { useState, useEffect } from 'react';
import { fetchFinancialNews } from '../utils/newsFetcher';

export function useNews() {
    const [news, setNews] = useState([]);
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

    useEffect(() => {
        let cancelled = false;
        
        setStatus('loading');
        fetchFinancialNews()
            .then(items => {
                if (!cancelled) {
                    setNews(items);
                    setStatus('success');
                }
            })
            .catch(() => {
                if (!cancelled) setStatus('error');
            });

        return () => { cancelled = true; };
    }, []);

    return { news, status };
}
