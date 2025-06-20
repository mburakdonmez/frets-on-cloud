import { PlusIcon } from "@heroicons/react/24/outline";

interface AddMCPServerButtonProps {
  onClick: () => void;
}

export function AddMCPServerButton({ onClick }: AddMCPServerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 rounded-lg bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[hsl(280,100%,60%)]"
    >
      <PlusIcon className="h-5 w-5" />
      Add Server
    </button>
  );
}
