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
    quill.setContents(contents);

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
