import React, {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import "quill/dist/quill.snow.css";
import { useRef } from "react";
import Quill, { type QuillOptions } from "quill";
import { Button } from "./ui/button";
import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";
import { ImageIcon, Smile, XIcon } from "lucide-react";
import { Hint } from "./hint";
import { Delta, Op } from "quill/core";
import { cn } from "@/lib/utils";
import { EmojiPopover } from "./emoji-popover";
import Image from "next/image";

type EditorValue = {
  image: File | null;
  body: string;
};
interface EditorProps {
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disable?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
  variant?: "create" | "update";
}

const Editor = ({
  onCancel,
  onSubmit,
  placeholder = "Write here..",
  defaultValue = [],
  disable = false,
  innerRef,
  variant = "create",
}: EditorProps) => {
  const [text, setText] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const [isToolbarVisible, setisToolbarVisible] = useState(true);

  const editorRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);
  const quillRef = useRef<Quill | null>(null);
  const placeholderRef = useRef(placeholder);
  const defaultValueRef = useRef(defaultValue);
  const disableRef = useRef(disable);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disableRef.current = disable;
  });

  useEffect(() => {
    if (!editorRef.current) return;

    // init quill editor
    const container = editorRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );

    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        // toolbar: ["bold","italic","strike"],
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                const text = quill.getText();
                const addedImage = imageRef.current?.files?.[0] || null;

                const isEmpty =
                  !addedImage &&
                  text.replace(/<(.|\n)*?>/g, "").trim().length === 0;
                if (isEmpty) return;

                const body = JSON.stringify(quill.getContents());
                submitRef.current?.({ body, image: addedImage });
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                // insert a \n symbol to the last text position to change line
                quill.insertText(quill.getSelection()?.index || 0, "\n");
              },
            },
          },
        },
      },
    };

    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();

    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) {
        container.innerHTML = "";
      }

      if (quillRef.current) {
        quillRef.current = null;
      }

      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  const toogleToobar = () => {
    setisToolbarVisible((prev) => !prev);
    const toolbarElement = editorRef.current?.querySelector(".ql-toolbar");
    if (toolbarElement) {
      toolbarElement.classList.toggle("hidden");
    }
  };

  const onEmojiSelect = (emoji: any) => {
    const quill = quillRef.current;

    quill?.insertText(quill?.getSelection()?.index || 0, emoji.native);
  };

  const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

  return (
    <div className="flex flex-col">
      <input
        type="file"
        accept="image/*"
        ref={imageRef}
        onChange={(e) => setImage(e.target.files![0])}
        className="hidden"
      />
      <div
        className={cn(
          "flex flex-col border border-slate200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white",
          disable && "opacity-50"
        )}
      >
        <div ref={editorRef} className="h-full ql-custom"></div>
        {!!image && (
          <div className="p-2">
            <div className="relative size-[62px] flex items-center justify-center group/image ">
              <button
                onClick={() => {
                  setImage(null);
                  imageRef.current!.value = "";
                }}
                className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center"
              >
                <XIcon className="size-3.5" />
              </button>
              <Image
                src={URL.createObjectURL(image)}
                alt="uploaded"
                fill
                className="object-cover rounded-md border overflow-hidden"
              />
            </div>
          </div>
        )}
        <div className="flex px-2 pb-2 z-[5]">
          <Hint
            label={isToolbarVisible ? "Hide formatting" : "Show formatting"}
          >
            <Button
              disabled={disable}
              onClick={toogleToobar}
              className={cn(
                "transition",
                isToolbarVisible
                  ? "bg-white"
                  : "bg-accent text-muted-foreground"
              )}
              variant={"ghost"}
              size={"iconSm"}
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>
          <EmojiPopover hint="Emoji" onEmojiSelect={onEmojiSelect}>
            <Button disabled={disable} variant={"ghost"} size={"iconSm"}>
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>
          {variant === "create" && (
            <Hint label="Image">
              <Button
                disabled={disable}
                onClick={() => {
                  imageRef.current?.click();
                }}
                variant={"ghost"}
                size={"iconSm"}
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {variant === "create" && (
            <Button
              size={"iconSm"}
              disabled={disable || isEmpty}
              onClick={() => {
                onSubmit({
                  body: JSON.stringify(quillRef.current?.getContents()),
                  image: image,
                });
              }}
              className={cn(
                "ml-auto",
                isEmpty
                  ? "bg-white hover:bg-white text-muted-foreground"
                  : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              )}
            >
              <MdSend className="size-4" />
            </Button>
          )}
          {variant === "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                variant={"outline"}
                size={"sm"}
                disabled={disable}
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                size={"sm"}
                disabled={disable || isEmpty}
                onClick={() => {}}
                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end text-muted-foreground p-2 text-[10px]">
        <p>
          <strong>Shift+Return</strong> to add a new line
        </p>
      </div>
    </div>
  );
};
export default Editor;
