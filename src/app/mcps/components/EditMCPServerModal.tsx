import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Database } from "@/database.types";
import { useRef, useState } from "react";
import { createClient } from "@/supabase/client";
import { z } from "zod/v4";

type MCPServer = Database["public"]["Tables"]["mcp_servers"]["Row"];
type TransportType = Database["public"]["Enums"]["mcp_transport"];

interface EditMCPServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (server: MCPServer) => void;
  server: MCPServer;
}

export const mcpServerModel = z
  .object({
    name: z.string().min(1, "Server name is required"),
    version: z.string().min(1, "Version is required"),
  })
  .and(
    z.discriminatedUnion("transport", [
      z.object({
        transport: z.enum([
          "SSEClientTransport",
          "StreamableHTTPClientTransport",
        ]),
        url: z
          .string()
          .url("Invalid URL format")
          .refine(
            (url) => url.startsWith("http://") || url.startsWith("https://"),
            "URL must start with http:// or https://",
          ),
      }),
      z.object({
        transport: z.enum(["WebSocketClientTransport"]),
        url: z
          .string()
          .url("Invalid URL format")
          .refine(
            (url) => url.startsWith("ws://") || url.startsWith("wss://"),
            "URL must start with ws:// or wss://",
          ),
      }),
    ]),
  );

type FormErrors = {
  name?: string;
  version?: string;
  transport?: string;
  url?: string;
};

export function EditMCPServerModal({
  isOpen,
  onClose,
  onUpdated,
  server,
}: EditMCPServerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      version: formData.get("version") as string,
      transport: formData.get("transport") as TransportType,
      url: formData.get("url") as string,
    };

    try {
      const validatedData = mcpServerModel.parse(data);
      const client = createClient();
      const user = await client.auth.getUser();

      if (!user.data.user) {
        throw new Error("User not authenticated");
      }

      const response = await client
        .from("mcp_servers")
        .update({
          name: validatedData.name,
          transport: validatedData.transport,
          url: validatedData.url,
          version: validatedData.version,
        })
        .eq("id", server.id)
        .select()
        .single();

      if (response.error) {
        throw new Error(response.error.message);
      }

      onUpdated(response.data);
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: FormErrors = {};
        error.issues.forEach((err) => {
          const path = err.path[0] as keyof FormErrors;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ url: (error as Error).message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-xl bg-[#2e026d] p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Edit MCP Server</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Server Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-300"
            >
              Server Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              autoComplete="off"
              data-1p-ignore
              defaultValue={server.name}
              className={`w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:outline-none ${
                errors.name ? "border border-red-500" : ""
              }`}
              placeholder="Enter server name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Version */}
          <div>
            <label
              htmlFor="version"
              className="mb-1 block text-sm font-medium text-gray-300"
            >
              Version
            </label>
            <input
              type="text"
              id="version"
              name="version"
              required
              autoComplete="off"
              data-1p-ignore
              defaultValue={server.version}
              className={`w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:outline-none ${
                errors.version ? "border border-red-500" : ""
              }`}
              placeholder="e.g. 1.0.0"
            />
            {errors.version && (
              <p className="mt-1 text-sm text-red-500">{errors.version}</p>
            )}
          </div>

          {/* Transport Type */}
          <div>
            <label
              htmlFor="transport"
              className="mb-1 block text-sm font-medium text-gray-300"
            >
              Transport Type
            </label>
            <select
              id="transport"
              name="transport"
              required
              autoComplete="off"
              data-1p-ignore
              defaultValue={server.transport}
              className={`w-full rounded-lg bg-white/10 px-4 py-2 text-white focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:outline-none ${
                errors.transport ? "border border-red-500" : ""
              }`}
            >
              <option value="">Select transport type</option>
              <option value="SSEClientTransport">SSE Client Transport</option>
              <option value="StreamableHTTPClientTransport">
                Streamable HTTP Client Transport
              </option>
              <option value="WebSocketClientTransport">
                WebSocket Client Transport
              </option>
            </select>
            {errors.transport && (
              <p className="mt-1 text-sm text-red-500">{errors.transport}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="url"
              className="mb-1 block text-sm font-medium text-gray-300"
            >
              Server URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              required
              autoComplete="off"
              data-1p-ignore
              defaultValue={server.url}
              className={`w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:outline-none ${
                errors.url ? "border border-red-500" : ""
              }`}
              placeholder="https://example.com"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-500">{errors.url}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-white/20 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-[hsl(280,100%,70%)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[hsl(280,100%,60%)] disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
