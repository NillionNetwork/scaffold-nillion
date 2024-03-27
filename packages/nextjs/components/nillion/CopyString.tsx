import CopyToClipboard from "react-copy-to-clipboard";
import DocumentDuplicateIcon from "@heroicons/react/24/outline/DocumentDuplicateIcon";
import { shortenKeyHelper } from "~~/utils/scaffold-eth/shortenKeyHelper";

export const CopyString: React.FC<{
  str: string;
  start?: number;
  end?: number;
  textBefore?: string;
  full?: boolean;
}> = ({ str, textBefore = "", start = 5, end = 5, full }) => {
  return (
    <span className="flex">
      {textBefore}
      {full ? str : shortenKeyHelper(str, start, end)}
      <CopyToClipboard text={str}>
        <DocumentDuplicateIcon
          className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
          aria-hidden="true"
        />
      </CopyToClipboard>
    </span>
  );
};
