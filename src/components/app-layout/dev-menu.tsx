import { MintNfts } from "../dev/mint-nfts";
import { MintTokens } from "../dev/mint-token";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import XIcon from "@heroicons/react/outline/XIcon";

export const DevMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const showMint = process.env.NEXT_PUBLIC_SHOW_MINT === "true";

  if (!showMint) return null;

  return (
    <div>
      <div className="ml-8">
        <button
          onClick={() => {
            setOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm uppercase
              text-sm font-display tracking-widest font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {open ? "Hide mint sidebar": "Show mint sidebar"}
        </button>
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 overflow-hidden z-30"
          onClose={setOpen}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Dialog.Overlay className="absolute inset-0" />

            <div className="fixed inset-y-0 left-0 max-w-full flex">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <div className="w-screen max-w-md">
                  <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Mint functionality
                        </Dialog.Title>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 relative flex-1 px-4 sm:px-6">
                      <div className="absolute inset-0 px-4 sm:px-6">
                        <div className="h-full" aria-hidden="true">
                          <div className="space-y-2">
                            <MintNfts />
                            <MintTokens />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};
