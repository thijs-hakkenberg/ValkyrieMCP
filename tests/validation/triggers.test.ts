import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkTriggers } from '../../src/validation/rules/triggers.js';

describe('triggers', () => {
  it.each(['EventStart', 'StartRound', 'EndRound', 'EndRound5', 'Mythos', 'Eliminated', 'NoMorale', 'StartFinalRound', 'VarRitualDone', 'Var$Alarm', 'DefeatedMonsterGhost'])(
    'accepts %s', trigger => {
      const model = new ScenarioModel();
      model.upsert('EventX', { trigger, buttons: '1' });
      expect(checkTriggers(model)).toHaveLength(0);
    },
  );

  it('accepts Defeated<Spawn> and DefeatedUnique<Spawn> for spawns in the scenario', () => {
    const model = new ScenarioModel();
    model.upsert('SpawnBoss', { monster: 'MonsterGhost' });
    model.upsert('EventWin', { trigger: 'DefeatedSpawnBoss', buttons: '1' });
    model.upsert('EventHurt', { trigger: 'DefeatedUniqueSpawnBoss', buttons: '1' });
    expect(checkTriggers(model)).toHaveLength(0);
  });

  it('errors on Defeated<X> for something that is not a spawn or monster', () => {
    const model = new ScenarioModel();
    model.upsert('EventWin', { trigger: 'DefeatedTheBoss', buttons: '1' });
    expect(checkTriggers(model)[0].message).toContain('not a spawn');
  });

  it('errors on a trigger named after a token (Things That Go Bump: nothing was clickable)', () => {
    const model = new ScenarioModel();
    model.upsert('TokenSearch1', { type: 'TokenSearch', buttons: '1' });
    model.upsert('EventSearch1', { trigger: 'TokenSearch1', buttons: '1' });

    const [r] = checkTriggers(model);
    expect(r.severity).toBe('error');
    expect(r.message).toContain('Set event1=<this event> on TokenSearch1');
  });

  it('only warns about a token trigger when the token already runs the event', () => {
    const model = new ScenarioModel();
    model.upsert('TokenSearch1', { type: 'TokenSearch', buttons: '1', event1: 'EventSearch1' });
    model.upsert('EventSearch1', { trigger: 'TokenSearch1', buttons: '1' });
    expect(checkTriggers(model)[0].severity).toBe('warning');
  });

  it('errors on made-up triggers', () => {
    const model = new ScenarioModel();
    model.upsert('EventX', { trigger: 'OnBossKilled', buttons: '1' });
    expect(checkTriggers(model)[0].message).toContain('not a Valkyrie trigger');
  });
});
