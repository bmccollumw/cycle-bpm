import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession()

  if (!session?.spotifyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's sort jobs from Supabase
  const { data: jobs } = await supabase
    .from('sort_jobs')
    .select('*')
    .eq('user_spotify_id', session.spotifyId)
    .order('created_at', { ascending: true })

  const playlistsSorted = jobs?.length || 0
  const songsSorted = jobs?.reduce((sum, j) => sum + (j.sorted_tracks || 0), 0) || 0
  const memberSince = jobs?.[0]
    ? new Date(jobs[0].created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  // Build sort history map { playlist_id: most_recent_job }
  const sortHistory: Record<string, any> = {}
  jobs?.forEach(job => {
    if (!sortHistory[job.playlist_id] ||
        new Date(job.created_at) > new Date(sortHistory[job.playlist_id].created_at)) {
      sortHistory[job.playlist_id] = job
    }
  })

  return NextResponse.json({ playlistsSorted, songsSorted, memberSince, sortHistory })
}