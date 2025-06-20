import { createClient } from "@/supabase/server";
import { MCPServerActions } from "./components/MCPServerActions";
import { getMCPDetails } from "@/server/mcp/client";
import Link from "next/link";

async function getServer(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mcp_servers")
    .select("*")
    .eq("id", parseInt(id))
    .single();

  if (error) return { error: error.message };

  return { server: data };
}

type MCPServerPageOptions = { params: Promise<{ id: string }> };

export default async function MCPServerPage({ params }: MCPServerPageOptions) {
  const { id } = await params;
  const { server, error } = await getServer(id);

  if (error) return <>Error: {error}</>;
  if (!server) return <>Not Found</>;

  const serverDetails = await getMCPDetails(server);
  console.log(serverDetails);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Link
              href="/mcps"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              ← Back to Servers
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{server.name}</h1>
              <p className="mt-1 text-sm text-gray-400">
                Version {server.version} • {server.transport}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[hsl(280,100%,70%)]/20 px-3 py-1 text-sm font-medium text-[hsl(280,100%,70%)]">
                {server.transport}
              </span>
            </div>
          </div>
        </div>

        {/* Server Actions */}
        <MCPServerActions server={server} />
      </div>
    </main>
  );
}
