"""Xtream Codes API client + M3U parser + demo content."""
from __future__ import annotations

import re
from typing import Any, Optional
from urllib.parse import urlencode

import httpx


# ---------------------- Demo content ---------------------- #

DEMO_LIVE_CHANNELS = [
    {
        "stream_id": "demo-live-1",
        "name": "NASA TV Public",
        "stream_icon": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/240px-NASA_logo.svg.png",
        "epg_channel_id": "nasa-tv",
        "category_id": "documentary",
        "category_name": "Documentary",
        "stream_url": "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8",
        "now_playing": "Live from the International Space Station",
        "next_playing": "Mission Control Briefing",
    },
    {
        "stream_id": "demo-live-2",
        "name": "Mux Test Stream",
        "stream_icon": "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=200",
        "epg_channel_id": "mux-test",
        "category_id": "tech",
        "category_name": "Tech & Science",
        "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        "now_playing": "Big Buck Bunny — Episode 1",
        "next_playing": "Open Movie Showcase",
    },
    {
        "stream_id": "demo-live-3",
        "name": "Red Bull TV",
        "stream_icon": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200",
        "epg_channel_id": "redbull",
        "category_id": "sports",
        "category_name": "Sports",
        "stream_url": "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
        "now_playing": "Cliff Diving World Series",
        "next_playing": "Red Bull Rampage Highlights",
    },
    {
        "stream_id": "demo-live-4",
        "name": "Sky News Live",
        "stream_icon": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200",
        "epg_channel_id": "sky-news",
        "category_id": "news",
        "category_name": "News",
        "stream_url": "https://skynews2-plutolive-vo.akamaized.net/cdnAkamaiTokenization/chunklist_b300000_slENG.m3u8",
        "now_playing": "Sky News Tonight",
        "next_playing": "Breaking Stories",
    },
    {
        "stream_id": "demo-live-5",
        "name": "Classical Cinema",
        "stream_icon": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200",
        "epg_channel_id": "classic-cinema",
        "category_id": "movies",
        "category_name": "Movies",
        "stream_url": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
        "now_playing": "Tears of Steel",
        "next_playing": "Sintel — Open Movie",
    },
    {
        "stream_id": "demo-live-6",
        "name": "Anime Realm",
        "stream_icon": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200",
        "epg_channel_id": "anime",
        "category_id": "anime",
        "category_name": "Anime",
        "stream_url": "https://test-streams.mux.dev/pts_shift/master.m3u8",
        "now_playing": "Spirited Voyage",
        "next_playing": "Neon Skies",
    },
    {
        "stream_id": "demo-live-7",
        "name": "Lo-Fi Lounge",
        "stream_icon": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200",
        "epg_channel_id": "lofi",
        "category_id": "music",
        "category_name": "Music",
        "stream_url": "https://test-streams.mux.dev/test_001/stream.m3u8",
        "now_playing": "Late Night Lo-Fi Beats",
        "next_playing": "Jazz Underground",
    },
    {
        "stream_id": "demo-live-8",
        "name": "Discovery Wild",
        "stream_icon": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=200",
        "epg_channel_id": "wild",
        "category_id": "documentary",
        "category_name": "Documentary",
        "stream_url": "https://test-streams.mux.dev/dai-discontinuity-deltatre/manifest.m3u8",
        "now_playing": "Savanna Pulse",
        "next_playing": "Frozen Continent",
    },
]


