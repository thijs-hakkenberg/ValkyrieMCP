import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { renderMap } from '../../src/map/render.js';

describe('renderMap', () => {
  it('draws a schematic board when no artwork folder is available, with a legend', () => {
    const model = new ScenarioModel();
    model.upsert('TileHub', { side: 'TileSideLobby', xposition: '0', yposition: '0' });
    model.upsert('TileLib', { side: 'TileSideLibrary', xposition: '7', yposition: '0', rotation: '180' });
    model.upsert('TokenClue', { type: 'TokenSearch', xposition: '3', yposition: '-3' });
    model.upsert('TokenLost', { type: 'TokenSearch', xposition: '30', yposition: '30' });

    const r = renderMap(model, { importImageDir: '/nonexistent', maxSize: 400 });

    expect(r.artwork).toBe(false);
    expect(r.png.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(Math.max(r.png.readUInt32BE(16), r.png.readUInt32BE(20))).toBeLessThanOrEqual(400);
    expect(r.legend).toContain('A = TileHub: TileSideLobby, x 0..7, y -7..0');
    expect(r.legend).toContain('B = TileLib: TileSideLibrary rotated 180, x 0..7, y 0..3.5');
    expect(r.legend).toContain('1 = TokenClue (TokenSearch) at (3, -3) on TileHub');
    expect(r.legend.find(l => l.startsWith('2 = TokenLost'))).toContain('NOT ON A TILE');
  });

  it('throws when there is nothing to draw', () => {
    expect(() => renderMap(new ScenarioModel())).toThrow('Nothing to render');
  });
});
