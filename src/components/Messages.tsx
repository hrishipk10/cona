
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageSquare, Loader } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Spinner } from "@/components/ui/spinner";

const Messages = () => {
  const { data: messages, isLoading, isError, error } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <div className="inline-block p-4 rounded-lg bg-destructive/10 text-destructive">
          Error loading messages: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-2xl font-bold text-primary">Messages</h3>
        </CardHeader>
        <CardContent>
          {messages && messages.length > 0 ? (
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <ul className="space-y-4">
                {messages.map((message) => (
                  <li key={message.id}>
                    <Card className="transition-all hover:shadow-md">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(parseISO(message.created_at), { 
                                addSuffix: true 
                              })}
                            </p>
                            <p className="mt-2 text-foreground">{message.message}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-12 bg-muted/30 rounded-lg">
              <MessageSquare className="mx-auto h-8 w-8 mb-3 text-muted-foreground/60" />
              <p>No messages yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