DEMO_MOVIES = [
    {
        "stream_id": "demo-movie-1",
        "name": "Big Buck Bunny",
        "title": "Big Buck Bunny",
        "stream_icon": "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop",
        "backdrop": "https://images.unsplash.com/photo-1614846384571-1e31a4d0a544?w=1600&h=900&fit=crop",
        "year": "2008",
        "genre": "Animation, Comedy",
        "duration": "9:56",
        "rating": "8.1",
        "director": "Sacha Goedegebure",
        "cast": "Open Movie Project",
        "plot": "A large rabbit deals with three irritating rodents who take pleasure in harassing him. A landmark open-source 3D short.",
        "category_id": "animation",
        "category_name": "Animation",
        "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        "trailer_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    },
    {
        "stream_id": "demo-movie-2",
        "name": "Tears of Steel",
        "title": "Tears of Steel",
        "stream_icon": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop",
        "backdrop": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop",
        "year": "2012",
        "genre": "Sci-Fi, Action",
        "duration": "12:14",
        "rating": "7.4",
        "director": "Ian Hubert",
        "cast": "Derek de Lint, Sergio Hasselbaink",
        "plot": "A group of warriors and scientists gather at the Oude Kerk in Amsterdam to stop alien robots from destroying Earth.",
        "category_id": "scifi",
        "category_name": "Sci-Fi",
        "stream_url": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
        "trailer_url": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    },
    {
        "stream_id": "demo-movie-3",
        "name": "Sintel — The Lone Dragon",
        "title": "Sintel",
        "stream_icon": "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&h=600&fit=crop",
        "backdrop": "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=1600&h=900&fit=crop",
        "year": "2010",
        "genre": "Fantasy, Drama",
        "duration": "14:48",
        "rating": "7.8",
        "director": "Colin Levy",
        "cast": "Halina Reijn, Thom Hoffman",
        "plot": "A lonely young woman searches for the baby dragon she once cared for, on a long journey of love and loss.",
        "category_id": "fantasy",
        "category_name": "Fantasy",
        "stream_url": "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
        "trailer_url": "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    },
    {
        "stream_id": "demo-movie-4",
        "name": "Elephants Dream",
        "title": "Elephants Dream",
        "stream_icon": "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop",
        "backdrop": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&h=900&fit=crop",
        "year": "2006",
        "genre": "Animation, Adventure",
        "duration": "10:54",
        "rating": "7.2",
        "director": "Bassam Kurdali",
        "cast": "Tygo Gernandt, Cas Jansen",
        "plot": "Two strange characters explore a capricious and seemingly infinite machine. A masterpiece of open animation.",
        "category_id": "animation",
        "category_name": "Animation",
        "stream_url": "https://test-streams.mux.dev/pts_shift/master.m3u8",
        "trailer_url": "https://test-streams.mux.dev/pts_shift/master.m3u8",
    },
    {
        "stream_id": "demo-movie-5",
        "name": "Caminandes — Llamigos",
        "title": "Caminandes",
        "stream_icon": "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=600&fit=crop",
        "backdrop": "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1600&h=900&fit=crop",
        "year": "2016",
        "genre": "Animation, Comedy",
        "duration": "2:30",
        "rating": "8.0",
        "director": "Pablo Vazquez",
        "cast": "Open Movie Project",
        "plot": "An unlikely friendship between a llama and a fox during a Patagonian winter.",
        "category_id": "animation",
        "category_name": "Animation",
        "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        "trailer_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    },
    {
        "stream_id": "demo-movie-6",
        "name": "Neon Drift",
        "title": "Neon Drift",
        "stream_icon": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
        "backdrop": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&h=900&fit=crop",
        "year": "2024",
        "genre": "Action, Thriller",
        "duration": "1:42:00",
        "rating": "7.9",
        "director": "Mira Quan",
        "cast": "Aiden Cross, Eliza Voss",
        "plot": "An undercover racer infiltrates a neon-lit syndicate to expose its leader before time runs out.",
        "category_id": "action",
        "category_name": "Action",
        "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        "trailer_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    },
    {
        "stream_id": "demo-movie-7",
        "name": "Midnight in Reykjavik",
        "title": "Midnight in Reykjavik",
        "stream_icon": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
        "backdrop": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1600&h=900&fit=crop",
        "year": "2023",
        "genre": "Drama, Mystery",
        "duration": "1:58:00",
        "rating": "8.3",
        "director": "Soren Hagen",
        "cast": "Ingrid Solberg, Magnus Holm",
        "plot": "A grieving detective hunts a ghost from her past beneath the eternal Icelandic twilight.",
        "category_id": "drama",
        "category_name": "Drama",
        "stream_url": "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
        "trailer_url": "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    },
    {
        "stream_id": "demo-movie-8",
        "name": "The Last Cartographer",
        "title": "The Last Cartographer",
        "stream_icon": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=600&fit=crop",
        "backdrop": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=900&fit=crop",
        "year": "2022",
        "genre": "Adventure, Drama",
        "duration": "2:14:00",
        "rating": "8.0",
        "director": "Rohan Mehta",
        "cast": "Asha Verma, Dev Anand",
        "plot": "A mapmaker journeys across forgotten lands to redraw the world before it slips into silence.",
        "category_id": "adventure",
        "category_name": "Adventure",
        "stream_url": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
        "trailer_url": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    },
]


DEMO_SERIES = [
    {
        "series_id": "demo-series-1",
        "name": "Echoes of Tomorrow",
        "title": "Echoes of Tomorrow",
        "cover": "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop",
        "backdrop_path": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop",
        "year": "2025",
        "genre": "Sci-Fi, Drama",
        "rating": "9.1",
        "plot": "A team of physicists discover messages from the future hidden in cosmic background radiation.",
        "cast": "Mara Volk, Idris Khan, Lina Tao",
        "director": "Yui Sato",
        "category_id": "scifi",
        "category_name": "Sci-Fi",
        "seasons": [
            {
                "season_number": 1,
                "episodes": [
                    {
                        "id": "demo-s1e1",
                        "episode_num": 1,
                        "title": "Signal",
                        "duration": "47:00",
                        "plot": "Anomalous data arrives from deep space.",
                        "thumbnail": "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=600&h=340&fit=crop",
                        "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                    },
                    {
                        "id": "demo-s1e2",
                        "episode_num": 2,
                        "title": "Receiver",
                        "duration": "49:00",
                        "plot": "A pattern emerges no one can explain.",
                        "thumbnail": "https://images.unsplash.com/photo-1539721972319-f0e80a00d424?w=600&h=340&fit=crop",
                        "stream_url": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
                    },
                    {
                        "id": "demo-s1e3",
                        "episode_num": 3,
                        "title": "Witness",
                        "duration": "52:00",
                        "plot": "The team realises someone is listening back.",
                        "thumbnail": "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=600&h=340&fit=crop",
                        "stream_url": "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
                    },
                ],
            },
            {
                "season_number": 2,
                "episodes": [
                    {
                        "id": "demo-s2e1",
                        "episode_num": 1,
                        "title": "Refraction",
                        "duration": "55:00",
                        "plot": "A new signal from a parallel timeline arrives.",
                        "thumbnail": "https://images.unsplash.com/photo-1517976547714-720226b864c1?w=600&h=340&fit=crop",
                        "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                    },
                ],
            },
        ],
    },
    {
        "series_id": "demo-series-2",
        "name": "Knife in the Garden",
        "title": "Knife in the Garden",
        "cover": "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&h=600&fit=crop",
        "backdrop_path": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&h=900&fit=crop",
        "year": "2024",
        "genre": "Thriller, Mystery",
        "rating": "8.6",
        "plot": "A village hides a violent secret beneath its perfect orchards.",
        "cast": "Petra Klein, Hugo Marsh",
        "director": "Petra Klein",
        "category_id": "thriller",
        "category_name": "Thriller",
        "seasons": [
            {
                "season_number": 1,
                "episodes": [
                    {
                        "id": "demo-kg-s1e1",
                        "episode_num": 1,
                        "title": "Orchard",
                        "duration": "44:00",
                        "plot": "A pruning knife is found in the wrong place.",
                        "thumbnail": "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=600&h=340&fit=crop",
                        "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                    },
                    {
                        "id": "demo-kg-s1e2",
                        "episode_num": 2,
                        "title": "Cellar",
                        "duration": "46:00",
                        "plot": "Old jars hold older lies.",
                        "thumbnail": "https://images.unsplash.com/photo-1499914485622-a88fac536970?w=600&h=340&fit=crop",
                        "stream_url": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
                    },
                ],
            },
        ],
    },
    {
        "series_id": "demo-series-3",
        "name": "Frame Rate",
        "title": "Frame Rate",
        "cover": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
        "backdrop_path": "https://images.unsplash.com/photo-1478720568477-b1f5f8546b39?w=1600&h=900&fit=crop",
        "year": "2025",
        "genre": "Comedy, Drama",
        "rating": "8.0",
        "plot": "An indie animation studio fights to ship its dream project in six weeks.",
        "cast": "Olu Adeyemi, Mei Lin, Carlos Park",
        "director": "Olu Adeyemi",
        "category_id": "comedy",
        "category_name": "Comedy",
        "seasons": [
            {
                "season_number": 1,
                "episodes": [
                    {
                        "id": "demo-fr-s1e1",
                        "episode_num": 1,
                        "title": "Storyboard",
                        "duration": "28:00",
                        "plot": "The pitch nearly dies on a sticky note.",
                        "thumbnail": "https://images.unsplash.com/photo-1611162616305-c69b3037f77c?w=600&h=340&fit=crop",
                        "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                    },
                    {
                        "id": "demo-fr-s1e2",
                        "episode_num": 2,
                        "title": "Render",
                        "duration": "29:00",
                        "plot": "The rig breaks the night before the demo.",
                        "thumbnail": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=340&fit=crop",
                        "stream_url": "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
                    },
                ],
            },
        ],
    },
    {
        "series_id": "demo-series-4",
        "name": "Reykjavik Nights",
        "title": "Reykjavik Nights",
        "cover": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=600&fit=crop",
        "backdrop_path": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1600&h=900&fit=crop",
        "year": "2023",
        "genre": "Crime, Drama",
        "rating": "8.4",
        "plot": "An Icelandic detective unravels a chain of disappearances during the polar night.",
        "cast": "Ingrid Solberg, Magnus Holm, Asgeir Vik",
        "director": "Soren Hagen",
        "category_id": "crime",
        "category_name": "Crime",
        "seasons": [
            {
                "season_number": 1,
                "episodes": [
                    {
                        "id": "demo-rn-s1e1",
                        "episode_num": 1,
                        "title": "Aurora",
                        "duration": "51:00",
                        "plot": "A woman vanishes beneath the northern lights.",
                        "thumbnail": "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&h=340&fit=crop",
                        "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                    },
                ],
            },
        ],
    },
]


DEMO_CATEGORIES = {
    "live": [
        {"category_id": "news", "category_name": "News"},
        {"category_id": "sports", "category_name": "Sports"},
        {"category_id": "documentary", "category_name": "Documentary"},
        {"category_id": "movies", "category_name": "Movies"},
        {"category_id": "music", "category_name": "Music"},
        {"category_id": "anime", "category_name": "Anime"},
        {"category_id": "tech", "category_name": "Tech & Science"},
    ],
    "vod": [
        {"category_id": "action", "category_name": "Action"},
        {"category_id": "drama", "category_name": "Drama"},
        {"category_id": "scifi", "category_name": "Sci-Fi"},
        {"category_id": "animation", "category_name": "Animation"},
        {"category_id": "adventure", "category_name": "Adventure"},
        {"category_id": "fantasy", "category_name": "Fantasy"},
    ],
    "series": [
        {"category_id": "scifi", "category_name": "Sci-Fi"},
        {"category_id": "thriller", "category_name": "Thriller"},
        {"category_id": "comedy", "category_name": "Comedy"},
        {"category_id": "crime", "category_name": "Crime"},
    ],
}


def demo_account_info() -> dict[str, Any]:
    return {
        "username": "demo",
        "password": "demo",
        "status": "Active",
        "exp_date": "2099-12-31",
        "is_trial": "0",
        "active_cons": "1",
        "max_connections": "5",
        "server_timezone": "UTC",
        "allowed_output_formats": ["m3u8", "ts", "mp4"],
        "server_url": "https://demo.maxxplayer.local",
    }


def demo_epg(stream_id: str) -> list[dict[str, Any]]:
    """Generate a simple 12-program EPG for a channel."""
    import datetime as _dt

    now = _dt.datetime.now(_dt.timezone.utc).replace(minute=0, second=0, microsecond=0)
    titles = [
        "Morning Briefing",
        "World Today",
        "Deep Dive",
        "Studio Live",
        "Open Mic",
        "Prime Hour",
        "Evening Edge",
        "Late Night Wrap",
        "Replays",
        "Midnight Special",
        "After Hours",
        "Dawn Patrol",
    ]
    out = []
    for i, t in enumerate(titles):
        start = now + _dt.timedelta(hours=i - 2)
        end = start + _dt.timedelta(hours=1)
        out.append({
            "id": f"{stream_id}-prog-{i}",
            "title": t,
            "description": f"{t} — a curated program block on the channel.",
            "start": start.isoformat(),
            "end": end.isoformat(),
        })
    return out


# ---------------------- M3U Parsing ---------------------- #

EXTINF_RE = re.compile(r'#EXTINF:(?P<duration>-?\d+)(?P<attrs>[^,]*),(?P<title>.*)')
ATTR_RE = re.compile(r'([\w-]+)="([^"]*)"')


def parse_m3u(content: str) -> list[dict[str, Any]]:
    """Parse an M3U/M3U8 playlist into channel dicts."""
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    items: list[dict[str, Any]] = []
    current: Optional[dict[str, Any]] = None
    idx = 0
    for line in lines:
        if line.startswith("#EXTINF"):
            m = EXTINF_RE.match(line)
            if m:
                attrs = dict(ATTR_RE.findall(m.group("attrs") or ""))
                title = m.group("title").strip()
                current = {
                    "stream_id": f"m3u-{idx}",
                    "name": title,
                    "title": title,
                    "stream_icon": attrs.get("tvg-logo", ""),
                    "epg_channel_id": attrs.get("tvg-id", ""),
                    "category_id": (attrs.get("group-title", "Uncategorized") or "Uncategorized").lower().replace(" ", "-"),
                    "category_name": attrs.get("group-title", "Uncategorized") or "Uncategorized",
                    "stream_url": "",
                }
                idx += 1
        elif line.startswith("#"):
            continue
        elif current is not None:
            current["stream_url"] = line
            items.append(current)
            current = None
    return items


# ---------------------- Xtream API client ---------------------- #

class XtreamClient:
    def __init__(self, server: str, username: str, password: str, timeout: float = 15.0, client: Optional[httpx.AsyncClient] = None):
        self.server = server.rstrip("/")
        self.username = username
        self.password = password
        self.timeout = timeout
        self.client = client

    def _url(self, action: Optional[str] = None, **extra: Any) -> str:
        params: dict[str, Any] = {
            "username": self.username,
            "password": self.password,
        }
        if action:
            params["action"] = action
        params.update({k: v for k, v in extra.items() if v is not None})
        return f"{self.server}/player_api.php?{urlencode(params)}"

    async def _get(self, url: str) -> Any:
        headers = {
            "User-Agent": "VLC/3.0.9 LibVLC/3.0.9"
        }
        if self.client:
            r = await self.client.get(url, headers=headers)
            r.raise_for_status()
            try:
                return r.json()
            except Exception:
                return r.text
        else:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True, headers=headers) as client:
                r = await client.get(url)
                r.raise_for_status()
                try:
                    return r.json()
                except Exception:
                    return r.text

    async def account_info(self) -> dict[str, Any]:
        return await self._get(self._url())

    async def categories(self, content_type: str) -> list[dict[str, Any]]:
        mapping = {
            "live": "get_live_categories",
            "vod": "get_vod_categories",
            "series": "get_series_categories",
        }
        return await self._get(self._url(mapping[content_type]))

    async def streams(self, content_type: str, category_id: Optional[str] = None) -> list[dict[str, Any]]:
        mapping = {
            "live": "get_live_streams",
            "vod": "get_vod_streams",
            "series": "get_series",
        }
        return await self._get(self._url(mapping[content_type], category_id=category_id))

    async def series_info(self, series_id: str) -> dict[str, Any]:
        return await self._get(self._url("get_series_info", series_id=series_id))

    async def vod_info(self, vod_id: str) -> dict[str, Any]:
        return await self._get(self._url("get_vod_info", vod_id=vod_id))

    async def short_epg(self, stream_id: str, limit: int = 12) -> dict[str, Any]:
        return await self._get(self._url("get_short_epg", stream_id=stream_id, limit=limit))

    def live_stream_url(self, stream_id: Any, ext: str = "m3u8") -> str:
        return f"{self.server}/live/{self.username}/{self.password}/{stream_id}.{ext}"

    def vod_stream_url(self, stream_id: Any, ext: str = "mp4") -> str:
        return f"{self.server}/movie/{self.username}/{self.password}/{stream_id}.{ext}"

    def series_stream_url(self, episode_id: Any, ext: str = "mp4") -> str:
        return f"{self.server}/series/{self.username}/{self.password}/{episode_id}.{ext}"
