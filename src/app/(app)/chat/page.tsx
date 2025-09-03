
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';

const chatFormSchema = z.object({
  query: z.string().min(1, 'Message cannot be empty'),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  }

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

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 flex justify-center">
      <Card className="w-full max-w-3xl h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Website Assistant
          </CardTitle>
          <CardDescription>Ask me anything about the content on this website.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                    {message.sender === 'bot' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Sparkles /></AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                        <p className="text-sm">{message.text}</p>
                    </div>
                     {message.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                             <AvatarImage src={user?.photoURL || undefined} data-ai-hint="user avatar" alt="User avatar" />
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
    </div>
  );
}
