from __future__ import annotations

import math

import numpy as np

INVERSION_METHOD_LABELS = {
    "ce": "随机搜索/CEM",
    "pso": "粒子群 PSO",
    "ga": "遗传算法 GA",
}


def _fast_rayleigh_factor(vp: float, vs: float, *, fallback: float = 0.92) -> float:
    vp = float(vp)
    vs = float(vs)
    if not np.isfinite(vp) or not np.isfinite(vs) or vs <= 0.0 or vp <= vs:
        return float(fallback)

    ratio2 = (vp / vs) ** 2
    denom = 2.0 * (ratio2 - 1.0)
    if denom <= 0.0:
        return float(fallback)
    poisson = (ratio2 - 2.0) / denom
    poisson = float(np.clip(poisson, 0.0, 0.499))
    factor = (0.862 + 1.14 * poisson) / (1.0 + poisson)
    return float(np.clip(factor, 0.82, 0.96))


def build_layer_parameter_arrays(layer_tops: np.ndarray, values: np.ndarray, max_depth: float, dz: float = 0.5) -> tuple[np.ndarray, np.ndarray]:
    layer_tops = np.asarray(layer_tops, dtype=float).reshape(-1)
    values = np.asarray(values, dtype=float).reshape(-1)
    if layer_tops.size == 0 or values.size == 0 or layer_tops.size != values.size:
        raise ValueError("层顶深度和层参数长度不一致。")
    if max_depth <= 0.0:
        raise ValueError("最大深度必须为正值。")

    depth = np.arange(0.0, max_depth + dz, dz, dtype=float)
    profile = np.full(depth.shape, values[-1], dtype=float)

    for idx, top in enumerate(layer_tops):
        bottom = layer_tops[idx + 1] if idx + 1 < layer_tops.size else np.inf
        mask = (depth >= top) & (depth < bottom)
        profile[mask] = values[idx]
    return depth, profile


def approximate_phase_velocity_curve(
    frequencies_hz: np.ndarray,
    layer_tops: np.ndarray,
    vs_values: np.ndarray,
    *,
    vp_values: np.ndarray | None = None,
    max_depth: float,
    dz: float = 0.5,
    rayleigh_factor: float = 0.92,
    depth_factor: float = 0.65,
    n_iter: int = 10,
) -> np.ndarray:
    frequencies = np.asarray(frequencies_hz, dtype=float).reshape(-1)
    layer_tops = np.asarray(layer_tops, dtype=float).reshape(-1)
    vs_values = np.asarray(vs_values, dtype=float).reshape(-1)
    if frequencies.size == 0:
        return np.empty(0, dtype=np.float32)

    depth, vs_profile = build_layer_parameter_arrays(layer_tops, vs_values, max_depth=max_depth, dz=dz)
    vp_profile = None
    if vp_values is not None:
        vp_array = np.asarray(vp_values, dtype=float).reshape(-1)
        if vp_array.size != vs_values.size:
            raise ValueError("Vp 与 Vs 的层参数长度不一致。")
        _, vp_profile = build_layer_parameter_arrays(layer_tops, vp_array, max_depth=max_depth, dz=dz)
    curve = np.zeros_like(frequencies, dtype=float)
    base_vs = max(float(vs_values[0]), 50.0)
    if vp_profile is not None:
        base_vp = max(float(vp_profile[0]), base_vs * 1.01)
        base_factor = _fast_rayleigh_factor(base_vp, base_vs, fallback=rayleigh_factor)
    else:
        base_factor = float(rayleigh_factor)

    for idx, freq in enumerate(frequencies):
        freq = max(float(freq), 1e-6)
        c = base_factor * base_vs
        for _ in range(max(1, int(n_iter))):
            penetration_depth = max(dz, depth_factor * c / freq)
            weights = np.exp(-depth / penetration_depth)
            effective_vs = float(np.sum(weights * vs_profile) / np.sum(weights))
            if vp_profile is not None:
                effective_vp = float(np.sum(weights * vp_profile) / np.sum(weights))
                effective_vp = max(effective_vp, effective_vs * 1.01)
                local_factor = _fast_rayleigh_factor(effective_vp, effective_vs, fallback=rayleigh_factor)
            else:
                local_factor = float(rayleigh_factor)
            updated = local_factor * effective_vs
            if abs(updated - c) / max(c, 1e-6) < 1e-5:
                c = updated
                break
            c = 0.55 * c + 0.45 * updated
        curve[idx] = c

    return curve.astype(np.float32, copy=False)


