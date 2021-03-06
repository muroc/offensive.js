
import { Assertion, CheckFunction, Result, StandardMessage } from '../../model';
import { nodslArguments as nodsl } from '../../NoDsl';
import { NoArrayOperator } from '../../ObjectSerializer';
import { InnerExpression } from '../../Builder';

import '../anArray';
import '../../connectors';

/**
 * @author Maciej Chałapuk (maciej@chalapuk.pl)
 */
export class ElementThatAssertion implements Assertion {
  constructor(
    private elementIndex : number,
    private innerAssert : InnerExpression,
  ) {
  }
  assert(testedValue : any, varName : string, check : CheckFunction) {
    const { elementIndex, innerAssert } = this;

    if (!check(testedValue, varName).is.anArray.success) {
      return {
        get success() {
          return false;
        },
        get message() {
          const wrapper = new NoArrayOperator<any>(testedValue);
          const newBuilder = check(wrapper.cast(), `${varName}[${elementIndex}]`);
          return innerAssert(newBuilder).message;
        },
      };
    }

    const newBuilder = check(testedValue[elementIndex], `${varName}[${elementIndex}]`);
    return innerAssert(newBuilder);
  }
}

export namespace ElementThatAssertion {
  /**
   * @author Maciej Chałapuk (maciej@chalapuk.pl)
   */
  export function factory(args : any[]) {
    nodsl.check(
      args.length === 2,
      '.elementThat requires 2 arguments (got ', args.length, ')',
    );
    nodsl.check(
      typeof args[0] === 'number',
      'elementIndex must be a number (got ', (typeof args[0]), ')',
    );
    nodsl.check(
      typeof args[1] === 'function',
      'assert must be a function (got ', (typeof args[1]), ')',
    );

    return new ElementThatAssertion(args[0], args[1]);
  }
}

export default ElementThatAssertion;

