import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${params.id}/tracks?limit=100`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  )

  const data = await res.json()
  const tracks = (data.items || [])
    .map((item: any) => item.track || item.item)
    .filter((t: any) => t && t.id)

  return NextResponse.json({ tracks })
}