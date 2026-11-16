import { NextResponse, type NextRequest } from "next/server";
import { getProjectBySlug } from "@/content/projects";
import { isAuthOutage, SESSION_EXPIRED_HEADER } from "@/lib/session";
import { siteUrl } from "@/lib/site";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Opens a client file. The download link is signed here, at click time, so a
 * page left open for a while never hands out an expired link.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const site = siteUrl();
  if (!isSupabaseConfigured || !site || !getProjectBySlug(slug)?.clientArea) {
    return new NextResponse("Not found", { status: 404 });
  }

  const page = new URL(`/work/${slug}/client`, site);
  const back = (error?: string) => {
    if (error) page.searchParams.set("error", error);
    return NextResponse.redirect(page, 303);
  };

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (isAuthOutage(userError)) {
    console.error("Client file sign-in check failed", { slug, error: userError });
    return back("unavailable");
  }
  // The proxy just ended a 12-hour-old session: say so, as the page would.
  if (!user) {
    return back(request.headers.get(SESSION_EXPIRED_HEADER) === "1" ? "session_expired" : undefined);
  }

  // Row level security returns the row only to a member with a fresh session.
  const { data: file, error: fileError } = await supabase
    .from("project_resources")
    .select("storage_path")
    .eq("id", id)
    .eq("project_slug", slug)
    .eq("kind", "file")
    .maybeSingle();
  if (fileError) {
    // An id that isn't a uuid is the visitor's typo, not an outage.
    if (fileError.code === "22P02") return back("file_unavailable");
    console.error("Client file lookup failed", { slug, id, error: fileError });
    return back("unavailable");
  }
  if (!file?.storage_path) return back("file_unavailable");

  const { data: signed } = await supabase.storage
    .from("client-files")
    .createSignedUrl(file.storage_path, 60);
  if (!signed?.signedUrl) return back("file_unavailable");

  return NextResponse.redirect(signed.signedUrl, 303);
}
