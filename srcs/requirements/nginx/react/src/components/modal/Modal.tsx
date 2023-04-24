import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "../../constants/Image";

function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-y-auto"
        onClose={onClose}
      >
        <div className="h-screen px-4 text-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div
            className="border-8 p-7 group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300 inline-block align-middle bg-white rounded-lg px-8 py-6 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:h-3/4 sm:w-2/3"
            style={{
              backgroundImage: `url(${Image.MODAL_IMAGE})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              pointerEvents: "none",
            }}
          >
            <div className="absolute inset-0 text-white"></div>
            {children}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Modal;
