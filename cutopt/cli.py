from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict

from .io import read_problem_1d, write_plan_1d
from .solver1d import solve_1d
from .render import render_plan_1d_ascii


def _load_json(path: str | None) -> Dict[str, Any]:
    if path is None:
        return json.load(sys.stdin)
    return json.loads(Path(path).read_text())


def _dump_json(data: Dict[str, Any], path: str | None) -> None:
    serialized = json.dumps(data, indent=2, ensure_ascii=False)
    if path is None:
        print(serialized)
    else:
        Path(path).write_text(serialized)


def cmd_solve_1d(args: argparse.Namespace) -> int:
    problem = _load_json(args.input)
    # CLI overrides
    if args.kerf is not None:
        problem["kerf"] = args.kerf
    if args.trim_left is not None:
        problem["trim_left"] = args.trim_left
    if args.trim_right is not None:
        problem["trim_right"] = args.trim_right

    data = read_problem_1d(problem)
    plan = solve_1d(data)
    # Include ASCII preview if requested
    if args.ascii:
        ascii_art = render_plan_1d_ascii(plan, max_width=args.width)
        plan.setdefault("meta", {})["ascii_preview"] = ascii_art
    _dump_json(plan, args.output)
    return 0


def cmd_render_1d(args: argparse.Namespace) -> int:
    if args.plan:
        plan = _load_json(args.plan)
    else:
        # If only input is provided, solve then render
        problem = _load_json(args.input)
        data = read_problem_1d(problem)
        plan = solve_1d(data)
    ascii_art = render_plan_1d_ascii(plan, max_width=args.width)
    print(ascii_art)
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="cutopt", description="Cutting optimizer CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p1d = sub.add_parser("solve-1d", help="Solve 1D cutting problem from JSON")
    p1d.add_argument("-i", "--input", help="Problem JSON file (or stdin)")
    p1d.add_argument("-o", "--output", help="Output plan JSON (or stdout)")
    p1d.add_argument("--kerf", type=float, help="Override saw kerf")
    p1d.add_argument("--trim-left", type=float, help="Left trim allowance")
    p1d.add_argument("--trim-right", type=float, help="Right trim allowance")
    p1d.add_argument("--ascii", action="store_true", help="Embed ASCII preview in output")
    p1d.add_argument("--width", type=int, default=80, help="Max ASCII width")
    p1d.set_defaults(func=cmd_solve_1d)

    r1d = sub.add_parser("render-1d", help="Render a 1D plan as ASCII")
    r1d.add_argument("-p", "--plan", help="Plan JSON (or generate from input)")
    r1d.add_argument("-i", "--input", help="Problem JSON to solve-and-render")
    r1d.add_argument("--width", type=int, default=80, help="Max ASCII width")
    r1d.set_defaults(func=cmd_render_1d)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
