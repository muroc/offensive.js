
import './lessThan';
import check from '..';

import { TestCaseBuilder, RunFunction } from '../test/TestCaseBuilder';

function assertion<ReturnType>(runTestCase : RunFunction<ReturnType>) {
  return new TestCaseBuilder<ReturnType>(runTestCase);
}

const instance = {};

describe('check(arg, \'arg\')', () => {
  describe('.is.lt(0)', () => {
    const message0 = 'arg must be < 0; got';

    assertion(arg => arg.is.lt(0)())
      .withArg(1000000).throws(`${message0} 1000000`)
      .withArg(1).throws(`${message0} 1`)
      .withArg(0).throws(`${message0} 0`)
      .withArg(true).throws(`${message0} true`)
      .withArg(false).throws(`${message0} false`)
      .withArg(null).throws(`${message0} null`)
      .withArg(-1).doesntThrow()
    ;
  });

  describe('.isnt.gte(0)', () => {
    const message0 = 'arg must not be < 0; got';

    assertion(arg => arg.isnt.lt(0)())
      .withArg(-1000000).throws(`${message0} -1000000`)
      .withArg(0).doesntThrow()
      .withArg(1).doesntThrow()
    ;
  });
});
