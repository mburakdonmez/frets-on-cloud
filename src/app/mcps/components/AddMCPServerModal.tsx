import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Database } from "@/database.types";
import { useRef, useState } from "react";
import { z } from "zod/v4";
import { api } from "@/trpc/react";
import { auth } from "@modelcontextprotocol/sdk/client/auth.js";
import { InspectorOAuthClientProvider } from "../../../utils/oauth/auth";

type MCPServer = Database["public"]["Tables"]["mcp_servers"]["Insert"];
type MCPServerRow = Database["public"]["Tables"]["mcp_servers"]["Row"];
type TransportType = Database["public"]["Enums"]["mcp_transport"];
type AuthType = Database["public"]["Enums"]["auth_type"];

interface AddMCPServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (server: MCPServerRow) => void;
}

export const mcpServerModel = z
  .object({
    name: z.string().min(1, "Server name is required"),
    version: z.string().min(1, "Version is required"),
    auth_type: z.enum(["none", "token", "oauth"]),
  })
  .and(
    z.discriminatedUnion("transport", [
      z.object({
        transport: z.enum([
          "SSEClientTransport",
          // "StdioClientTransport", // Not supported, hence not allowed
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
  )
  .and(
    z.discriminatedUnion("auth_type", [
      z.object({
        auth_type: z.literal("none"),
      }),
      z.object({
        auth_type: z.literal("token"),
        auth_token: z.string().min(1, "Auth token is required"),
      }),
      z.object({
        auth_type: z.literal("oauth"),
        oauth_authorization_server: z.url().optional().or(z.literal("")),
        oauth_client_id: z.string().min(1).optional().or(z.literal("")),
        oauth_client_secret: z.string().min(1).optional().or(z.literal("")),
      }),
    ]),
  );

type FormErrors = {
  name?: string;
  version?: string;
  transport?: string;
  url?: string;
  auth_type?: string;
  auth_token?: string;
  oauth_authorization_server?: string;
  oauth_client_id?: string;
  oauth_client_secret?: string;
};

export function AddMCPServerModal({
  isOpen,
  onClose,
  onCreated,
}: AddMCPServerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authType, setAuthType] = useState<AuthType>("none");
  const mcpCreateMutation = api.mcp.create.useMutation();

  const oauthError = mcpCreateMutation.data?.oauthError;
  const oauthStatusMessage = mcpCreateMutation.data?.oauthStatusMessage;

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
      auth_type: formData.get("auth_type") as AuthType,
      ...(formData.get("auth_type") === "token" && {
        auth_token: formData.get("auth_token") as string,
      }),
      // OAuth fields are no longer directly submitted by the form
    };

    try {
      const validatedData = mcpServerModel.parse(data);

      const authProvider = new InspectorOAuthClientProvider(validatedData.url);
      const authResult = await auth(authProvider, {
        serverUrl: validatedData.url,
      });
      console.log({ authResult });

      // const result = await mcpCreateMutation.mutateAsync(validatedData);

      // if (!result.oauthError) {
      //   // Close only if no OAuth error
      //   onCreated?.(result.server);
      //   onClose();
      // }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: FormErrors = {};
        error.issues.forEach((err) => {
          const path = err.path[0] as keyof FormErrors;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        setErrors({ url: error.message });
      } else {
        console.error("Unknown error", error);
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
          <h2 className="text-2xl font-bold text-white">Add New MCP Server</h2>
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
              className={`w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:outline-none ${
                errors.url ? "border border-red-500" : ""
              }`}
              placeholder="https://example.com"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-500">{errors.url}</p>
            )}
          </div>

          {/* Auth Type */}
          <div>
            <label
              htmlFor="auth_type"
              className="mb-1 block text-sm font-medium text-gray-300"
            >
              Authentication Type
            </label>
            <select
              id="auth_type"
              name="auth_type"
              required
              value={authType}
              onChange={(e) => setAuthType(e.target.value as AuthType)}
              className={`w-full rounded-lg bg-white/10 px-4 py-2 text-white focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:outline-none ${
                errors.auth_type ? "border border-red-500" : ""
              }`}
            >
              <option value="none">None</option>
              <option value="token">Token</option>
              <option value="oauth">OAuth</option>
            </select>
            {errors.auth_type && (
              <p className="mt-1 text-sm text-red-500">{errors.auth_type}</p>
            )}
          </div>

          {/* Token Auth Fields */}
          {authType === "token" && (
            <div>
              <label
                htmlFor="auth_token"
                className="mb-1 block text-sm font-medium text-gray-300"
              >
                Auth Token
              </label>
              <input
                type="password"
                id="auth_token"
                name="auth_token"
                required
                autoComplete="off"
                data-1p-ignore
                className={`w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:outline-none ${
                  errors.auth_token ? "border border-red-500" : ""
                }`}
                placeholder="Enter auth token"
              />
              {errors.auth_token && (
                <p className="mt-1 text-sm text-red-500">{errors.auth_token}</p>
              )}
            </div>
          )}

          {/* OAuth explanation */}
          {authType === "oauth" && (
            <div className="rounded-lg border border-white/20 bg-white/5 p-4 text-sm text-gray-300">
              {oauthStatusMessage && (
                <p className="mb-2 text-green-400">{oauthStatusMessage}</p>
              )}
              {oauthError && <p className="mb-2 text-red-500">{oauthError}</p>}
              {!oauthStatusMessage && !oauthError && (
                <p>
                  OAuth configuration will be fetched automatically from the
                  provided Server URL after creation.
                </p>
              )}
            </div>
          )}

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
              {isSubmitting
                ? authType === "oauth"
                  ? "Setting up OAuth..."
                  : "Creating..."
                : "Create Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
