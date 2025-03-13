
import React from "react";
import { Database } from "@/integrations/supabase/types";
import CVCard from "./CVCard";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type Interview = Database["public"]["Tables"]["interviews"]["Row"] & { cvs?: { applicant_name: string } };

interface CVsListProps {
  cvs: CV[];
  interviews?: Interview[];
  onSendMessage: (cvId: string) => void;
  message: string;
  setMessage: (message: string) => void;
  isSendingMessage: boolean;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedCvId: string | null;
  setSelectedCvId: (id: string | null) => void;
  status: "accepted" | "rejected";
}

const CVsList: React.FC<CVsListProps> = ({
  cvs,
  interviews,
  onSendMessage,
  message,
  setMessage,
  isSendingMessage,
  selectedDate,
  setSelectedDate,
  selectedCvId,
  setSelectedCvId,
  status
}) => {
  // Helper function to find interview for a CV
  const findInterviewForCv = (cvId: string) => {
    return interviews?.find(interview => interview.cv_id === cvId);
  };

  if (cvs.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg">
        <p className="text-gray-500">No {status} applications yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {cvs.map((cv) => (
        <CVCard
          key={cv.id}
          cv={cv}
          interview={findInterviewForCv(cv.id)}
          onSendMessage={onSendMessage}
          message={message}
          setMessage={setMessage}
          isSendingMessage={isSendingMessage}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedCvId={selectedCvId}
          setSelectedCvId={setSelectedCvId}
        />
      ))}
    </div>
  );
};

export default CVsList;
