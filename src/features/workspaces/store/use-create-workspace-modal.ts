import { atom, useAtom } from "jotai";

const modelState = atom(false);

export const useCreateWorkspaceModal = () => {
  const [open, setOpen] = useAtom(modelState);
  return { open, setOpen };
};
