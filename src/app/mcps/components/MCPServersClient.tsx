"use client";
import { createClient } from "@/supabase/client";
import { MCPServerCard } from "./MCPServerCard";
import { EmptyState } from "./EmptyState";
import { AddMCPServerButton } from "./AddMCPServerButton";
import { AddMCPServerModal } from "./AddMCPServerModal";
import { EditMCPServerModal } from "./EditMCPServerModal";
import type { Database } from "@/database.types";
import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

type MCPServer = Database["public"]["Tables"]["mcp_servers"]["Row"];
type MCPServerInsert = Database["public"]["Tables"]["mcp_servers"]["Insert"];

interface MCPServersClientProps {
  initialServers: { servers: MCPServer[]; error?: string };
}

export function MCPServersClient({ initialServers }: MCPServersClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [servers, setServers] = useState<MCPServer[]>(initialServers.servers);

  const [deleteTarget, setDeleteTarget] = useState<MCPServer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const client = createClient();

  const handleAddNew = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedServer(null);
  };

  const onCreated = (_server: MCPServerInsert) => {
    setIsAddModalOpen(false);
  };

  const onUpdated = (_server: MCPServer) => {
    setIsEditModalOpen(false);
    setSelectedServer(null);
  };

  // const handleConnect = (_server: MCPServer) => {
  //   // TODO: Implement connect
  // };

  const handleEdit = (server: MCPServer) => {
    setSelectedServer(server);
    setIsEditModalOpen(true);
  };

  const handleDelete = (server: MCPServer) => {
    setDeleteTarget(server);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const { error } = await client
        .from("mcp_servers")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete server",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setDeleteError(null);
  };

  useEffect(() => {
    const subscription: RealtimeChannel = client
      .channel("mcp_servers_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mcp_servers",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setServers((prev) => [payload.new as MCPServer, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setServers((prev) =>
              prev.map((server) =>
                server.id === (payload.new as MCPServer).id
                  ? (payload.new as MCPServer)
                  : server,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setServers((prev) =>
              prev.filter(
                (server) => server.id !== (payload.old as MCPServer).id,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      return void subscription?.unsubscribe();
    };
  }, [client]);

  return (
    <>
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">MCP Servers</h1>
        <AddMCPServerButton onClick={handleAddNew} />
      </div>

      {/* Error State */}
      {initialServers.error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-4 text-red-500">
          <p className="font-medium">Error loading servers</p>
          <p className="text-sm">{initialServers.error}</p>
        </div>
      )}

      {/* Server List Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servers.length > 0 ? (
          servers.map((server) => (
            <MCPServerCard
              key={server.id}
              server={server}
              // onConnect={handleConnect}
              onSettings={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <EmptyState onAddNew={handleAddNew} />
        )}
      </div>

      <AddMCPServerModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onCreated={onCreated}
      />

      {selectedServer && (
        <EditMCPServerModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdated={onUpdated}
          server={selectedServer}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-[#2e026d] p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-white">
              Delete MCP Server
            </h2>
            <p className="mb-4 text-white">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-400">
                {deleteTarget.name}
              </span>
              ?
              <br />
              This action cannot be undone.
            </p>
            {deleteError && (
              <p className="mb-2 text-sm text-red-400">{deleteError}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="cursor-pointer rounded-lg border border-white/20 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
