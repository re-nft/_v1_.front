import React from "react";
import { animated, useTransition, useSpring } from "react-spring";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { isMobile } from "react-device-detect";
import { useGesture } from "react-use-gesture";
import clsx from "clsx";

const AnimatedDialogOverlay = animated(DialogOverlay);

const AnimatedDialogContent = animated(DialogContent);

interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  minHeight?: number | false;
  maxHeight?: number;
  initialFocusRef?: React.RefObject<unknown>;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen = false,
  onDismiss,
  minHeight = false,
  maxHeight = 90,
  initialFocusRef,
  children,
}) => {
  const fadeTransition = useTransition(isOpen, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  const [{ y }, set] = useSpring(() => ({
    y: 0,
    config: { mass: 1, tension: 210, friction: 20 },
  }));
  const bind = useGesture({
    onDrag: (state) => {
      set({
        y: state.down ? state.movement[1] : 0,
      });
      if (
        state.movement[1] > 300 ||
        (state.velocity > 3 && state.direction[1] > 0)
      ) {
        onDismiss();
      }
    },
  });

  return (
    <>
      {fadeTransition(
        (props, item) =>
          item && (
            <AnimatedDialogOverlay
              as="div"
              className="animated-dialog-overlay"
              style={props}
              onDismiss={onDismiss}
              initialFocusRef={initialFocusRef}
              unstable_lockFocusAcrossFrames={false}
            >
              <AnimatedDialogContent
                {...(isMobile
                  ? {
                      ...bind(),
                      style: {
                        transform: y.to(
                          (y) => `translateY(${y > 0 ? y : 0}px)`
                        ),
                        maxHeight: maxHeight ? `${maxHeight}vh` : "",
                        minHeight: minHeight ? `${minHeight}vw` : "",
                      },
                    }
                  : {})}
                aria-label="dialog content"
                as="div"
                className={clsx(
                  isMobile && "mobile",
                  "animated-dialog-content"
                )}
              >
                {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                {children}
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </>
  );
};
