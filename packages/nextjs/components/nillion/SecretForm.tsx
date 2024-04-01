import React, { useState } from "react";

interface SecretFormProps {
  onSubmit: (
    secretName: string,
    secret: string,
    permissionedUserIdForRetrieveSecret: string | null,
    permissionedUserIdForUpdateSecret: string | null,
    permissionedUserIdForDeleteSecret: string | null,
    permissionedUserIdForComputeSecret: string | null,
  ) => void;
  secretName: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  secretType: "text" | "number"; // text for SecretBlob, number for SecretInteger
}

const SecretForm: React.FC<SecretFormProps> = ({
  onSubmit,
  secretName,
  isDisabled = false,
  isLoading = false,
  secretType, // Destructure this prop
}) => {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(isLoading);
  const [permissionedUserIdForRetrieveSecret, setPermissionedUserIdForRetrieveSecret] = useState("");
  const [permissionedUserIdForUpdateSecret, setPermissionedUserIdForUpdateSecret] = useState("");
  const [permissionedUserIdForDeleteSecret, setPermissionedUserIdForDeleteSecret] = useState("");
  const [permissionedUserIdForComputeSecret, setPermissionedUserIdForComputeSecret] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSubmit(
      secretName,
      secret,
      permissionedUserIdForRetrieveSecret,
      permissionedUserIdForUpdateSecret,
      permissionedUserIdForDeleteSecret,
      permissionedUserIdForComputeSecret,
    );
    setPermissionedUserIdForRetrieveSecret("");
    setPermissionedUserIdForUpdateSecret("");
    setPermissionedUserIdForDeleteSecret("");
    setPermissionedUserIdForComputeSecret("");
    setSecret("");
  };

  return loading ? (
    "Storing secret..."
  ) : (
    <form onSubmit={handleSubmit} className={isDisabled ? "opacity-50" : ""}>
      <h1>Store secret: {secretName}</h1>
      <div>
        <label htmlFor="secret" className="block text-sm font-medium text-gray-700">
          Set secret value
        </label>
        <input
          type={secretType} // Use the prop here
          id="secret"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          required
          disabled={isDisabled}
          className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            isDisabled ? "cursor-not-allowed bg-gray-100" : "bg-white"
          }`}
        />
      </div>

      {/* can only compute on secret integers - don't show for SecretBlobs */}
      {secretType === "number" && (
        <div className="mt-4">
          <label htmlFor="permissionedUserIdForComputeSecret" className="block text-sm font-medium text-gray-700">
            Optional: Set a user id to grant compute permissions to another user
          </label>
          <input
            type="text"
            id="permissionedUserIdForComputeSecret"
            value={permissionedUserIdForComputeSecret}
            onChange={e => setPermissionedUserIdForComputeSecret(e.target.value)}
            disabled={isDisabled}
            className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              isDisabled ? "cursor-not-allowed bg-gray-100" : "bg-white"
            }`}
          />
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="permissionedUserIdForRetrieveSecret" className="block text-sm font-medium text-gray-700">
          Optional: Set a user id to grant retrieve permissions to another user
        </label>
        <input
          type="text"
          id="permissionedUserIdForRetrieveSecret"
          value={permissionedUserIdForRetrieveSecret}
          onChange={e => setPermissionedUserIdForRetrieveSecret(e.target.value)}
          disabled={isDisabled}
          className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            isDisabled ? "cursor-not-allowed bg-gray-100" : "bg-white"
          }`}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="permissionedUserIdForUpdateSecret" className="block text-sm font-medium text-gray-700">
          Optional: Set a user id to grant update permissions to another user
        </label>
        <input
          type="text"
          id="permissionedUserIdForUpdateSecret"
          value={permissionedUserIdForUpdateSecret}
          onChange={e => setPermissionedUserIdForUpdateSecret(e.target.value)}
          disabled={isDisabled}
          className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            isDisabled ? "cursor-not-allowed bg-gray-100" : "bg-white"
          }`}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="permissionedUserIdForDeleteSecret" className="block text-sm font-medium text-gray-700">
          Optional: Set a user id to grant delete permissions to another user
        </label>
        <input
          type="text"
          id="permissionedUserIdForDeleteSecret"
          value={permissionedUserIdForDeleteSecret}
          onChange={e => setPermissionedUserIdForDeleteSecret(e.target.value)}
          disabled={isDisabled}
          className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            isDisabled ? "cursor-not-allowed bg-gray-100" : "bg-white"
          }`}
        />
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className={`mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isDisabled ? "opacity-75 cursor-not-allowed bg-indigo-400" : "bg-indigo-600"
        }`}
      >
        Submit
      </button>
    </form>
  );
};

export default SecretForm;
