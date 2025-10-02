__all__ = [
    "solve_1d",
    "read_problem_1d",
    "write_plan_1d",
]

__version__ = "0.1.0"

from .solver1d import solve_1d  # noqa: E402
from .io import read_problem_1d, write_plan_1d  # noqa: E402
