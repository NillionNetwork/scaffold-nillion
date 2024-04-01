import { CopyString } from "~~/components/nillion/CopyString";
import { retrieveSecretCommand } from "~~/utils/nillion/retrieveSecretCommand";

const RetrieveSecretCommand: React.FC<{
  userKey: string | null;
  storeId: string | null;
  secretName: string;
  secretType: string;
}> = ({ userKey, storeId, secretName, secretType }) => {
  return (
    <span>
      ✅ Stored {secretType} {secretName} <br /> <CopyString str={storeId || ""} textBefore={`store_id: `} full />
      <br />
      <p>
        👀 Optional: Copy and run the following command to retrieve-secret from the command line to see the value of{" "}
        {secretName} using the nillion SDK tool
      </p>
      <CopyString str={retrieveSecretCommand(userKey, storeId, secretName)} start={30} end={30} code />
    </span>
  );
};

export default RetrieveSecretCommand;
