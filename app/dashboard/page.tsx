'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './dashboard.module.css'

interface Playlist {
  id: string
  name: string
  images: { url: string }[]
  tracks: { total: number }
}

interface Track {
  id: string
  name: string
  artists: { name: string }[]
  duration_ms: number
  album: { name: string; images: { url: string }[] }
}

interface SortJob {
  created_at: string
  sorted_tracks: number
  total_tracks: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [sortHistory, setSortHistory] = useState<Record<string, SortJob>>({})
  const [stats, setStats] = useState({ playlistsSorted: 0, songsSorted: 0, memberSince: '' })
  const [loading, setLoading] = useState(true)
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (session?.accessToken) {
      fetchPlaylists()
      fetchStats()
      setTimeout(() => setVisible(true), 100)
    }
  }, [session])

  const fetchPlaylists = async () => {
    const res = await fetch('/api/playlists')
    const data = await res.json()
    setPlaylists(data.playlists || [])
    setLoading(false)
  }

  const fetchStats = async () => {
    const res = await fetch('/api/stats')
    const data = await res.json()
    setStats(data)
    setSortHistory(data.sortHistory || {})
  }

  const fetchTracks = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    setLoadingTracks(true)
    setTracks([])
    const res = await fetch(`/api/playlists/${playlist.id}/tracks`)
    const data = await res.json()
    setTracks(data.tracks || [])
    setLoadingTracks(false)
  }

  const formatDuration = (ms: number) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingScreen}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  return (
    <div className={`${styles.page} ${visible ? styles.visible : ''}`}>

      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <p className={styles.userName}>{session?.user?.name}</p>
          <div className={styles.navStats}>
            <span>Member since {stats.memberSince}</span>
            <span className={styles.dot}>·</span>
            <span>{stats.playlistsSorted} playlists sorted</span>
            <span className={styles.dot}>·</span>
            <span>{stats.songsSorted} songs sorted</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/' })}>
          Sign out
        </button>
      </nav>

      {/* ── Main ── */}
      <main className={styles.main}>

        {/* Playlist selector */}
        <div className={styles.selectorWrap}>
          <label className={styles.selectorLabel}>Select a playlist</label>
          <select
            className={styles.selector}
            value={selectedPlaylist?.id || ''}
            onChange={e => {
              const p = playlists.find(pl => pl.id === e.target.value)
              if (p) fetchTracks(p)
            }}
          >
            <option value="" disabled>Choose a playlist...</option>
            {playlists.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.tracks.total} songs)
              </option>
            ))}
          </select>
        </div>

        {/* Playlist detail */}
        {selectedPlaylist && (
          <div className={styles.playlistCard}>

            {/* Header */}
            <div className={styles.playlistHeader}>
              {selectedPlaylist.images?.[0] && (
                <img
                  src={selectedPlaylist.images[0].url}
                  alt={selectedPlaylist.name}
                  className={styles.playlistArt}
                />
              )}
              <div className={styles.playlistMeta}>
                <h2 className={styles.playlistName}>{selectedPlaylist.name}</h2>
                <p className={styles.playlistCount}>{selectedPlaylist.tracks.total} songs</p>
                {sortHistory[selectedPlaylist.id] ? (
                  <p className={styles.sortedBadge}>
                    ✓ Sorted on {formatDate(sortHistory[selectedPlaylist.id].created_at)}
                  </p>
                ) : (
                  <p className={styles.unsortedBadge}>Not yet sorted</p>
                )}
              </div>
              <button
                className={styles.sortBtn}
                onClick={() => router.push(`/sort/${selectedPlaylist.id}`)}
              >
                Sort playlist
              </button>
            </div>

            {/* Track list */}
            {loadingTracks ? (
              <p className={styles.loadingTracks}>Loading tracks...</p>
            ) : (
              <div className={styles.trackList}>
                <div className={styles.trackHeader}>
                  <span className={styles.trackNum}>#</span>
                  <span className={styles.trackTitle}>Title</span>
                  <span className={styles.trackAlbum}>Album</span>
                  <span className={styles.trackDuration}>Duration</span>
                </div>
                {tracks.map((track, i) => (
                  <div key={track.id} className={styles.trackRow}>
                    <span className={styles.trackNum}>{i + 1}</span>
                    <div className={styles.trackInfo}>
                      {track.album?.images?.[0] && (
                        <img src={track.album.images[0].url} alt="" className={styles.trackArt} />
                      )}
                      <div>
                        <p className={styles.trackName}>{track.name}</p>
                        <p className={styles.trackArtist}>
                          {track.artists.map(a => a.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <span className={styles.trackAlbum}>{track.album?.name}</span>
                    <span className={styles.trackDuration}>{formatDuration(track.duration_ms)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}