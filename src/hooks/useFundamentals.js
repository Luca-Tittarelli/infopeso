import { useState, useEffect } from 'react';

const API_KEY = 'G3eqpfFyqHPnwwtKNF5Pto3MPRCMAaWG';
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const CACHE_PREFIX = 'fmp_cache_';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Hook to fetch company fundamentals from FMP.
 * Includes local caching to minimize API requests (250 limit).
 */
export function useFundamentals(symbol) {
    const [data, setData] = useState(null);
    const [news, setNews] = useState([]);
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        if (!symbol) return;

        const fetchData = async () => {
            // 1. Check Cache
            const cacheKey = `${CACHE_PREFIX}${symbol}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (cached) {
                const { timestamp, data: cachedData, news: cachedNews } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_TTL) {
                    setData(cachedData);
                    setNews(cachedNews);
                    setStatus('success');
                    return;
                }
            }

            setStatus('loading');
            try {
                // FMP needs symbols without .BA for some endpoints, but let's try with what we have
                // Usually for Argentina it expects GGAL.BA or similar.
                
                const [profileRes, metricsRes, newsRes] = await Promise.all([
                    fetch(`${BASE_URL}/profile/${symbol}?apikey=${API_KEY}`),
                    fetch(`${BASE_URL}/key-metrics-ttm/${symbol}?limit=1&apikey=${API_KEY}`),
                    fetch(`${BASE_URL}/stock_news?tickers=${symbol}&limit=6&apikey=${API_KEY}`)
                ]);

                const profileData = await profileRes.json();
                const metricsData = await metricsRes.json();
                const newsData = await newsRes.json();

                if (!profileData || profileData.length === 0) {
                    throw new Error('Empresa no encontrada');
                }

                const combinedData = {
                    profile: profileData[0],
                    metrics: metricsData[0] || {},
                };

                // 2. Update State
                setData(combinedData);
                setNews(newsData);
                setStatus('success');

                // 3. Save to Cache
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    data: combinedData,
                    news: newsData
                }));

            } catch (err) {
                console.error('FMP Fetch Error:', err);
                setStatus('error');
            }
        };

        fetchData();
    }, [symbol]);

    return { data, news, status };
}

