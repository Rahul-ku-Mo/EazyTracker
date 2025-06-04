import { useState, useRef, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

interface GeminiChunk {
  chunk?: string;
  done?: boolean;
  type?: string;
  fullText?: string;
  error?: string;
}

export interface GeminiStreamHook {
  response: string;
  isStreaming: boolean;
  error: Error | null;
  submitPrompt: (prompt: string) => Promise<void>;
  stopStream: () => void;
}

export interface ImproveWritingHook {
  improvedText: string;
  isImproving: boolean;
  error: Error | null;
  improveText: (text: string) => Promise<void>;
  stopImproving: () => void;
}

export const useGeminiStream = (apiEndpoint: string, conversationId: string): GeminiStreamHook => {
  const [response, setResponse] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const accessToken = Cookies.get('accessToken');

  const stopStream = useCallback((): void => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return stopStream;
  }, [stopStream]);

  const submitPrompt = async (prompt: string): Promise<void> => {
    if (!prompt.trim()) {
      setError(new Error('Prompt cannot be empty'));
      return;
    }

    // Clean up existing connection
    stopStream();
    
    // Reset state
    setResponse('');
    setError(null);
    setIsStreaming(true);
    
    try {
      // Initialize stream with server
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: prompt , conversationId }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }
      
      // Create EventSource to receive stream
      const eventSource = new EventSource(apiEndpoint);
      eventSourceRef.current = eventSource;
      
      eventSource.onmessage = (event: MessageEvent): void => {
        try {
          const parsedData: GeminiChunk = JSON.parse(event.data);
          
          // Check if this is a "done" message
          if (parsedData.done === true) {
            setIsStreaming(false);
            stopStream();
            return;
          }
          
          // Add chunk text to the response if it exists
          if (parsedData.chunk !== undefined) {
            setResponse(prev => prev + parsedData.chunk);
          }
        } catch (error: any) {
          console.warn('Failed to parse SSE data:', error);
          // Just in case it's not JSON, add the raw data
          setResponse(prev => prev + event.data);
        }
      };
      
      eventSource.onerror = (): void => {
        setError(new Error('Connection error. Please try again.'));
        setIsStreaming(false);
        stopStream();
      };
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(new Error(errorMessage));
      setIsStreaming(false);
    }
  };

  return {
    response,
    isStreaming,
    error,
    submitPrompt,
    stopStream
  };
};

export const useImproveWriting = (): ImproveWritingHook => {
  const [improvedText, setImprovedText] = useState<string>('');
  const [isImproving, setIsImproving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const accessToken = Cookies.get('accessToken');

  const stopImproving = useCallback((): void => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsImproving(false);
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return stopImproving;
  }, [stopImproving]);

  const improveText = async (text: string): Promise<void> => {
    if (!text.trim()) {
      setError(new Error('Text cannot be empty'));
      return;
    }

    // Clean up existing connection
    stopImproving();
    
    // Reset state
    setImprovedText('');
    setError(null);
    setIsImproving(true);
    
    try {
      // Initialize improve writing request
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ai/improve-writing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }
      
      // Read the streaming response
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: GeminiChunk = JSON.parse(line.slice(6));
              
              if (data.type === 'error') {
                setError(new Error(data.error || 'An error occurred'));
                setIsImproving(false);
                return;
              }
              
              if (data.type === 'complete' && data.done) {
                setIsImproving(false);
                return;
              }
              
              if (data.chunk && data.type === 'content') {
                setImprovedText(prev => prev + data.chunk);
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(new Error(errorMessage));
      setIsImproving(false);
    }
  };

  return {
    improvedText,
    isImproving,
    error,
    improveText,
    stopImproving
  };
};