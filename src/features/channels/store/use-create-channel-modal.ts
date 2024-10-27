import { atom, useAtom } from "jotai";

const modelState = atom(false);

export const useCreateChannelModal = () => {
  const [open, setOpen] = useAtom(modelState);
  return { open, setOpen };
  // return useAtom(modelState);
};
