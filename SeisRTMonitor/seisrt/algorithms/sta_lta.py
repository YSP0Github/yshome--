from __future__ import annotations

import numpy as np


def classic_sta_lta(data, nsta: int, nlta: int):
    """轻量 STA/LTA 占位实现；后续可替换为 ObsPy 实现。"""
    x = np.asarray(data, dtype=np.float64) ** 2
    if len(x) < nlta or nsta <= 0 or nlta <= nsta:
        return np.zeros_like(x)
    sta = np.convolve(x, np.ones(nsta) / nsta, mode="same")
    lta = np.convolve(x, np.ones(nlta) / nlta, mode="same")
    lta[lta == 0] = np.finfo(float).eps
    return sta / lta
