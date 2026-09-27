"""Hermes Agent plugin: the Valkyrie MoM MCP tools and skills, native in Hermes.

Tools are registered from ``tools.json`` (exported from the MCP server at release time, so
Hermes starts without launching Node) and forwarded to one long-lived MCP server process,
which holds the scenario being edited. The eight SKILL.md files register as
``valkyrie-mom:<skill>``.
"""

from __future__ import annotations

import atexit
import base64
import json
import os
import re
import shlex
import shutil
import threading
import time
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

from .mcp_client import McpError, McpStdioClient

PLUGIN_ROOT = Path(__file__).resolve().parent.parent
TOOLS_FILE = Path(__file__).with_name("tools.json")
TOOLSET = "valkyrie-mom"
NPM_PACKAGE = "@thijshakkenberg/valkyrie-mom-mcp"

# Tools that legitimately run for minutes (model loading, packaging)
TIMEOUTS = {"generate_artwork": 1200.0, "build_scenario": 300.0, "export_bug_report": 300.0}
DEFAULT_TIMEOUT = 180.0

_client: Optional[McpStdioClient] = None
_client_lock = threading.Lock()


def plugin_version() -> str:
    """The plugin.yaml version, which is also the npm package version the bridge runs."""
    text = (PLUGIN_ROOT / "plugin.yaml").read_text(encoding="utf-8")
    match = re.search(r'^version:\s*"?([^"\s]+)"?\s*$', text, re.MULTILINE)
    return match.group(1) if match else "latest"


def server_command() -> List[str]:
    """``VALKYRIE_MCP_COMMAND`` overrides (e.g. ``npx tsx src/index.ts`` in a checkout)."""
    override = os.environ.get("VALKYRIE_MCP_COMMAND")
    if override:
        return shlex.split(override)
    return ["npx", "-y", f"{NPM_PACKAGE}@{plugin_version()}"]


def _cache_dir() -> Path:
    home = Path(os.environ.get("HERMES_HOME", Path.home() / ".hermes"))
    path = home / "cache" / "valkyrie-mom"
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_client() -> McpStdioClient:
    global _client
    with _client_lock:
        if _client is None:
            _client = McpStdioClient(
                server_command(),
                cwd=os.environ.get("VALKYRIE_MCP_CWD") or None,
                stderr_path=str(_cache_dir() / "server.log"),
                client_version=plugin_version(),
            )
            atexit.register(_client.close)
        return _client


def format_result(tool: str, result: Dict[str, Any]) -> str:
    """MCP content → one JSON string: the text, plus images saved to files (map renders, artwork previews)."""
    texts: List[str] = []
    images: List[str] = []
    for i, part in enumerate(result.get("content", [])):
        kind = part.get("type")
        if kind == "text":
            texts.append(part.get("text", ""))
        elif kind == "image" and part.get("data"):
            ext = "jpg" if "jpeg" in part.get("mimeType", "") else "png"
            path = _cache_dir() / f"{tool}-{int(time.time() * 1000)}-{i}.{ext}"
            path.write_bytes(base64.b64decode(part["data"]))
            images.append(str(path))
    payload: Dict[str, Any] = {"success": not result.get("isError", False), "output": "\n".join(texts)}
    if images:
        payload["images"] = images
    return json.dumps(payload, ensure_ascii=False)


def make_handler(tool: str) -> Callable[..., str]:
    def handler(args: Dict[str, Any], **kwargs: Any) -> str:
        del kwargs
        try:
            result = get_client().call_tool(tool, dict(args or {}), TIMEOUTS.get(tool, DEFAULT_TIMEOUT))
        except (McpError, OSError) as exc:
            return json.dumps({"success": False, "error": f"{tool}: {exc}"})
        return format_result(tool, result)
    handler.__name__ = f"valkyrie_{tool}"
    return handler


def node_available() -> bool:
    return bool(os.environ.get("VALKYRIE_MCP_COMMAND")) or shutil.which("npx") is not None


def load_tool_specs() -> List[Dict[str, Any]]:
    return json.loads(TOOLS_FILE.read_text(encoding="utf-8"))


def hermes_schema(spec: Dict[str, Any]) -> Dict[str, Any]:
    parameters = {k: v for k, v in spec.get("inputSchema", {}).items() if k != "$schema"}
    parameters.setdefault("type", "object")
    parameters.setdefault("properties", {})
    return {"name": spec["name"], "description": spec.get("description", ""), "parameters": parameters}


def _skill_description(skill_md: Path) -> str:
    match = re.search(r"^description:\s*(.+)$", skill_md.read_text(encoding="utf-8"), re.MULTILINE)
    return match.group(1).strip() if match else ""


def register(ctx: Any) -> None:
    for spec in load_tool_specs():
        ctx.register_tool(
            name=spec["name"],
            toolset=TOOLSET,
            schema=hermes_schema(spec),
            handler=make_handler(spec["name"]),
            check_fn=node_available,
            description=spec.get("description", ""),
            emoji="🐙",
        )
    for skill_md in sorted((PLUGIN_ROOT / "skills").glob("*/SKILL.md")):
        ctx.register_skill(skill_md.parent.name, skill_md, description=_skill_description(skill_md))
