from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Any


@dataclass
class Demand1D:
    id: str
    length: float
    quantity: int


@dataclass
class StockType1D:
    id: str
    length: float
    quantity: Optional[int]  # None means infinite


@dataclass
class Problem1D:
    stock_types: List[StockType1D]
    demands: List[Demand1D]
    kerf: float
    trim_left: float
    trim_right: float


# ---------- IO helpers ----------


def read_problem_1d(data: Dict[str, Any]) -> Problem1D:
    kerf = float(data.get("kerf", 0.0))
    trim_left = float(data.get("trim_left", 0.0))
    trim_right = float(data.get("trim_right", 0.0))

    raw_stock = data.get("stock") or []
    stock_types: List[StockType1D] = []
    for s in raw_stock:
        stock_types.append(
            StockType1D(
                id=str(s.get("id") or f"stock_{len(stock_types)+1}"),
                length=float(s["length"]),
                quantity=(int(s["quantity"]) if s.get("quantity") is not None else None),
            )
        )

    raw_demands = data.get("demands") or []
    demands: List[Demand1D] = []
    for d in raw_demands:
        qty = int(d.get("quantity", 1))
        if qty <= 0:
            continue
        demands.append(
            Demand1D(
                id=str(d.get("id") or f"item_{len(demands)+1}"),
                length=float(d["length"]),
                quantity=qty,
            )
        )

    return Problem1D(
        stock_types=stock_types,
        demands=demands,
        kerf=kerf,
        trim_left=trim_left,
        trim_right=trim_right,
    )


def write_plan_1d(plan: Dict[str, Any]) -> Dict[str, Any]:
    # identity passthrough for now, placeholder if transformation is needed later
    return plan
