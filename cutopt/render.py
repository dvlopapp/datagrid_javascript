from __future__ import annotations

from typing import Dict, Any, List


def render_plan_1d_ascii(plan: Dict[str, Any], max_width: int = 80) -> str:
    lines: List[str] = []
    plans = plan.get("plans", [])
    for p in plans:
        stock_len = float(p["stock_length"])
        usable = float(p.get("usable_length", stock_len))
        items = p.get("items", [])
        trim_left = float(p.get("trim_left", 0))
        trim_right = float(p.get("trim_right", 0))
        kerf = float(p.get("kerf", 0))
        waste = float(p.get("waste_usable", 0))

        width = max(10, min(max_width, 80))
        scale = width / stock_len if stock_len > 0 else 1.0

        lines.append(
            f"[bar {p.get('bar_index', '?')}] {stock_len:g} (usable {usable:g})"
        )
        # Left trim
        bar_line = "|"
        if trim_left > 0:
            bar_line += "." * max(1, int(trim_left * scale))
        cursor_consumed = 0.0

        for idx, it in enumerate(items):
            length = float(it["length"])
            seg = max(1, int(length * scale))
            bar_line += "[" + it.get("demand_id", "?") + ":" + f"{length:g}" + "]"
            bar_line += "=" * seg
            cursor_consumed += length
            if idx < len(items) - 1 and kerf > 0:
                kchars = max(1, int(kerf * scale))
                bar_line += "|" * kchars
                cursor_consumed += 0  # visual only
        # Right trim and waste visualization
        if trim_right > 0:
            bar_line += "." * max(1, int(trim_right * scale))
        # Remaining usable waste
        if waste > 0:
            bar_line += "_" * max(1, int(waste * scale))
        bar_line += "|"
        lines.append(bar_line)
        lines.append("")

    if not plans:
        return "(no bars)"

    return "\n".join(lines)
