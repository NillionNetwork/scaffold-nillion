import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark as style } from "react-syntax-highlighter/dist/cjs/styles/prism";

const CodeSnippet: React.FC<{ program_name: string }> = ({ program_name }) => {
  const [code, setCode] = useState("");

  useEffect(() => {
    // Fetch the code from the file in the public folder
    fetch(`/programs/${program_name}.py`)
      .then(response => response.text())
      .then(setCode)
      .catch(console.error);
  }, [program_name]);

  return (
    <SyntaxHighlighter language="python" style={style}>
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeSnippet;
