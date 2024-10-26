"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { usePanel } from "@/app/hooks/use-panel";
import { Loader } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { ThreadMessageList } from "@/features/messages/components/thread-message-list";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  const { parentMessageId, onClose } = usePanel();

  const showPanel = !!parentMessageId;

  return (
    <div className="h-full">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={"lyq-workspace-layout"}
        >
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className="bg-[#5E2C5F]"
          >
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={20}>{children}</ResizablePanel>
          {showPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel minSize={20} defaultSize={29}>
                {parentMessageId ? (
                  <ThreadMessageList
                    messageId={parentMessageId as Id<"messages">}
                    onClose={onClose}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
