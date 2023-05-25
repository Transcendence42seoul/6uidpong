import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

import ImageSrc from '../../constants/ImageSrc';

const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
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
            className="inline-block transform rounded-lg border-8 bg-white p-7 px-8 py-6 text-left align-middle shadow-xl transition-all group-hover:scale-105 group-hover:border-pink-300 group-hover:bg-pink-300 sm:my-8 sm:h-3/4 sm:w-2/3 sm:max-w-xl sm:align-middle"
            style={{
              backgroundImage: `url(${ImageSrc.MODAL_IMAGE})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              pointerEvents: 'none',
            }}
          >
            <div className="absolute inset-0 text-white" />
            {children}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