def misfit_rms_relative(observed_velocity: np.ndarray, predicted_velocity: np.ndarray) -> float:
    observed = np.asarray(observed_velocity, dtype=float).reshape(-1)
    predicted = np.asarray(predicted_velocity, dtype=float).reshape(-1)
    if observed.size != predicted.size or observed.size == 0:
        raise ValueError("观测曲线与预测曲线长度不一致。")
    residual = (predicted - observed) / np.maximum(np.abs(observed), 1e-6)
    return float(np.sqrt(np.mean(residual**2)))


def _prepare_inputs(
    frequencies_hz: np.ndarray,
    observed_velocity: np.ndarray,
    layer_tops: np.ndarray,
    initial_vs: np.ndarray,
    vs_lower: np.ndarray,
    vs_upper: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    frequencies = np.asarray(frequencies_hz, dtype=float).reshape(-1)
    observed = np.asarray(observed_velocity, dtype=float).reshape(-1)
    layer_tops = np.asarray(layer_tops, dtype=float).reshape(-1)
    initial = np.asarray(initial_vs, dtype=float).reshape(-1)
    lower = np.asarray(vs_lower, dtype=float).reshape(-1)
    upper = np.asarray(vs_upper, dtype=float).reshape(-1)

    n_layers = initial.size
    if n_layers == 0:
        raise ValueError("没有可反演的层参数。")
    if not (layer_tops.size == n_layers == lower.size == upper.size):
        raise ValueError("层参数长度不一致。")
    if np.any(initial <= 0.0):
        raise ValueError("初始 Vs 必须为正值。")
    if np.any(upper <= lower):
        raise ValueError("Vs 上下界设置无效。")
    if frequencies.size != observed.size or frequencies.size == 0:
        raise ValueError("观测频散曲线无效。")

    return frequencies, observed, layer_tops, np.clip(initial, lower, upper), lower, upper


def _predict_curve(
    frequencies: np.ndarray,
    layer_tops: np.ndarray,
    vs_values: np.ndarray,
    *,
    vp_values: np.ndarray | None,
    max_depth: float,
    dz: float,
    rayleigh_factor: float,
    depth_factor: float,
) -> np.ndarray:
    return approximate_phase_velocity_curve(
        frequencies,
        layer_tops,
        vs_values,
        vp_values=vp_values,
        max_depth=max_depth,
        dz=dz,
        rayleigh_factor=rayleigh_factor,
        depth_factor=depth_factor,
    )


def _evaluate_candidate(
    candidate_vs: np.ndarray,
    frequencies: np.ndarray,
    observed: np.ndarray,
    layer_tops: np.ndarray,
    *,
    vp_values: np.ndarray | None,
    max_depth: float,
    dz: float,
    rayleigh_factor: float,
    depth_factor: float,
) -> tuple[float, np.ndarray]:
    curve = _predict_curve(
        frequencies,
        layer_tops,
        candidate_vs,
        vp_values=vp_values,
        max_depth=max_depth,
        dz=dz,
        rayleigh_factor=rayleigh_factor,
        depth_factor=depth_factor,
    )
    misfit = misfit_rms_relative(observed, curve)
    return misfit, curve


def _build_result(
    method: str,
    initial_vs: np.ndarray,
    lower_vs: np.ndarray,
    upper_vs: np.ndarray,
    initial_curve: np.ndarray,
    best_vs: np.ndarray,
    best_curve: np.ndarray,
    history: list[float] | np.ndarray,
) -> dict[str, np.ndarray | float | str]:
    initial_misfit = misfit_rms_relative(initial_curve, initial_curve)
    return {
        "method": method,
        "method_label": INVERSION_METHOD_LABELS.get(method, method.upper()),
        "initial_vs": initial_vs.astype(np.float32, copy=False),
        "best_vs": best_vs.astype(np.float32, copy=False),
        "lower_vs": lower_vs.astype(np.float32, copy=False),
        "upper_vs": upper_vs.astype(np.float32, copy=False),
        "initial_curve": initial_curve.astype(np.float32, copy=False),
        "best_curve": best_curve.astype(np.float32, copy=False),
        "history": np.asarray(history, dtype=np.float32),
        "initial_misfit": float(history[0]) if len(history) else float(initial_misfit),
        "best_misfit": float(np.min(history)) if len(history) else float(initial_misfit),
    }


def _make_result(
    method: str,
    initial_vs: np.ndarray,
    lower_vs: np.ndarray,
    upper_vs: np.ndarray,
    initial_curve: np.ndarray,
    initial_misfit: float,
    best_vs: np.ndarray,
    best_curve: np.ndarray,
    best_misfit: float,
    history: list[float] | np.ndarray,
) -> dict[str, np.ndarray | float | str]:
    return {
        "method": method,
        "method_label": INVERSION_METHOD_LABELS.get(method, method.upper()),
        "initial_vs": initial_vs.astype(np.float32, copy=False),
        "best_vs": best_vs.astype(np.float32, copy=False),
        "lower_vs": lower_vs.astype(np.float32, copy=False),
        "upper_vs": upper_vs.astype(np.float32, copy=False),
        "initial_curve": initial_curve.astype(np.float32, copy=False),
        "best_curve": best_curve.astype(np.float32, copy=False),
        "history": np.asarray(history, dtype=np.float32),
        "initial_misfit": float(initial_misfit),
        "best_misfit": float(best_misfit),
    }


def _invert_ce(
    frequencies: np.ndarray,
    observed: np.ndarray,
    layer_tops: np.ndarray,
    initial: np.ndarray,
    lower: np.ndarray,
    upper: np.ndarray,
    *,
    vp_values: np.ndarray | None,
    max_depth: float,
    iterations: int,
    population: int,
    seed: int,
    dz: float,
    rayleigh_factor: float,
    depth_factor: float,
) -> dict[str, np.ndarray | float | str]:
    rng = np.random.default_rng(int(seed))
    spread = upper - lower
    mean = initial.copy()

    initial_misfit, initial_curve = _evaluate_candidate(
        mean,
        frequencies,
        observed,
        layer_tops,
        vp_values=vp_values,
        max_depth=max_depth,
        dz=dz,
        rayleigh_factor=rayleigh_factor,
        depth_factor=depth_factor,
    )
    best_vs = mean.copy()
    best_curve = initial_curve.copy()
    best_misfit = float(initial_misfit)
    history = [best_misfit]
    sigma = np.maximum(spread * 0.18, 10.0)

    n_population = max(4, int(population))
    n_iterations = max(1, int(iterations))
    n_elite = max(2, n_population // 4)

    for _ in range(n_iterations):
        candidates = np.empty((n_population, initial.size), dtype=float)
        misfits = np.empty(n_population, dtype=float)
        curves = np.empty((n_population, frequencies.size), dtype=float)

        candidates[0] = best_vs
        curves[0] = best_curve
        misfits[0] = best_misfit

        for idx in range(1, n_population):
            branch = idx % 3
            if branch == 0:
                candidate = mean + rng.normal(scale=sigma, size=initial.size)
            elif branch == 1:
                candidate = best_vs + rng.normal(scale=np.maximum(0.55 * sigma, 5.0), size=initial.size)
            else:
                candidate = lower + rng.random(initial.size) * spread
            candidate = np.clip(candidate, lower, upper)
            candidates[idx] = candidate
            misfits[idx], curves[idx] = _evaluate_candidate(
                candidate,
                frequencies,
                observed,
                layer_tops,
                vp_values=vp_values,
                max_depth=max_depth,
                dz=dz,
                rayleigh_factor=rayleigh_factor,
                depth_factor=depth_factor,
            )

        order = np.argsort(misfits)
        elite = candidates[order[:n_elite]]
        mean = np.mean(elite, axis=0)
        sigma = np.maximum(np.std(elite, axis=0), spread * 0.03)

        if misfits[order[0]] < best_misfit:
            best_misfit = float(misfits[order[0]])
            best_vs = candidates[order[0]].copy()
            best_curve = curves[order[0]].astype(np.float32, copy=True)
        history.append(best_misfit)

    return _make_result("ce", initial, lower, upper, initial_curve, initial_misfit, best_vs, best_curve, best_misfit, history)


def _invert_pso(
    frequencies: np.ndarray,
    observed: np.ndarray,
    layer_tops: np.ndarray,
    initial: np.ndarray,
    lower: np.ndarray,
    upper: np.ndarray,
    *,
    vp_values: np.ndarray | None,
    max_depth: float,
    iterations: int,
    population: int,
    seed: int,
    dz: float,
    rayleigh_factor: float,
    depth_factor: float,
) -> dict[str, np.ndarray | float | str]:
    rng = np.random.default_rng(int(seed))
    spread = upper - lower
    n_layers = initial.size
    n_particles = max(6, int(population))
    n_iterations = max(1, int(iterations))

    positions = lower + rng.random((n_particles, n_layers)) * spread
    positions[0] = initial.copy()
    velocities = rng.normal(scale=0.08 * spread, size=(n_particles, n_layers))

    pbest_positions = positions.copy()
    pbest_curves = np.empty((n_particles, frequencies.size), dtype=float)
    pbest_misfits = np.empty(n_particles, dtype=float)
    for idx in range(n_particles):
        pbest_misfits[idx], pbest_curves[idx] = _evaluate_candidate(
            positions[idx],
            frequencies,
            observed,
            layer_tops,
            vp_values=vp_values,
            max_depth=max_depth,
            dz=dz,
            rayleigh_factor=rayleigh_factor,
            depth_factor=depth_factor,
        )

    best_index = int(np.argmin(pbest_misfits))
    best_vs = pbest_positions[best_index].copy()
    best_curve = pbest_curves[best_index].copy()
    best_misfit = float(pbest_misfits[best_index])
    initial_curve = pbest_curves[0].copy()
    initial_misfit = float(pbest_misfits[0])
    history = [best_misfit]

    for iteration in range(n_iterations):
        inertia = 0.88 - 0.45 * (iteration / max(n_iterations, 1))
        c1 = 1.7
        c2 = 1.9

        r1 = rng.random((n_particles, n_layers))
        r2 = rng.random((n_particles, n_layers))
        velocities = (
            inertia * velocities
            + c1 * r1 * (pbest_positions - positions)
            + c2 * r2 * (best_vs[None, :] - positions)
        )
        velocities = np.clip(velocities, -0.35 * spread, 0.35 * spread)
        positions = np.clip(positions + velocities, lower, upper)

        for idx in range(n_particles):
            misfit, curve = _evaluate_candidate(
                positions[idx],
                frequencies,
                observed,
                layer_tops,
                vp_values=vp_values,
                max_depth=max_depth,
                dz=dz,
                rayleigh_factor=rayleigh_factor,
                depth_factor=depth_factor,
            )
            if misfit < pbest_misfits[idx]:
                pbest_misfits[idx] = misfit
                pbest_positions[idx] = positions[idx].copy()
                pbest_curves[idx] = curve

        best_index = int(np.argmin(pbest_misfits))
        if pbest_misfits[best_index] < best_misfit:
            best_misfit = float(pbest_misfits[best_index])
            best_vs = pbest_positions[best_index].copy()
            best_curve = pbest_curves[best_index].copy()
        history.append(best_misfit)

    return _make_result("pso", initial, lower, upper, initial_curve, initial_misfit, best_vs, best_curve, best_misfit, history)


def _tournament_select(rng: np.random.Generator, population: np.ndarray, misfits: np.ndarray, tournament_size: int = 3) -> np.ndarray:
    indices = rng.integers(0, population.shape[0], size=max(2, tournament_size))
    best_index = indices[int(np.argmin(misfits[indices]))]
    return population[best_index].copy()


def _invert_ga(
    frequencies: np.ndarray,
    observed: np.ndarray,
    layer_tops: np.ndarray,
    initial: np.ndarray,
    lower: np.ndarray,
    upper: np.ndarray,
    *,
    vp_values: np.ndarray | None,
    max_depth: float,
    iterations: int,
    population: int,
    seed: int,
    dz: float,
    rayleigh_factor: float,
    depth_factor: float,
) -> dict[str, np.ndarray | float | str]:
    rng = np.random.default_rng(int(seed))
    spread = upper - lower
    n_layers = initial.size
    n_population = max(8, int(population))
    n_iterations = max(1, int(iterations))
    n_elite = max(2, n_population // 5)

    population_array = lower + rng.random((n_population, n_layers)) * spread
    population_array[0] = initial.copy()
    population_array[1] = np.clip(initial + rng.normal(scale=0.08 * spread, size=n_layers), lower, upper)

    curves = np.empty((n_population, frequencies.size), dtype=float)
    misfits = np.empty(n_population, dtype=float)
    for idx in range(n_population):
        misfits[idx], curves[idx] = _evaluate_candidate(
            population_array[idx],
            frequencies,
            observed,
            layer_tops,
            vp_values=vp_values,
            max_depth=max_depth,
            dz=dz,
            rayleigh_factor=rayleigh_factor,
            depth_factor=depth_factor,
        )

    initial_curve = curves[0].copy()
    initial_misfit = float(misfits[0])
    best_index = int(np.argmin(misfits))
    best_vs = population_array[best_index].copy()
    best_curve = curves[best_index].copy()
    best_misfit = float(misfits[best_index])
    history = [best_misfit]

    for iteration in range(n_iterations):
        order = np.argsort(misfits)
        elite = population_array[order[:n_elite]].copy()
        next_population = [elite[idx].copy() for idx in range(n_elite)]
        mutation_scale = np.maximum(spread * (0.18 - 0.12 * iteration / max(n_iterations, 1)), 5.0)

        while len(next_population) < n_population:
            parent1 = _tournament_select(rng, population_array, misfits)
            parent2 = _tournament_select(rng, population_array, misfits)
            alpha = rng.random(n_layers)
            child = alpha * parent1 + (1.0 - alpha) * parent2

            if rng.random() < 0.85:
                child += rng.normal(scale=mutation_scale, size=n_layers)
            if rng.random() < 0.20:
                child[rng.integers(0, n_layers)] = lower[rng.integers(0, n_layers)] + rng.random() * spread[rng.integers(0, n_layers)]

            child = np.clip(child, lower, upper)
            next_population.append(child)

        population_array = np.asarray(next_population[:n_population], dtype=float)
        for idx in range(n_population):
            misfits[idx], curves[idx] = _evaluate_candidate(
                population_array[idx],
                frequencies,
                observed,
                layer_tops,
                vp_values=vp_values,
                max_depth=max_depth,
                dz=dz,
                rayleigh_factor=rayleigh_factor,
                depth_factor=depth_factor,
            )

        best_index = int(np.argmin(misfits))
        if misfits[best_index] < best_misfit:
            best_misfit = float(misfits[best_index])
            best_vs = population_array[best_index].copy()
            best_curve = curves[best_index].copy()
        history.append(best_misfit)

    return _make_result("ga", initial, lower, upper, initial_curve, initial_misfit, best_vs, best_curve, best_misfit, history)


def invert_layered_vs(
    frequencies_hz: np.ndarray,
    observed_velocity: np.ndarray,
    layer_tops: np.ndarray,
    initial_vs: np.ndarray,
    *,
    vp_values: np.ndarray | None = None,
    max_depth: float,
    vs_lower: np.ndarray,
    vs_upper: np.ndarray,
    method: str = "ce",
    iterations: int = 180,
    population: int = 24,
    seed: int = 42,
    dz: float = 0.5,
    rayleigh_factor: float = 0.92,
    depth_factor: float = 0.65,
) -> dict[str, np.ndarray | float | str]:
    frequencies, observed, layer_tops, initial, lower, upper = _prepare_inputs(
        frequencies_hz, observed_velocity, layer_tops, initial_vs, vs_lower, vs_upper
    )

    method = str(method).lower()
    common = dict(
        frequencies=frequencies,
        observed=observed,
        layer_tops=layer_tops,
        initial=initial,
        lower=lower,
        upper=upper,
        vp_values=None if vp_values is None else np.asarray(vp_values, dtype=float).reshape(-1),
        max_depth=max_depth,
        iterations=iterations,
        population=population,
        seed=seed,
        dz=dz,
        rayleigh_factor=rayleigh_factor,
        depth_factor=depth_factor,
    )

    if method == "ce":
        return _invert_ce(**common)
    if method == "pso":
        return _invert_pso(**common)
    if method == "ga":
        return _invert_ga(**common)
    raise ValueError(f"不支持的反演算法：{method}")


def compare_inversion_methods(
    frequencies_hz: np.ndarray,
    observed_velocity: np.ndarray,
    layer_tops: np.ndarray,
    initial_vs: np.ndarray,
    *,
    vp_values: np.ndarray | None = None,
    max_depth: float,
    vs_lower: np.ndarray,
    vs_upper: np.ndarray,
    methods: tuple[str, ...] = ("ce", "pso", "ga"),
    iterations: int = 180,
    population: int = 24,
    seed: int = 42,
    dz: float = 0.5,
    rayleigh_factor: float = 0.92,
    depth_factor: float = 0.65,
) -> dict[str, dict[str, np.ndarray | float | str]]:
    results: dict[str, dict[str, np.ndarray | float | str]] = {}
    for offset, method in enumerate(methods):
        results[method] = invert_layered_vs(
            frequencies_hz,
            observed_velocity,
            layer_tops,
            initial_vs,
            vp_values=vp_values,
            max_depth=max_depth,
            vs_lower=vs_lower,
            vs_upper=vs_upper,
            method=method,
            iterations=iterations,
            population=population,
            seed=seed + offset * 17,
            dz=dz,
            rayleigh_factor=rayleigh_factor,
            depth_factor=depth_factor,
        )
    return results


def step_profile_arrays(layer_tops: np.ndarray, values: np.ndarray, max_depth: float) -> tuple[np.ndarray, np.ndarray]:
    layer_tops = np.asarray(layer_tops, dtype=float).reshape(-1)
    values = np.asarray(values, dtype=float).reshape(-1)
    if layer_tops.size == 0 or values.size == 0 or layer_tops.size != values.size:
        return np.empty(0, dtype=np.float32), np.empty(0, dtype=np.float32)

    x_values: list[float] = []
    y_values: list[float] = []
    for idx, top in enumerate(layer_tops):
        bottom = layer_tops[idx + 1] if idx + 1 < layer_tops.size else float(max_depth)
        x_values.extend([values[idx], values[idx]])
        y_values.extend([top, bottom])
    return np.asarray(x_values, dtype=np.float32), np.asarray(y_values, dtype=np.float32)
