
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { websiteChatbot } from '@/ai/flows/ai-chatbot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Sparkles, MessageSquare, X } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { cn } from '@/lib/utils';

const chatFormSchema = z.object({
  query: z.string().min(1, 'Message cannot be empty'),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export function ChatbotWidget() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { query: '' },
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  };

  const onSubmit = async (data: ChatFormValues) => {
    setIsLoading(true);
    const userMessage: Message = { sender: 'user', text: data.query };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    try {
      const result = await websiteChatbot({ query: data.query });
      const botMessage: Message = { sender: 'bot', text: result.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'bot', text: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
      return (
        <Button 
            onClick={() => setIsOpen(true)} 
            className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        >
            <MessageSquare className="h-6 w-6" />
        </Button>
      )
  }

  return (
    <Card className={cn(
        "fixed bottom-4 right-4 z-50 w-[90vw] max-w-sm h-[70vh] flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
        )}>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" />
                    AI Assistant
                </CardTitle>
                <CardDescription>Ask about the website content.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
            </Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        <Sparkles className="mx-auto h-10 w-10 mb-4 text-primary/50" />
                        <p>Ask me anything!</p>
                    </div>
                )}
                {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                    {message.sender === 'bot' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Sparkles /></AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${
                        message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                        <p>{message.text}</p>
                    </div>
                     {message.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                             <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback><Sparkles /></AvatarFallback>
                        </Avatar>
                         <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-center gap-2">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="Type your message..." {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                Send
              </Button>
            </form>
          </Form>
        </CardFooter>
      </Card>
  );
}
