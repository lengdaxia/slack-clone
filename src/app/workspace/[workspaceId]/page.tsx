import { useParams } from "next/navigation";

interface WorkspaceIdPageProps {
  params: {
    workspaceId: number
  }
}

const WorkspaceIdPage = ({params}: WorkspaceIdPageProps) => {
  console.log(params);
  return <div className="">ID:{params.workspaceId}</div>;
};

export default WorkspaceIdPage;