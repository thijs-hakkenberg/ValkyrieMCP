"""Minimal MCP stdio client (JSON-RPC 2.0, one message per line), standard library only.

The Valkyrie MCP server keeps the scenario being edited in memory, so one server process
lives for the whole Hermes session and every tool call goes to it.
"""

from __future__ import annotations

import itertools
import json
import os
import subprocess
import threading
from typing import Any, Dict, List, Optional

PROTOCOL_VERSION = "2025-06-18"


class McpError(RuntimeError):
    pass


class McpStdioClient:
    def __init__(self, command: List[str], env: Optional[Dict[str, str]] = None,
                 cwd: Optional[str] = None, stderr_path: Optional[str] = None,
                 client_name: str = "hermes-valkyrie-mom", client_version: str = "0"):
        self.command = command
        self.env = env
        self.cwd = cwd
        self.stderr_path = stderr_path
        self.client_info = {"name": client_name, "version": client_version}
        self._proc: Optional[subprocess.Popen] = None
        self._ids = itertools.count(1)
        self._pending: Dict[int, Dict[str, Any]] = {}
        self._cond = threading.Condition()
        self._write_lock = threading.Lock()
        self._start_lock = threading.Lock()
        self.server_info: Dict[str, Any] = {}

    # -- lifecycle -----------------------------------------------------------------------------
    def _alive(self) -> bool:
        return self._proc is not None and self._proc.poll() is None

    def start(self, timeout: float = 180) -> None:
        with self._start_lock:
            if self._alive():
                return
            stderr = open(self.stderr_path, "ab") if self.stderr_path else subprocess.DEVNULL
            self._proc = subprocess.Popen(
                self.command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=stderr,
                env={**os.environ, **(self.env or {})}, cwd=self.cwd, bufsize=0,
            )
            threading.Thread(target=self._read_loop, name="valkyrie-mcp-reader", daemon=True).start()
            # npx may download the package on first start, hence the generous timeout
            result = self._request("initialize", {
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {},
                "clientInfo": self.client_info,
            }, timeout)
            self.server_info = result.get("serverInfo", {})
            self._send({"jsonrpc": "2.0", "method": "notifications/initialized"})

    def close(self) -> None:
        proc, self._proc = self._proc, None
        if proc and proc.poll() is None:
            try:
                proc.stdin.close()
                proc.wait(timeout=5)
            except Exception:
                proc.kill()

    # -- transport -----------------------------------------------------------------------------
    def _send(self, message: Dict[str, Any]) -> None:
        data = (json.dumps(message) + "\n").encode("utf-8")
        with self._write_lock:
            assert self._proc and self._proc.stdin
            self._proc.stdin.write(data)
            self._proc.stdin.flush()

    def _read_loop(self) -> None:
        proc = self._proc
        assert proc and proc.stdout
        for raw in proc.stdout:
            line = raw.strip()
            if not line:
                continue
            try:
                message = json.loads(line)
            except ValueError:
                continue
            if "id" in message and ("result" in message or "error" in message):
                with self._cond:
                    self._pending[message["id"]] = message
                    self._cond.notify_all()
            elif "id" in message and "method" in message:
                # Server-to-client requests (ping, roots) are not used by this server; answer politely
                reply = {"jsonrpc": "2.0", "id": message["id"], "result": {}}
                if message["method"] != "ping":
                    reply = {"jsonrpc": "2.0", "id": message["id"],
                             "error": {"code": -32601, "message": "Method not supported"}}
                try:
                    self._send(reply)
                except Exception:
                    pass
        with self._cond:
            self._cond.notify_all()

    def _request(self, method: str, params: Dict[str, Any], timeout: float) -> Dict[str, Any]:
        request_id = next(self._ids)
        self._send({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params})
        with self._cond:
            ok = self._cond.wait_for(lambda: request_id in self._pending or not self._alive(), timeout)
            message = self._pending.pop(request_id, None)
        if message is None:
            if not ok:
                raise McpError(f"{method} timed out after {timeout:.0f} s")
            raise McpError(f"The Valkyrie MCP server exited (command: {' '.join(self.command)})")
        if "error" in message:
            raise McpError(message["error"].get("message", str(message["error"])))
        return message.get("result", {})

    # -- MCP -----------------------------------------------------------------------------------
    def request(self, method: str, params: Dict[str, Any], timeout: float = 120) -> Dict[str, Any]:
        self.start()
        return self._request(method, params, timeout)

    def list_tools(self) -> List[Dict[str, Any]]:
        return self.request("tools/list", {}).get("tools", [])

    def call_tool(self, name: str, arguments: Dict[str, Any], timeout: float = 120) -> Dict[str, Any]:
        return self.request("tools/call", {"name": name, "arguments": arguments}, timeout)
