import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkEventFlow } from '../../src/validation/rules/event-flow.js';

describe('event-flow', () => {
  it('returns no warning when start chain reaches a display:true event', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { trigger: 'EventStart', buttons: '0', event1: 'EventIntro' });
    model.upsert('EventIntro', { buttons: '1', display: 'true', event1: 'EventNext' });
    model.upsert('EventNext', { buttons: '1', display: 'true' });

    const results = checkEventFlow(model);
    const warnings = results.filter(r => r.rule === 'event-flow');
    expect(warnings).toHaveLength(0);
  });

  it('returns warning when start chain reaches a display:false dead-end', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { trigger: 'EventStart', buttons: '0', event1: 'EventHunt' });
    model.upsert('EventHunt', { buttons: '0', display: 'false' });
    // EventHunt: display=false, no event refs, no $end → dead-end

    const results = checkEventFlow(model);
    const warnings = results.filter(r => r.rule === 'event-flow');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('warning');
    expect(warnings[0].message).toContain('EventHunt');
    expect(warnings[0].message).toContain('non-display dead-end');
  });

  it('returns no warning when chain passes through display:false to display:true', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { trigger: 'EventStart', buttons: '0', event1: 'EventSetup' });
    model.upsert('EventSetup', { buttons: '0', display: 'false', event1: 'EventIntro' });
    model.upsert('EventIntro', { buttons: '1', display: 'true' });

    const results = checkEventFlow(model);
    const warnings = results.filter(r => r.rule === 'event-flow');
    expect(warnings).toHaveLength(0);
  });

  it('follows default path (event2/else branch) when vartests present', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { trigger: 'EventStart', buttons: '0', event1: 'EventBranch' });
    model.upsert('EventBranch', {
      buttons: '0',
      display: 'false',
      vartests: 'VarOperation:somevar,==,1',
      event1: 'EventIfTrue',  // condition met
      event2: 'EventIfFalse', // else/default
    });
    model.upsert('EventIfTrue', { buttons: '1', display: 'true' });
    model.upsert('EventIfFalse', { buttons: '0', display: 'false' });
    // Default path goes to EventIfFalse which is a non-display dead-end

    const results = checkEventFlow(model);
    const warnings = results.filter(r => r.rule === 'event-flow');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain('EventIfFalse');
  });

  it('returns no warning when event has $end operation', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { trigger: 'EventStart', buttons: '0', event1: 'EventEnd' });
    model.upsert('EventEnd', { buttons: '0', display: 'false', operations: '$end,=,1' });

    const results = checkEventFlow(model);
    const warnings = results.filter(r => r.rule === 'event-flow');
    expect(warnings).toHaveLength(0);
  });

  it('skips when no EventStart trigger exists', () => {
    const model = new ScenarioModel();
    model.upsert('EventA', { buttons: '1', display: 'true' });
    model.upsert('EventB', { buttons: '0', display: 'false' });

    const results = checkEventFlow(model);
    const warnings = results.filter(r => r.rule === 'event-flow');
    expect(warnings).toHaveLength(0);
  });

  it('handles circular event chains without infinite loop', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { trigger: 'EventStart', buttons: '0', event1: 'EventLoop' });
    model.upsert('EventLoop', { buttons: '0', display: 'false', event1: 'EventLoop' });

    const results = checkEventFlow(model);
    // Should not hang — cycle is detected and no display:true found
    const warnings = results.filter(r => r.rule === 'event-flow');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain('non-display dead-end');
  });

  it('returns no warning when display:true event is a dead-end reachable from start', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { trigger: 'EventStart', buttons: '0', event1: 'EventDisplay' });
    model.upsert('EventDisplay', { buttons: '1', display: 'true' });
    // Dead-end but display:true — player can see it, it's intentional

    const results = checkEventFlow(model);
    const warnings = results.filter(r => r.rule === 'event-flow');
    expect(warnings).toHaveLength(0);
  });

  it('treats missing display field as display:true (default)', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { trigger: 'EventStart', buttons: '0', event1: 'EventNoDisplay' });
    model.upsert('EventNoDisplay', { buttons: '1' });
    // No display field — defaults to true, so player sees it

    const results = checkEventFlow(model);
    const warnings = results.filter(r => r.rule === 'event-flow');
    expect(warnings).toHaveLength(0);
  });

  it('follows event1 when no vartests present', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { trigger: 'EventStart', buttons: '0', event1: 'EventA' });
    model.upsert('EventA', { buttons: '0', display: 'false', event1: 'EventB' });
    model.upsert('EventB', { buttons: '1', display: 'true' });

    const results = checkEventFlow(model);
    const warnings = results.filter(r => r.rule === 'event-flow');
    expect(warnings).toHaveLength(0);
  });
});
