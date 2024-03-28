import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const NillionOnboarding = () => {
  return (
    <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-m rounded-3xl">
      <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
      <p>To connect with your Nillion user key...</p>
      <ol className="block my-4">
        <li>- Download the MetaMask Flask browser extension to get access to MetaMask Snap</li>
        <li>- Temporarily disable any other wallet browser extensions - (Classic MetaMask, Rainbow Wallet, etc.)</li>
        <li>
          - Visit{" "}
          <Link href="https://nillion-snap-site.vercel.app" target="_blank" passHref className="link">
            Nillion Key Management UI
          </Link>{" "}
          to generate a user key
        </li>
        <li>- Come back and connect to the snap</li>
      </ol>
    </div>
  );
};
