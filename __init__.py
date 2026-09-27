"""Hermes Agent plugin entry point (plugin.yaml sits next to this file).

`hermes plugins install thijs-hakkenberg/ValkyrieMCP` installs this repository as a Hermes
plugin. The npm package does not include this file.
"""

from .hermes_bridge.plugin import register  # noqa: F401
