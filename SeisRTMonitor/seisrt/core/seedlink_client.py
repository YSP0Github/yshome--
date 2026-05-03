from __future__ import annotations

import threading
from collections.abc import Callable

from obspy.clients.seedlink.easyseedlink import create_client

from seisrt.core.models import StreamId


class SeedLinkWorker:
    """后台 SeedLink 接收器。

    注意：不要在该线程直接操作 GUI；通过 Qt signal 或线程安全队列把 trace 交给 GUI 层。
    """

    def __init__(self, server: str, stream_id: StreamId, on_trace: Callable) -> None:
        self.server = server
        self.stream_id = stream_id
        self.on_trace = on_trace
        self._client = None
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._client = create_client(self.server, on_data=self.on_trace)
        self._client.select_stream(
            self.stream_id.network,
            self.stream_id.station,
            self.stream_id.seedlink_selector,
        )
        self._thread = threading.Thread(target=self._client.run, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        if self._client is not None:
            self._client.conn.terminate()
            self._client.conn.disconnect()
        if self._thread is not None:
            self._thread.join(timeout=3)
