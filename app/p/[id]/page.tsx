import { getPlaylist } from "@/lib/store";
import { notFound } from "next/navigation";
import PlaylistView from "@/components/PlaylistView";

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlaylist(id);

  if (!data) notFound();

  return <PlaylistView data={data} id={id} />;
}
