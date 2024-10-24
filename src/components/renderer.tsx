import Quill from "quill";
import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import { Delta, Op } from "quill/core";

interface RendererProps {
  value: string;
}
const Renderer = ({ value }: RendererProps) => {
  const [isEmpty, setIsEmpty] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rendererRef.current) return;

    const container = rendererRef.current;

    const quill = new Quill(document.createElement("div"), {
      theme: "snow",
    });

    const contents = JSON.parse(value);
    let inputArray: any[] = [];
    if (typeof contents === "string") {
      contents.split("\n").forEach((element) => {
        const op1 = { insert: element };
        const op2 = { insert: "\n" };
        inputArray.push(op1);
        inputArray.push(op2);
      });
    } else if (typeof contents === "object") {
      inputArray = contents["ops"] as any[];
    }

    quill.setContents(contents, "silent");

    console.log(
      "value: ",
      value,
      " contents:",
      contents,
      " typeof:",
      typeof contents
    );

    // quill.setContents([
    //   { insert: "Hello " },
    //   { insert: "World!", attributes: { bold: true } },
    //   { insert: "\n" },
    // ]);

    const isEmpty =
      quill
        .getText()
        .replace(/<(.|\n)*?>/g, "")
        .trim().length === 0;
    setIsEmpty(isEmpty);
    container.innerHTML = quill.root.innerHTML;

    console.log("getText: ", quill.getText(), " isEmpty:", isEmpty);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [value]);

  if (isEmpty) return null;

  return <div ref={rendererRef} className="ql-editor ql-renderer" />;
};

export default Renderer;
