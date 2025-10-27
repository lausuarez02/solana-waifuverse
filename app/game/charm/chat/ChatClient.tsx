"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import styles from "./page.module.css";

// Waifu data - will be loaded from database
interface WaifuInfo {
  name: string;
  emoji: string;
  element: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const waifuId = searchParams.get('waifuId') || 'w1';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [waifu, setWaifu] = useState<WaifuInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load waifu data from database
  useEffect(() => {
    async function loadWaifu() {
      try {
        const res = await fetch('/api/spawns?includeInactive=true');
        if (res.ok) {
          const spawns = await res.json() as Array<{
            id: string;
            name: string;
            emoji: string;
          }>;
          const spawn = spawns.find(s => s.id === waifuId);
          if (spawn) {
            setWaifu({
              name: spawn.name,
              emoji: spawn.emoji,
              element: 'unknown' // Not used in chat
            });
          }
        }
      } catch (error) {
        console.error('Failed to load waifu data:', error);
      }
    }
    loadWaifu();
  }, [waifuId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('fc_auth_token');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          waifuId
        })
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: ''
      }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: assistantMessage }
                    : m
                ));
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again!'
      }]);
    }
  };

  if (!waifu) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Invalid waifu!</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Button
          onClick={() => router.push('/game/charm/collection')}
          variant="ghost"
          size="sm"
        >
          ← BACK
        </Button>
        <div className={styles.headerTitle}>
          <span className={styles.waifuEmoji}>{waifu.emoji}</span>
          <h1 className={styles.title}>{waifu.name}</h1>
        </div>
        <div style={{ width: '80px' }} /> {/* Spacer for centering */}
      </div>

      {/* Chat Messages */}
      <div className={styles.chatContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyEmoji}>{waifu.emoji}</div>
            <p className={styles.emptyText}>
              Start chatting with {waifu.name}!
            </p>
            <p className={styles.emptyHint}>
              Say hello or ask her anything 💬
            </p>
          </div>
        ) : (
          <div className={styles.messages}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage
                }`}
              >
                <div className={styles.messageHeader}>
                  {message.role === 'assistant' && (
                    <span className={styles.messageEmoji}>{waifu.emoji}</span>
                  )}
                  <span className={styles.messageSender}>
                    {message.role === 'user' ? 'You' : waifu.name}
                  </span>
                </div>
                <div className={styles.messageContent}>{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.assistantMessage}`}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageEmoji}>{waifu.emoji}</span>
                  <span className={styles.messageSender}>{waifu.name}</span>
                </div>
                <div className={styles.messageContent}>
                  <span className={styles.typingIndicator}>...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={waifu ? `Message ${waifu.name}...` : "Message..."}
          disabled={isLoading}
          className={styles.chatInput}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="icon"
          className={styles.sendButton}
        >
          {isLoading ? '⏳' : '➤'}
        </Button>
      </form>
    </div>
  );
}
