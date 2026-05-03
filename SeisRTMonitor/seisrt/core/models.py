from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class StreamId:
    network: str
    station: str
    location: str
    channel: str

    @property
    def seedlink_selector(self) -> str:
        loc = self.location.strip()
        if loc in ("", "*"):
            loc = "??"
        elif loc == "--":
            loc = "  "
        return f"{loc}{self.channel.strip()}"
