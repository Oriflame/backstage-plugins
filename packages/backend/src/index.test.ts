// eslint-disable-next-line notice/notice
import { PluginEnvironment } from './types.js';

describe('test', () => {
  it('unbreaks the test runner', () => {
    const unbreaker = {} as PluginEnvironment;
    expect(unbreaker).toBeTruthy();
  });
});
