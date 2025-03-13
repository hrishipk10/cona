
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { useMessagesInterviews } from "@/hooks/useMessagesInterviews";
import Sidebar from "@/components/messages/Sidebar";
import Header from "@/components/messages/Header";
import CVsList from "@/components/messages/CVsList";

const MessagesInterviewsPage: React.FC = () => {
  const {
    acceptedCvs,
    rejectedCvs,
    interviews,
    cvsLoading,
    interviewsLoading,
    selectedDate,
    setSelectedDate,
    selectedCvId,
    setSelectedCvId,
    message,
    setMessage,
    isSendingMessage,
    handleSendMessage,
    handleLogout
  } = useMessagesInterviews();

  if (cvsLoading || interviewsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-primary relative hidden md:flex flex-col items-center justify-center p-8 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="ml-[88px] p-6 w-full">
        <Header onLogout={handleLogout} />

        <Tabs defaultValue="accepted" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="accepted">Accepted CVs</TabsTrigger>
            <TabsTrigger value="rejected">Rejected CVs</TabsTrigger>
          </TabsList>

          <TabsContent value="accepted">
            <CVsList
              cvs={acceptedCvs}
              interviews={interviews}
              onSendMessage={handleSendMessage}
              message={message}
              setMessage={setMessage}
              isSendingMessage={isSendingMessage}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedCvId={selectedCvId}
              setSelectedCvId={setSelectedCvId}
              status="accepted"
            />
          </TabsContent>

          <TabsContent value="rejected">
            <CVsList
              cvs={rejectedCvs}
              interviews={interviews}
              onSendMessage={handleSendMessage}
              message={message}
              setMessage={setMessage}
              isSendingMessage={isSendingMessage}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedCvId={selectedCvId}
              setSelectedCvId={setSelectedCvId}
              status="rejected"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MessagesInterviewsPage;
