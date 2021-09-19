import React from "react";
import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import CheckCircleIcon from "@heroicons/react/outline/CheckCircleIcon";
import InformationCircleIcon from "@heroicons/react/outline/InformationCircleIcon";
import ExclamationIcon from "@heroicons/react/outline/ExclamationIcon";
import XIcon from "@heroicons/react/solid/XIcon";
import { useSnackProvider } from "../../hooks/store/useSnackProvider";

export const SnackAlert: React.FC = () => {
  const {
    hideError: closeAlert,
    errorIsShown: open,
    message,
    type,
  } = useSnackProvider();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-40"
      onClick={closeAlert}
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
        <Transition
          show={open}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="max-w-sm w-full bg-white pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden shadow-rn-one-purple border-4 border-rn-purple z-30 relative">
            <div className="p-2">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {type === "info" && (
                    <InformationCircleIcon
                      className="h-6 w-6 text-blue-400"
                      aria-hidden="true"
                    />
                  )}
                  {type === "success" && (
                    <CheckCircleIcon
                      className="h-6 w-6 text-rn-green"
                      aria-hidden="true"
                    />
                  )}
                  {type === "warning" && (
                    <ExclamationIcon
                      className="h-6 w-6 text-rn-red"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  {/* <p className="text-sm font-medium text-rn-purple-dark">{type}</p> */}
                  <p className="mt-1 text-base text-rn-purple uppercase">
                    {message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white  inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={closeAlert}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};
