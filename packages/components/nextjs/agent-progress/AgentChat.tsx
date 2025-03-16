import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAvatar,
} from "@/components/chat/chat-bubble";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { CornerDownLeft } from "lucide-react";
import ChatInput from "@/components/chat/chat-input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function AgentChat({
  onChatSendUrl,
}: {
  onChatSendUrl?: string;
}) {
  return (
    <Card className="w-[500px] h-[700px] flex flex-col">
      <CardContent className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ChatMessageList></ChatMessageList>
        </div>
      </CardContent>
      <CardFooter className="border-t p-3">
        <form
          action={onChatSendUrl}
          method="POST"
          className="relative w-full rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            placeholder="Type your message here..."
            className="min-h-12 w-full resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key == "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="flex items-center p-3 pt-0">
            <Button size="sm" className="ml-auto gap-1.5">
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
