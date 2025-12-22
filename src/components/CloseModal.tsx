import React from "react";
import { X } from "lucide-react";

type CallbackFunction = () => void;

type CloseModalProps = {
  onClick: CallbackFunction;
};

const CloseModal = ({ onClick }: CloseModalProps) => {
  return (
    <div className="absolute top-2 right-2 clickable" onClick={onClick}>
      <X size={24} />
    </div>
  );
};

export default CloseModal;
