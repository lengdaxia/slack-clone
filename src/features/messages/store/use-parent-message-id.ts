import { useQueryState } from "nuqs";
// <==> localhost:3000?parentMessageId=null
// const [parentMessageId, setParentMessageId] = useState(null);

export const useParentMessageId = () => {
  return useQueryState("parentMessageId");
};
