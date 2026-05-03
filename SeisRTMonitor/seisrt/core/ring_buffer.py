from __future__ import annotations

import numpy as np


class RingBuffer:
    """固定长度环形缓冲区，用于实时波形滚动显示。"""

    def __init__(self, capacity: int) -> None:
        self.capacity = int(capacity)
        self.data = np.zeros(self.capacity, dtype=np.float32)
        self.write_index = 0
        self.size = 0

    def append(self, values) -> None:
        arr = np.asarray(values, dtype=np.float32)
        if arr.size >= self.capacity:
            self.data[:] = arr[-self.capacity:]
            self.write_index = 0
            self.size = self.capacity
            return
        end = self.write_index + arr.size
        if end <= self.capacity:
            self.data[self.write_index:end] = arr
        else:
            first = self.capacity - self.write_index
            self.data[self.write_index:] = arr[:first]
            self.data[:end % self.capacity] = arr[first:]
        self.write_index = end % self.capacity
        self.size = min(self.capacity, self.size + arr.size)

    def snapshot(self):
        if self.size < self.capacity:
            return self.data[:self.size].copy()
        return np.concatenate((self.data[self.write_index:], self.data[:self.write_index]))
