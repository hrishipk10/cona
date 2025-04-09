
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const [pendingInterviews, setPendingInterviews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPendingInterviews = async () => {
      setIsLoading(true);
      const { count, error } = await supabase
        .from("interviews")
        .select("*", { count: 'exact' })
        .eq("status", "scheduled");
      
      if (error) {
        console.error("Error fetching pending interviews:", error);
      } else {
        setPendingInterviews(count || 0);
      }
      setIsLoading(false);
    };

    fetchPendingInterviews();

    // Set up a subscription to interview status changes
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'interviews',
        },
        () => {
          fetchPendingInterviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] sm:w-[300px] pl-8"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {pendingInterviews > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {pendingInterviews}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  {pendingInterviews} interview{pendingInterviews !== 1 ? 's' : ''} waiting for candidate response.
                </p>
              </div>
              {pendingInterviews > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => navigate('/admin/messages')}
                  className="w-full"
                >
                  View All Interviews
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
