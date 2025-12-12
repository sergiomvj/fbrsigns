import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIProjectAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIProjectAssistant: React.FC<AIProjectAssistantProps> = ({
  open,
  onOpenChange
}) => {
  const { t } = useTranslation('content');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [projectSummary, setProjectSummary] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const startConversation = async () => {
    setIsLoading(true);
    setConversationStarted(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-project-assistant', {
        body: {
          messages: [
            {
              role: 'user',
              content: 'Hello, I would like to start a new project but I\'m not sure how to explain what I need.'
            }
          ]
        }
      });

      if (error) throw error;

      const newMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages([newMessage]);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: t('aiAssistant.errors.startFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-project-assistant', {
        body: {
          messages: conversationHistory
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: t('aiAssistant.errors.sendFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateProjectSummary = async () => {
    if (messages.length < 4) {
      toast({
        title: t('aiAssistant.chat.moreInfoNeeded'),
        description: t('aiAssistant.chat.moreInfoDescription'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-project-assistant', {
        body: {
          messages: conversationHistory,
          action: 'summarize'
        }
      });

      if (error) throw error;

      setProjectSummary(data.message);

      toast({
        title: t('aiAssistant.summary.summaryGenerated'),
        description: t('aiAssistant.summary.summaryDescription'),
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: t('aiAssistant.errors.summaryFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationStarted(false);
    setProjectSummary(null);
    setInput('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">

        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center justify-center gap-3 text-2xl">
            <div className="p-2 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            {t('aiAssistant.title')}
          </DialogTitle>
          <DialogDescription>
            {t('aiAssistant.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {!conversationStarted && !projectSummary ? (
            // Welcome Screen
            <ScrollArea className="flex-1">
              <div className="flex items-center justify-center p-8 min-h-full">
                <div className="text-center max-w-2xl">
                  <div className="mb-8">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-primary mb-4">
                      <Bot className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">
                      {t('aiAssistant.welcome.title')}
                    </h3>
                    <p className="text-muted-foreground text-lg mb-8">
                      {t('aiAssistant.welcome.description')}
                    </p>
                  </div>

                  <GlassCard className="p-6 mb-6">
                    <h4 className="font-semibold mb-3">{t('aiAssistant.welcome.helpDefine')}</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {t('aiAssistant.welcome.productType')}
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {t('aiAssistant.welcome.sizeFormat')}
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {t('aiAssistant.welcome.designStyle')}
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {t('aiAssistant.welcome.timelineBudget')}
                      </div>
                    </div>
                  </GlassCard>

                  <Button
                    onClick={startConversation}
                    disabled={isLoading}
                    size="lg"
                    className="h-12 px-8 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('aiAssistant.welcome.starting')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        {t('aiAssistant.welcome.startButton')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          ) : projectSummary ? (
            // Project Summary Screen
            <ScrollArea className="flex-1">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-primary mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{t('aiAssistant.summary.title')}</h3>
                  <p className="text-muted-foreground">{t('aiAssistant.summary.description')}</p>
                </div>

                <GlassCard className="p-6 mb-6">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{projectSummary}</div>
                  </div>
                </GlassCard>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={resetConversation}>
                    {t('aiAssistant.summary.startOver')}
                  </Button>
                  <Button onClick={() => onOpenChange(false)}>
                    {t('aiAssistant.summary.requestQuote')}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          ) : (
            // Chat Interface
            <div className="flex-1 flex flex-col">
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gradient-primary'
                          }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <GlassCard className={`p-4 ${message.role === 'user' ? 'bg-primary/10' : ''}`}>
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </GlassCard>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <GlassCard className="p-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">{t('aiAssistant.chat.thinking')}</span>
                          </div>
                        </GlassCard>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t border-border p-6">
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('aiAssistant.chat.placeholder')}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {messages.length >= 4 && !projectSummary && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={generateProjectSummary}
                      disabled={isLoading}
                    >
                      {t('aiAssistant.chat.generateSummary')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


