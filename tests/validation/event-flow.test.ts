import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkEventFlow } from '../../src/validation/rules/event-flow.js';

describe('event-flow', () => {
  it('accepts a chain that ends in a silent terminal (Valkyrie returns to play)', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: 'EventSetup' });
    model.upsert('EventSetup', { display: 'false', buttons: '0', remove: 'TokenInvestigators' });
    expect(checkEventFlow(model)).toHaveLength(0);
  });

  it('errors on a loop of hidden events without vartests (the game hangs)', () => {
    const model = new ScenarioModel();
    model.upsert('EventA', { display: 'false', buttons: '1', event1: 'EventB' });
    model.upsert('EventB', { display: 'false', buttons: '1', event1: 'EventA' });

    const results = checkEventFlow(model);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('error');
    expect(results[0].message).toContain('loop forever');
  });

  it('accepts a hidden loop with a vartests exit (the golden loop pattern)', () => {
    const model = new ScenarioModel();
    model.upsert('EventLoop', { display: 'false', buttons: '1', event1: 'EventLoopExit EventLoopBody' });
    model.upsert('EventLoopExit', { buttons: '1', vartests: 'VarOperation:count,>=,3' });
    model.upsert('EventLoopBody', { display: 'false', buttons: '1', operations: 'count,+,1', event1: 'EventLoop' });
    expect(checkEventFlow(model)).toHaveLength(0);
  });

  it('accepts a loop that passes through a displayed event (the player chooses)', () => {
    const model = new ScenarioModel();
    model.upsert('EventA', { display: 'false', buttons: '1', event1: 'EventB' });
    model.upsert('EventB', { buttons: '1', event1: 'EventA' });
    expect(checkEventFlow(model)).toHaveLength(0);
  });

  it('accepts random selectors (each run may pick a different event)', () => {
    const model = new ScenarioModel();
    model.upsert('EventA', { display: 'false', buttons: '1', randomevents: 'true', event1: 'EventA EventB' });
    model.upsert('EventB', { buttons: '1' });
    expect(checkEventFlow(model)).toHaveLength(0);
  });
});
