const {
  Listbox: ActualListbox,
  Dialog: ActualDialog,
  Modal: ActualModal,
  Disclosure: ActualDisclosure,
  Menu: ActualMenu,
  Switch: ActualSwitch,
} = jest.requireActual("@headlessui/react");

export const Listbox = ActualListbox;
export const Dialog = ActualDialog;
export const Modal = ActualModal;
export const Menu = ActualMenu;
export const Switch = ActualSwitch;
export const Disclosure = ActualDisclosure;
export const Transition = ({ children, role, show, ...props }) => {
  if (!show) return null;
  return (
    <div role={role} aria-selected={props["aria-selected"]}>
      {children}
    </div>
  );
};
Transition.Root = ({ children, role, ...props }) => {
  return <div>{children}</div>;
};
Transition.Child = ({ children }) => {
  return <div>{children}</div>;
};
