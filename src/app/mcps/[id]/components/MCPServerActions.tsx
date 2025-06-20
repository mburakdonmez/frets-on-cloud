"use client";
import { useState } from "react";
import {
  PlayIcon,
  CodeBracketIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface MCPServer {
  id: number;
  name: string;
  version: string;
  transport: string;
  url: string;
  created_at: string;
}

interface MCPServerActionsProps {
  server: MCPServer;
}

// Mock data for demonstration
const mockActions = [
  {
    name: "getVersion",
    description: "Get the version of the MCP server",
    parameters: [],
    returnType: "string",
  },
  {
    name: "listFunctions",
    description: "List all available functions",
    parameters: [],
    returnType: "string[]",
  },
  {
    name: "executeFunction",
    description: "Execute a function with parameters",
    parameters: [
      { name: "functionName", type: "string", required: true },
      { name: "parameters", type: "object", required: false },
    ],
    returnType: "any",
  },
];

const mockResources = [
  {
    name: "config",
    description: "Server configuration",
    type: "object",
    properties: [
      { name: "maxConnections", type: "number" },
      { name: "timeout", type: "number" },
      { name: "debug", type: "boolean" },
    ],
  },
  {
    name: "status",
    description: "Current server status",
    type: "object",
    properties: [
      { name: "uptime", type: "number" },
      { name: "connections", type: "number" },
      { name: "memory", type: "object" },
    ],
  },
];

export function MCPServerActions({ server: _server }: MCPServerActionsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteAction = async () => {
    setIsExecuting(true);
    // TODO: Implement action execution
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsExecuting(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Actions Section */}
      <div className="rounded-xl bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Actions</h2>
          <button
            onClick={() => setSelectedAction(null)}
            className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {mockActions.map((action) => (
            <div
              key={action.name}
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                selectedAction === action.name
                  ? "border-[hsl(280,100%,70%)] bg-[hsl(280,100%,70%)]/10"
                  : "border-white/10 hover:border-white/20"
              }`}
              onClick={() => setSelectedAction(action.name)}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">{action.name}</h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium">
                  {action.returnType}
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-400">{action.description}</p>
              {action.parameters.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-400">
                    Parameters:
                  </p>
                  {action.parameters.map((param) => (
                    <div
                      key={param.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-300">{param.name}</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                        {param.type}
                        {param.required && (
                          <span className="ml-1 text-red-400">*</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resources Section */}
      <div className="rounded-xl bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Resources</h2>
          <button
            onClick={() => setSelectedResource(null)}
            className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {mockResources.map((resource) => (
            <div
              key={resource.name}
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                selectedResource === resource.name
                  ? "border-[hsl(280,100%,70%)] bg-[hsl(280,100%,70%)]/10"
                  : "border-white/10 hover:border-white/20"
              }`}
              onClick={() => setSelectedResource(resource.name)}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">{resource.name}</h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium">
                  {resource.type}
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-400">
                {resource.description}
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400">Properties:</p>
                {resource.properties.map((prop) => (
                  <div
                    key={prop.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-300">{prop.name}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                      {prop.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Execution Panel */}
      {selectedAction && (
        <div className="col-span-2 rounded-xl bg-white/5 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Execute Action</h2>
              <p className="mt-1 text-sm text-gray-400">
                {
                  mockActions.find((a) => a.name === selectedAction)
                    ?.description
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedAction(null)}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isExecuting}
                className="flex items-center gap-2 rounded-lg bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(280,100%,60%)] disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    Execute
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {mockActions
              .find((a) => a.name === selectedAction)
              ?.parameters.map((param) => (
                <div key={param.name}>
                  <label
                    htmlFor={param.name}
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    {param.name}
                    {param.required && (
                      <span className="ml-1 text-red-400">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    id={param.name}
                    className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:outline-none"
                    placeholder={`Enter ${param.name} (${param.type})`}
                  />
                </div>
              ))}

            <div>
              <label
                htmlFor="response"
                className="mb-1 block text-sm font-medium text-gray-300"
              >
                Response
              </label>
              <div className="relative">
                <pre className="rounded-lg bg-black/50 p-4 font-mono text-sm">
                  {/* <code>// Response will appear here</code> */}
                </pre>
                <button
                  className="absolute top-2 right-2 rounded-lg bg-white/10 p-1 text-gray-400 transition-colors hover:bg-white/20 hover:text-white"
                  title="Copy to clipboard"
                >
                  <CodeBracketIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resource View Panel */}
      {selectedResource && (
        <div className="col-span-2 rounded-xl bg-white/5 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">View Resource</h2>
              <p className="mt-1 text-sm text-gray-400">
                {
                  mockResources.find((r) => r.name === selectedResource)
                    ?.description
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedResource(null)}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Close
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isExecuting}
                className="flex items-center gap-2 rounded-lg bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(280,100%,60%)] disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-4 w-4" />
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="rounded-lg bg-black/50 p-4 font-mono text-sm">
              <code>
                {JSON.stringify(
                  {
                    // Mock data
                    [selectedResource]: {
                      // Add mock data based on resource type
                    },
                  },
                  null,
                  2,
                )}
              </code>
            </pre>
            <button
              className="absolute top-2 right-2 rounded-lg bg-white/10 p-1 text-gray-400 transition-colors hover:bg-white/20 hover:text-white"
              title="Copy to clipboard"
            >
              <CodeBracketIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
