import { atom, useAtom } from "jotai";

const modelState = atom(false);

export const useInviteNewMemberModal = () => {
  const [open, setOpen] = useAtom(modelState);
  return { open, setOpen };
};
