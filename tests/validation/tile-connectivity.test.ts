import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkTileConnectivity, checkTokenPlacement } from '../../src/validation/rules/tile-connectivity.js';

// Doors as Valkyrie displays the artwork (checked against in-app screenshots):
//   Lobby 7x7: one north door (centre), two on each other side; Interior Hall 7x7: west (2) and east (1, upper)
//   Study 7x3.5: doors south (right) and west (middle); Library 7x3.5: doors south (left) and east

function hubWith(extra: Record<string, Record<string, string>>): ScenarioModel {
  const model = new ScenarioModel();
  model.upsert('TileHub', { side: 'TileSideLobby', xposition: '0', yposition: '0' });
  for (const [name, data] of Object.entries(extra)) model.upsert(name, data);
  return model;
}

describe('tile-connectivity', () => {
  it('accepts tiles joined through lined-up doors', () => {
    const model = hubWith({ TileStudy: { side: 'TileSideStudy', xposition: '7', yposition: '0' } });
    expect(checkTileConnectivity(model)).toHaveLength(0);
  });

  it('accepts a rotated tile whose door faces the hub', () => {
    // Library rotated 270 (standing 3.5 wide, 7 tall) with its door on the lobby's north door
    const model = hubWith({ TileLib: { side: 'TileSideLibrary', xposition: '5.25', yposition: '7', rotation: '270' } });
    expect(checkTileConnectivity(model)).toHaveLength(0);
  });

  it('warns when touching tiles have no lined-up door', () => {
    // Interior Hall has no north door; placed south of the hub it touches the hub's south door with a wall
    const model = hubWith({ TileHall: { side: 'TileSideInteriorHall', xposition: '0', yposition: '-7' } });
    const results = checkTileConnectivity(model);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('no doors or open edges line up');
  });

  it('warns about a library north of the hub without rotation (its door faces away)', () => {
    const model = hubWith({ TileLib: { side: 'TileSideLibrary', xposition: '0', yposition: '3.5' } });
    expect(checkTileConnectivity(model)[0].message).toContain('no doors or open edges line up');
  });

  it('warns about overlapping tiles', () => {
    const model = hubWith({ TileTwo: { side: 'TileSideAttic', xposition: '0', yposition: '0' } });
    expect(checkTileConnectivity(model).some(r => r.message.includes('overlap'))).toBe(true);
  });

  it('warns about a tile that touches nothing (old 7-unit spacing for a small tile)', () => {
    const model = hubWith({ TileLib: { side: 'TileSideLibrary', xposition: '0', yposition: '7' } });
    const results = checkTileConnectivity(model);
    expect(results.some(r => r.message.includes('"TileLib" does not touch any other tile'))).toBe(true);
  });

  it('skips tiles with unknown sides', () => {
    const model = hubWith({ TileOdd: { side: 'TileSideNope', xposition: '7', yposition: '0' } });
    expect(checkTileConnectivity(model).filter(r => r.component === 'TileOdd')).toHaveLength(0);
  });
});

describe('token-placement', () => {
  it('accepts tokens on a tile and wall tokens on a border', () => {
    const model = hubWith({
      TokenA: { type: 'TokenSearch', xposition: '3.5', yposition: '-3.5' },
      TokenWall: { type: 'TokenWallInside', xposition: '7.3', yposition: '-2' },
    });
    expect(checkTokenPlacement(model)).toHaveLength(0);
  });

  it('warns about tokens beside the map (y above a tile that hangs south)', () => {
    const model = hubWith({ TokenAbove: { type: 'TokenExplore', xposition: '1', yposition: '3' } });
    const results = checkTokenPlacement(model);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('not on any tile');
  });

  it('checks monster placements too', () => {
    const model = hubWith({ MPlaceBoss: { xposition: '20', yposition: '0' } });
    expect(checkTokenPlacement(model)[0].component).toBe('MPlaceBoss');
  });

  it('is skipped when a tile has an unknown side', () => {
    const model = hubWith({
      TileOdd: { side: 'TileSideNope', xposition: '7', yposition: '0' },
      TokenFar: { type: 'TokenSearch', xposition: '9', yposition: '-1' },
    });
    expect(checkTokenPlacement(model)).toHaveLength(0);
  });
});
