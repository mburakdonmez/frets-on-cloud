import { PlusIcon } from "@heroicons/react/24/outline";

interface EmptyStateProps {
  onAddNew: () => void;
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-6 text-center">
      <div>
        <p className="mb-2 text-lg font-semibold">No servers added yet</p>
        <p className="mb-4 text-sm text-gray-400">
          Click the &quot;Add New Server&quot; button to get started
        </p>
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 rounded-lg bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[hsl(280,100%,60%)]"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Server
        </button>
      </div>
    </div>
  );
}
