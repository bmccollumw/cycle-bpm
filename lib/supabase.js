import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Songs cache ──────────────────────────────────────────────────────────────

export async function getSongBySpotifyId(spotifyId) {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('spotify_id', spotifyId)
    .single()

  if (error) return null
  return data
}

export async function saveSong(song) {
  const { data, error } = await supabase
    .from('songs')
    .upsert({
      spotify_id:       song.spotify_id,
      title:            song.title,
      artist:           song.artist,
      duration_sec:     song.duration_sec,
      raw_bpm:          song.raw_bpm,
      normalized_bpm:   song.normalized_bpm,
      confidence:       song.confidence,
      duration_diff_sec: song.duration_diff_sec,
      duration_warning: song.duration_warning,
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'spotify_id' })
    .select()

  if (error) console.error('Error saving song:', error)
  return data
}

// ── Sort jobs (owner reports) ────────────────────────────────────────────────

export async function saveSortJob(job) {
  const { data, error } = await supabase
    .from('sort_jobs')
    .insert({
      user_spotify_id:   job.user_spotify_id,
      user_display_name: job.user_display_name,
      playlist_id:       job.playlist_id,
      playlist_name:     job.playlist_name,
      total_tracks:      job.total_tracks,
      sorted_tracks:     job.sorted_tracks,
      failed_tracks:     job.failed_tracks,
      results_json:      job.results_json,
    })
    .select()

  if (error) console.error('Error saving sort job:', error)
  return data
}