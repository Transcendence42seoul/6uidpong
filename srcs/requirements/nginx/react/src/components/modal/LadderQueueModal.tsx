import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

const LadderQueueModal = ({
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
        className="flex h-1/2 w-1/2 flex-col items-center justify-center border-4 border-white bg-black p-4 text-center text-white"
        onClose={onClose}
      >
        <div className="mb-10 flex h-[60%] items-center justify-center">
          {children}
        </div>
      </Dialog>
    </Transition>
  );
};

export default LadderQueueModal;
