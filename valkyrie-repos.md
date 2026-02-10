# Valkyrie Repo Overview

Valkyrie is a scenario builder and player for Fantasy Flight board games (Descent 2nd Ed, Mansions of Madness 2nd Ed). The project spans three active repositories.

## Repos

### valkyrie (main engine)
- Unity 2019.4 C# application (Windows, macOS, Linux, Android)
- Single-scene app with code-driven UI, quest editor, and content loading system
- Central singleton `Game.cs` manages quest state, UI, content, and audio
- Repo: `NPBruce/valkyrie`

### valkyrie-questdata (quest source)
- Source data for quests/scenarios in INI + localization format
- Supports D2E (Descent 2nd Ed) and MoM (Mansions of Madness)
- Build script (`build.vbs`) zips quest directories into `.valkyrie` packages
- Outputs built packages to `valkyrie-store`
- Repo: `NPBruce/valkyrie-questdata`

### valkyrie-store (manifest pipeline)
- GitOps data pipeline that serves scenario manifests to the Valkyrie app
- GitHub Actions sync runs hourly, fetching metadata from quest repos
- Generated `manifestDownload.ini` files are consumed by the app at runtime
- Only `manifest.ini` files should be manually edited
- Repo: `NPBruce/valkyrie-store`

## Data Flow

```
valkyrie-questdata          valkyrie-store              valkyrie
 (quest source INI)          (manifest pipeline)         (Unity app)
       |                          |                          |
  build.vbs zips            manifest_sync.py            App fetches
  quest dirs into     --->  fetches metadata,     --->  manifestDownload.ini
  .valkyrie packages        writes manifests            to list scenarios
       |                          |                          |
  outputs to                 auto-commits via            downloads .valkyrie
  valkyrie-store/            GitHub Actions              packages to play
```
