import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const Messages = () => {
  const { data: messages, isLoading } = useQuery({
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
    return <div>Loading messages...</div>;
  }

  return (
    <div className="space-y-4">
      {messages && messages.length > 0 ? (
        <ScrollArea className="h-[500px] w-full rounded-md border p-4">
          {messages.map((message) => (
            <Card key={message.id} className="mb-4">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-1">{message.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No messages yet
        </div>
      )}
    </div>
  );
};

export default Messages;