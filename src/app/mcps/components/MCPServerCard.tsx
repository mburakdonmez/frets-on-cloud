import {
  ArrowTopRightOnSquareIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { Database } from "@/database.types";
import Link from "next/link";

type MCPServer = Database["public"]["Tables"]["mcp_servers"]["Row"];

interface MCPServerCardProps {
  server: MCPServer;
  onSettings: (server: MCPServer) => void;
  onDelete: (server: MCPServer) => void;
}

export function MCPServerCard({
  server,
  onSettings,
  onDelete,
}: MCPServerCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white/5 p-6 transition-all hover:bg-white/10">
      {/* Server Info */}
      <div className="mb-4">
        <h3 className="mb-1 text-xl font-semibold text-white">{server.name}</h3>
        <p className="text-sm text-gray-400">Version {server.version}</p>
      </div>

      {/* Transport Info */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Transport:</span>
          <span className="rounded-full bg-[hsl(280,100%,70%)]/20 px-2 py-0.5 text-xs font-medium text-[hsl(280,100%,70%)]">
            {server.transport}
          </span>
        </div>
        <p className="text-sm break-all text-gray-400">{server.url}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/mcps/${server.id}`}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[hsl(280,100%,60%)]"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          Connect
        </Link>
        <button
          onClick={() => onSettings(server)}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          <PencilIcon className="h-4 w-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(server)}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
        >
          <TrashIcon className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
