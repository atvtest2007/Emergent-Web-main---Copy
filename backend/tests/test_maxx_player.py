"""Maxx Player backend API tests (pytest).

Covers playlists, account info, content (categories/streams/details/EPG/stream-url/search),
favorites, watch progress / continue watching, settings, and stream proxy.
"""
from __future__ import annotations

import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://stream-hub-pro-7.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# ---------------------- Fixtures ---------------------- #


@pytest.fixture(scope="session")
def client() -> requests.Session:
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session", autouse=True)
def demo_active(client: requests.Session):
    """Ensure demo playlist is activated before tests run."""
    r = client.post(f"{API}/playlists/demo", timeout=30)
    assert r.status_code == 200, f"demo activation failed: {r.text}"
    data = r.json()
    assert data.get("type") == "demo"
    # NOTE: server returns stale `existing` doc; verify true active state via GET
    active = client.get(f"{API}/playlists/active", timeout=15).json()
    assert active is not None and active.get("type") == "demo" and active.get("is_active") is True
    yield data


# ---------------------- Health ---------------------- #


def test_root(client):
    r = client.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j.get("status") == "ok"


# ---------------------- Playlists ---------------------- #


class TestPlaylists:
    def test_demo_idempotent(self, client):
        r1 = client.post(f"{API}/playlists/demo", timeout=30)
        r2 = client.post(f"{API}/playlists/demo", timeout=30)
        assert r1.status_code == 200 and r2.status_code == 200
        assert r1.json()["id"] == r2.json()["id"]
        assert "_id" not in r1.json()
        # Bug check: API should reflect updated activation status in response.
        # Currently returns stale 'existing' doc — see action_items.
        active = client.get(f"{API}/playlists/active", timeout=15).json()
        assert active["id"] == r2.json()["id"]
        assert active["is_active"] is True

    def test_active(self, client):
        r = client.get(f"{API}/playlists/active", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data is not None
        assert data["is_active"] is True
        assert "_id" not in data

    def test_list(self, client):
        r = client.get(f"{API}/playlists", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert any(p["type"] == "demo" for p in items)
        for p in items:
            assert "_id" not in p

    def test_create_m3u_with_embedded_content(self, client):
        m3u = (
            "#EXTM3U\n"
            '#EXTINF:-1 tvg-id="ch1" tvg-logo="https://x/y.png" group-title="News",Channel One\n'
            "https://example.com/stream1.m3u8\n"
            '#EXTINF:-1 group-title="Sports",Channel Two\n'
            "https://example.com/stream2.m3u8\n"
        )
        payload = {
            "name": f"TEST_m3u_{uuid.uuid4().hex[:6]}",
            "type": "m3u",
            "m3u_content": m3u,
        }
        r = client.post(f"{API}/playlists", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        pl = r.json()
        assert pl["type"] == "m3u"
        assert pl["is_active"] is True
        # cleanup + reactivate demo
        client.delete(f"{API}/playlists/{pl['id']}", timeout=15)
        client.post(f"{API}/playlists/demo", timeout=30)

    def test_create_xtream_invalid_creds_returns_4xx(self, client):
        payload = {
            "name": "TEST_xtream_invalid",
            "type": "xtream",
            "server_url": "http://invalid-xtream-host-does-not-exist.test",
            "username": "x",
            "password": "y",
        }
        r = client.post(f"{API}/playlists", json=payload, timeout=30)
        assert 400 <= r.status_code < 500, f"expected 4xx, got {r.status_code}: {r.text}"

    def test_activate_and_delete(self, client):
        # Create a temp m3u playlist
        m3u = "#EXTM3U\n#EXTINF:-1,Demo\nhttps://example.com/s.m3u8\n"
        r = client.post(
            f"{API}/playlists",
            json={"name": f"TEST_act_{uuid.uuid4().hex[:6]}", "type": "m3u", "m3u_content": m3u},
            timeout=30,
        )
        assert r.status_code == 200
        pid = r.json()["id"]

        # Find demo playlist id
        listing = client.get(f"{API}/playlists", timeout=15).json()
        demo_id = next(p["id"] for p in listing if p["type"] == "demo")

        # Activate demo back
        r2 = client.post(f"{API}/playlists/{demo_id}/activate", timeout=15)
        assert r2.status_code == 200
        active = client.get(f"{API}/playlists/active", timeout=15).json()
        assert active["id"] == demo_id

        # Delete temp playlist
        rd = client.delete(f"{API}/playlists/{pid}", timeout=15)
        assert rd.status_code == 200

        # Delete again -> 404
        rd2 = client.delete(f"{API}/playlists/{pid}", timeout=15)
        assert rd2.status_code == 404


# ---------------------- Account ---------------------- #


def test_account_info_demo(client):
    r = client.get(f"{API}/account/info", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data.get("username") == "demo"
    assert data.get("status") == "Active"


# ---------------------- Content ---------------------- #


class TestContent:
    @pytest.mark.parametrize("ctype", ["live", "vod", "series"])
    def test_categories(self, client, ctype):
        r = client.get(f"{API}/content/categories/{ctype}", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0
        assert "category_id" in data[0] and "category_name" in data[0]

    def test_categories_invalid_type(self, client):
        r = client.get(f"{API}/content/categories/foo", timeout=15)
        assert r.status_code == 400

    @pytest.mark.parametrize("ctype", ["live", "vod", "series"])
    def test_streams(self, client, ctype):
        r = client.get(f"{API}/content/streams/{ctype}", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0

    def test_streams_with_category_filter(self, client):
        r = client.get(f"{API}/content/streams/live", params={"category_id": "documentary"}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        assert all(i["category_id"] == "documentary" for i in items)

    def test_streams_with_unknown_category(self, client):
        r = client.get(f"{API}/content/streams/live", params={"category_id": "nope"}, timeout=15)
        assert r.status_code == 200
        assert r.json() == []

    def test_movie_details(self, client):
        r = client.get(f"{API}/content/movie/demo-movie-1", timeout=15)
        assert r.status_code == 200
        m = r.json()
        assert m["stream_id"] == "demo-movie-1"
        assert "stream_url" in m

    def test_movie_not_found(self, client):
        r = client.get(f"{API}/content/movie/nonexistent", timeout=15)
        assert r.status_code == 404

    def test_series_details(self, client):
        r = client.get(f"{API}/content/series/demo-series-1", timeout=15)
        assert r.status_code == 200
        s = r.json()
        assert s["series_id"] == "demo-series-1"
        assert isinstance(s.get("seasons"), list) and len(s["seasons"]) > 0
        ep_ids = [e["id"] for season in s["seasons"] for e in season["episodes"]]
        assert "demo-s1e1" in ep_ids

    def test_epg(self, client):
        r = client.get(f"{API}/content/epg/demo-live-1", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "epg_listings" in data
        assert len(data["epg_listings"]) > 0
        assert len(data["epg_listings"]) <= 12

    def test_epg_limit(self, client):
        r = client.get(f"{API}/content/epg/demo-live-1", params={"limit": 5}, timeout=15)
        assert r.status_code == 200
        assert len(r.json()["epg_listings"]) == 5

    @pytest.mark.parametrize(
        "ctype,cid",
        [
            ("live", "demo-live-1"),
            ("vod", "demo-movie-1"),
            ("episode", "demo-s1e1"),
        ],
    )
    def test_stream_url(self, client, ctype, cid):
        r = client.get(f"{API}/content/stream-url", params={"content_type": ctype, "content_id": cid}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json().get("url", "").startswith("http")

    def test_stream_url_not_found(self, client):
        r = client.get(
            f"{API}/content/stream-url",
            params={"content_type": "live", "content_id": "missing"},
            timeout=15,
        )
        assert r.status_code == 404

    def test_search(self, client):
        r = client.get(f"{API}/content/search", params={"q": "bunny"}, timeout=15)
        assert r.status_code == 200
        res = r.json()
        assert "movies" in res
        assert any("bunny" in m["name"].lower() for m in res["movies"])

    def test_search_empty(self, client):
        r = client.get(f"{API}/content/search", params={"q": ""}, timeout=15)
        assert r.status_code == 422  # min_length=1


# ---------------------- Favorites ---------------------- #


class TestFavorites:
    PROFILE = "TEST_fav_profile"

    def teardown_method(self, method):
        # Cleanup created favorites
        s = requests.Session()
        items = s.get(f"{API}/user/favorites", params={"profile_id": self.PROFILE}, timeout=15).json()
        for it in items:
            s.delete(
                f"{API}/user/favorites/{it['content_type']}/{it['content_id']}",
                params={"profile_id": self.PROFILE},
                timeout=15,
            )

    def test_add_list_remove(self, client):
        payload = {
            "profile_id": self.PROFILE,
            "content_type": "movie",
            "content_id": "demo-movie-1",
            "content_data": {"name": "Big Buck Bunny"},
        }
        r = client.post(f"{API}/user/favorites", json=payload, timeout=15)
        assert r.status_code == 200
        fav = r.json()
        assert fav["content_id"] == "demo-movie-1"
        assert "id" in fav

        # Idempotent: adding again returns existing
        r2 = client.post(f"{API}/user/favorites", json=payload, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["id"] == fav["id"]

        # List
        rl = client.get(f"{API}/user/favorites", params={"profile_id": self.PROFILE}, timeout=15)
        assert rl.status_code == 200
        items = rl.json()
        assert any(i["content_id"] == "demo-movie-1" for i in items)

        # Delete
        rd = client.delete(
            f"{API}/user/favorites/movie/demo-movie-1",
            params={"profile_id": self.PROFILE},
            timeout=15,
        )
        assert rd.status_code == 200

        # Verify gone
        rl2 = client.get(f"{API}/user/favorites", params={"profile_id": self.PROFILE}, timeout=15)
        assert all(i["content_id"] != "demo-movie-1" for i in rl2.json())


# ---------------------- Watch Progress / Continue Watching ---------------------- #


class TestProgress:
    PROFILE = "TEST_prog_profile"

    def teardown_method(self, method):
        s = requests.Session()
        items = s.get(f"{API}/user/progress", params={"profile_id": self.PROFILE}, timeout=15).json()
        for it in items:
            s.delete(
                f"{API}/user/progress/{it['content_type']}/{it['content_id']}",
                params={"profile_id": self.PROFILE},
                timeout=15,
            )

    def test_upsert_and_list(self, client):
        payload = {
            "profile_id": self.PROFILE,
            "content_type": "movie",
            "content_id": "demo-movie-1",
            "position": 60,
            "duration": 600,  # 10% -> continue watching
            "content_data": {"name": "Big Buck Bunny"},
        }
        r = client.post(f"{API}/user/progress", json=payload, timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True

        # Upsert (update) same key
        payload["position"] = 120
        time.sleep(0.05)
        r2 = client.post(f"{API}/user/progress", json=payload, timeout=15)
        assert r2.status_code == 200

        # List
        rl = client.get(f"{API}/user/progress", params={"profile_id": self.PROFILE}, timeout=15)
        assert rl.status_code == 200
        items = rl.json()
        assert len(items) == 1
        assert items[0]["position"] == 120
        assert abs(items[0]["progress"] - 0.2) < 1e-6

    def test_continue_watching_filters(self, client):
        # 10% -> qualifies
        client.post(
            f"{API}/user/progress",
            json={
                "profile_id": self.PROFILE,
                "content_type": "movie",
                "content_id": "demo-movie-2",
                "position": 60,
                "duration": 600,
                "content_data": {},
            },
            timeout=15,
        )
        # 99% -> excluded
        client.post(
            f"{API}/user/progress",
            json={
                "profile_id": self.PROFILE,
                "content_type": "movie",
                "content_id": "demo-movie-3",
                "position": 99,
                "duration": 100,
                "content_data": {},
            },
            timeout=15,
        )
        # 1% -> excluded
        client.post(
            f"{API}/user/progress",
            json={
                "profile_id": self.PROFILE,
                "content_type": "movie",
                "content_id": "demo-movie-4",
                "position": 1,
                "duration": 100,
                "content_data": {},
            },
            timeout=15,
        )

        r = client.get(f"{API}/user/continue-watching", params={"profile_id": self.PROFILE}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        ids = {i["content_id"] for i in items}
        assert "demo-movie-2" in ids
        assert "demo-movie-3" not in ids
        assert "demo-movie-4" not in ids

    def test_delete_progress(self, client):
        client.post(
            f"{API}/user/progress",
            json={
                "profile_id": self.PROFILE,
                "content_type": "episode",
                "content_id": "demo-s1e1",
                "position": 10,
                "duration": 100,
                "content_data": {},
            },
            timeout=15,
        )
        rd = client.delete(
            f"{API}/user/progress/episode/demo-s1e1",
            params={"profile_id": self.PROFILE},
            timeout=15,
        )
        assert rd.status_code == 200
        items = client.get(f"{API}/user/progress", params={"profile_id": self.PROFILE}, timeout=15).json()
        assert all(i["content_id"] != "demo-s1e1" for i in items)


# ---------------------- Settings ---------------------- #


class TestSettings:
    PROFILE = "TEST_settings_profile"

    def test_defaults_and_update(self, client):
        r = client.get(f"{API}/user/settings", params={"profile_id": self.PROFILE}, timeout=15)
        assert r.status_code == 200
        s = r.json()
        assert s["preferred_player"] == "hls"
        assert s["autoplay_next"] is True

        new_settings = {
            "profile_id": self.PROFILE,
            "preferred_player": "native",
            "buffer_size": 60,
            "hardware_acceleration": False,
            "autoplay_next": False,
            "subtitle_language": "es",
        }
        r2 = client.put(f"{API}/user/settings", json=new_settings, timeout=15)
        assert r2.status_code == 200
        saved = r2.json()
        assert saved["preferred_player"] == "native"
        assert saved["buffer_size"] == 60
        assert saved["autoplay_next"] is False
        assert "_id" not in saved

        # Verify persistence
        r3 = client.get(f"{API}/user/settings", params={"profile_id": self.PROFILE}, timeout=15)
        assert r3.json()["preferred_player"] == "native"


# ---------------------- Proxy ---------------------- #


def test_proxy_stream_hls_manifest(client):
    url = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    r = client.get(f"{API}/proxy/stream", params={"url": url}, timeout=30, stream=True)
    assert r.status_code == 200
    # Read just first chunk - it's an HLS manifest, text
    body = b""
    for chunk in r.iter_content(chunk_size=1024):
        body += chunk
        if len(body) >= 200:
            break
    r.close()
    text = body.decode("utf-8", errors="ignore")
    assert "#EXTM3U" in text
