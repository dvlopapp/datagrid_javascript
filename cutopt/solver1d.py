from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any

from .io import Problem1D, Demand1D, StockType1D


@dataclass
class PlacedItem:
    demand_id: str
    length: float


@dataclass
class BarPlan:
    stock_id: str
    stock_length: float
    trim_left: float
    trim_right: float
    kerf: float
    items: List[PlacedItem] = field(default_factory=list)

    def usable_length(self) -> float:
        return max(0.0, self.stock_length - self.trim_left - self.trim_right)

    def consumed_length(self) -> float:
        if not self.items:
            return 0.0
        total_items = sum(i.length for i in self.items)
        cuts = max(0, len(self.items) - 1)
        return total_items + cuts * self.kerf

    def remaining_length(self) -> float:
        return self.usable_length() - self.consumed_length()

    def can_fit(self, length: float) -> bool:
        additional_kerf = self.kerf if self.items else 0.0
        return (self.consumed_length() + additional_kerf + length) <= self.usable_length() + 1e-9

    def add_item(self, demand_id: str, length: float) -> None:
        if not self.can_fit(length):
            raise ValueError("Item does not fit in this bar")
        self.items.append(PlacedItem(demand_id=demand_id, length=length))

    def waste_usable(self) -> float:
        return max(0.0, self.usable_length() - self.consumed_length())


@dataclass
class InventoryStock:
    stock_id: str
    length: float
    remaining_qty: Optional[int]  # None means infinite

    def take_one(self) -> bool:
        if self.remaining_qty is None:
            return True
        if self.remaining_qty <= 0:
            return False
        self.remaining_qty -= 1
        return True


# ---------- Core solver (greedy FFD with best-fit for open bars) ----------


def solve_1d(problem: Problem1D) -> Dict[str, Any]:
    # Build inventory
    inventory: List[InventoryStock] = [
        InventoryStock(stock_id=s.id, length=s.length, remaining_qty=s.quantity)
        for s in problem.stock_types
    ]
    # Sort inventory by length descending (prefer longer bars for flexibility)
    inventory.sort(key=lambda x: x.length, reverse=True)

    # Expand demands into individual items and sort by length descending
    expanded_items: List[PlacedItem] = []
    for d in problem.demands:
        for _ in range(d.quantity):
            expanded_items.append(PlacedItem(demand_id=d.id, length=d.length))
    expanded_items.sort(key=lambda x: x.length, reverse=True)

    if not expanded_items:
        return {
            "plans": [],
            "summary": {"total_bars": 0, "total_waste": 0.0, "utilization": 1.0},
            "meta": {"assumptions": _assumptions()},
        }

    open_bars: List[BarPlan] = []
    all_bars: List[BarPlan] = []

    for item in expanded_items:
        placed = False
        # Try to place into the open bar with least remaining length that still fits (best-fit)
        candidates = [b for b in open_bars if b.can_fit(item.length)]
        candidates.sort(key=lambda b: b.remaining_length())
        if candidates:
            candidates[0].add_item(item.demand_id, item.length)
            placed = True
        else:
            # Open a new bar from inventory that can fit this item
            chosen: Optional[InventoryStock] = None
            for inv in inventory:
                # Check if this stock has available quantity and can fit item
                if (inv.remaining_qty is None or inv.remaining_qty > 0) and (
                    inv.length - problem.trim_left - problem.trim_right >= item.length
                ):
                    chosen = inv
                    break
            if chosen is None:
                raise RuntimeError(
                    f"No available stock can fit demand {item.demand_id} length={item.length}"
                )
            if not chosen.take_one():
                raise RuntimeError("Inventory bookkeeping error")
            bar = BarPlan(
                stock_id=chosen.stock_id,
                stock_length=chosen.length,
                trim_left=problem.trim_left,
                trim_right=problem.trim_right,
                kerf=problem.kerf,
            )
            bar.add_item(item.demand_id, item.length)
            open_bars.append(bar)
            all_bars.append(bar)
            placed = True
        if not placed:
            raise RuntimeError("Placement logic failure")

        # Optional: close bars that are too tight to fit even the smallest remaining item
        smallest_remaining = expanded_items[-1].length if expanded_items else 0.0
        still_open: List[BarPlan] = []
        for b in open_bars:
            if b.remaining_length() + (0 if not b.items else -b.kerf) >= smallest_remaining:
                still_open.append(b)
        open_bars = still_open

    # Summaries
    out_plans: List[Dict[str, Any]] = []
    total_waste = 0.0
    for idx, b in enumerate(all_bars, start=1):
        usable = b.usable_length()
        consumed = b.consumed_length()
        waste_usable = max(0.0, usable - consumed)
        total_waste += waste_usable + b.trim_left + b.trim_right
        out_plans.append(
            {
                "bar_index": idx,
                "stock_id": b.stock_id,
                "stock_length": b.stock_length,
                "trim_left": b.trim_left,
                "trim_right": b.trim_right,
                "kerf": b.kerf,
                "usable_length": usable,
                "consumed_length": consumed,
                "waste_usable": waste_usable,
                "waste_total": waste_usable + b.trim_left + b.trim_right,
                "items": [
                    {"demand_id": i.demand_id, "length": i.length} for i in b.items
                ],
            }
        )

    total_stock = sum(b.stock_length for b in all_bars)
    utilization = 0.0 if total_stock <= 0 else (total_stock - total_waste) / total_stock

    return {
        "plans": out_plans,
        "summary": {
            "total_bars": len(all_bars),
            "total_stock_length": total_stock,
            "total_waste": total_waste,
            "utilization": utilization,
        },
        "meta": {"assumptions": _assumptions()},
    }


def _assumptions() -> List[str]:
    return [
        "Greedy best-fit decreasing heuristic",
        "Usable length = stock_length - trim_left - trim_right",
        "Consumed = sum(items) + kerf * (num_items - 1)",
        "No head/tail cuts beyond trims",
        "No item splitting; no pattern enumeration",
    ]
