import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkGameFlow, computeReachability } from '../../src/validation/rules/game-flow.js';

/** A minimal playable scenario: start, a spawn, victory on defeat, defeat on elimination */
function playable(): ScenarioModel {
  const m = new ScenarioModel();
  m.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: 'EventSetup', add: 'TileHall TokenInvestigators TokenDoor' });
  m.upsert('EventSetup', { display: 'false', buttons: '0', remove: 'TokenInvestigators', operations: '$mythosMinor,=,1' });
  m.upsert('TileHall', { side: 'TileSideLobby', xposition: '0', yposition: '0' });
  m.upsert('TokenInvestigators', { type: 'TokenInvestigators', xposition: '3', yposition: '-3' });
  m.upsert('TokenDoor', { type: 'TokenExplore', xposition: '1', yposition: '-1', buttons: '1', event1: 'EventDoor' });
  m.upsert('EventDoor', { buttons: '1', event1: 'SpawnGhost' });
  m.upsert('SpawnGhost', { monster: 'MonsterGhost', buttons: '1' });
  m.upsert('EventWin', { trigger: 'DefeatedSpawnGhost', buttons: '1', event1: 'EventWinEnd' });
  m.upsert('EventWinEnd', { display: 'false', buttons: '0', operations: '$end,=,1' });
  m.upsert('EventLose', { trigger: 'Eliminated', buttons: '1', event1: 'EventLoseEnd' });
  m.upsert('EventLoseEnd', { display: 'false', buttons: '0', operations: '$end,=,1' });
  return m;
}

describe('game-flow', () => {
  it('accepts a playable scenario', () => {
    expect(checkGameFlow(playable())).toEqual([]);
  });

  it('follows clicks on added tokens, spawns and Defeated triggers', () => {
    const { runs, added } = computeReachability(playable());
    expect([...runs]).toEqual(expect.arrayContaining(['TokenDoor', 'EventDoor', 'SpawnGhost', 'EventWin', 'EventWinEnd']));
    expect(added.has('TileHall')).toBe(true);
  });

  it('errors when the victory event can never trigger (Wrath: EventVictory had no trigger)', () => {
    const m = playable();
    m.get('EventWin')!.data.trigger = undefined;
    m.get('EventLose')!.data.trigger = undefined;
    const r = checkGameFlow(m).find(x => x.severity === 'error');
    expect(r?.message).toContain('No event that sets $end can be reached');
  });

  it('does not count Defeated<Spawn> when the spawn is only put in add (it never spawns)', () => {
    const m = playable();
    m.upsert('EventDoor', { event1: '', add: 'SpawnGhost' });
    m.get('EventLose')!.data.trigger = undefined;
    expect(checkGameFlow(m).some(x => x.severity === 'error')).toBe(true);
  });

  it('warns when there is no defeat condition', () => {
    const m = playable();
    m.get('EventLose')!.data.trigger = undefined;
    expect(checkGameFlow(m).map(r => r.message).join()).toContain('No defeat condition');
  });

  it('warns when base-game mythos is never enabled', () => {
    const m = playable();
    m.upsert('EventSetup', { operations: '' });
    expect(checkGameFlow(m).map(r => r.message).join()).toContain('mythos events never appear');
  });

  it('warns about board components never placed', () => {
    const m = playable();
    m.upsert('TokenForgotten', { type: 'TokenSearch', xposition: '2', yposition: '-2' });
    expect(checkGameFlow(m).find(r => r.component === 'TokenForgotten')?.message).toContain('never placed');
  });

  it('warns when TokenInvestigators is added and removed by one event', () => {
    const m = playable();
    m.upsert('EventStart', { remove: 'TokenInvestigators' });
    expect(checkGameFlow(m).map(r => r.message).join()).toContain('never see the start position');
  });

  it('treats an item without "starting" as a starting item, as Valkyrie does', () => {
    const m = playable();
    m.upsert('QItemLamp', { itemname: 'ItemCommonKeroseneLantern' });
    m.upsert('EventDoor', { add: 'QItemLamp' });
    expect(checkGameFlow(m).find(r => r.component === 'QItemLamp')?.message).toContain('missing "starting" as true');
  });

  it('accepts a searched item with starting=false', () => {
    const m = playable();
    m.upsert('QItemLamp', { itemname: 'ItemCommonKeroseneLantern', starting: 'false' });
    m.upsert('EventDoor', { add: 'QItemLamp' });
    expect(checkGameFlow(m).filter(r => r.component === 'QItemLamp')).toHaveLength(0);
  });

  it('warns that quest items cannot be renamed', () => {
    const m = playable();
    m.upsert('QItemCodex', { traits: 'common', starting: 'false' });
    m.localization.set('QItemCodex.name', 'Codex Fragment');
    expect(checkGameFlow(m).find(r => r.component === 'QItemCodex')?.message).toContain('ignored');
  });

  it('warns when a token is removed on click but a button does nothing (Wrath: "Leave it for now")', () => {
    const m = playable();
    m.upsert('TokenBook', { type: 'TokenInteract', xposition: '4', yposition: '-4', buttons: '1', event1: 'EventBook' });
    m.upsert('EventStart', { add: 'TileHall TokenInvestigators TokenDoor TokenBook' });
    m.upsert('EventBook', { buttons: '2', event1: 'EventPuzzle', event2: '', remove: 'TokenBook' });
    m.upsert('EventPuzzle', { buttons: '1' });
    expect(checkGameFlow(m).find(r => r.component === 'EventBook')?.message).toContain('loses the token for good');
  });
});
