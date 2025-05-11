import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import Dialog from "../components/Dialog";

interface DialogContextType {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<
    ((value: void | boolean) => void) | null
  >(null);

  const alert = (msg: string, t?: string) => {
    setTitle(t);
    setMessage(msg);
    setShowCancel(false);
    setOpen(true);
    return new Promise<void>((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const confirm = (msg: string, t?: string) => {
    setTitle(t);
    setMessage(msg);
    setShowCancel(true);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    setOpen(false);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  };

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <Dialog
        open={open}
        title={title}
        message={message}
        showCancel={showCancel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmLabel={showCancel ? "Yes" : "OK"}
        cancelLabel="No"
      />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within a DialogProvider");
  return ctx;
};
