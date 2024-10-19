import React from "react";

type CallbackFunction = () => void;

type CloseModalProps = {
  onClick: CallbackFunction;
}

const CloseModal = ({ onClick }: CloseModalProps) => {
  return (
    <div className="ui__modal-close-wrap absolute top-2 right-2" onClick={onClick}>
      <a aria-label="Close" type="button" className="ui__modal-close">
        <svg
          stroke="currentColor"
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6"
        >
          <path
            d="M6 18L18 6M6 6l12 12"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          ></path>
        </svg>
      </a>
    </div>
  );
};

export default CloseModal;
