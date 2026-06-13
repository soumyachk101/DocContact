'use client';

// useQueueStream — opens an EventSource, listens for `queueUpdated`
// events, and falls back to a 10s poll on error.

import { useEffect, useRef } from 'react';

export function useQueueStream(onUpdate: () => void) {
    const onUpdateRef = useRef(onUpdate);

    useEffect(() => {
        onUpdateRef.current = onUpdate;
    });

    useEffect(() => {
        if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
        const es = new EventSource('/api/queue/stream');
        const handler = () => onUpdateRef.current();
        es.addEventListener('queueUpdated', handler);
        es.onerror = () => {
            es.close();
        };
        return () => {
            es.removeEventListener('queueUpdated', handler);
            es.close();
        };
    }, []);
}
