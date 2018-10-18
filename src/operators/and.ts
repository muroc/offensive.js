
import Registry from '../Registry';
import { BinaryOperator, Result } from '../model';

declare module "../Context" {
  /**
   * @author Maciej Chałapuk (maciej@chalapuk.pl)
   */
  interface OperatorContext<T> {
    and : AssertionContext<T>;
    with : AssertionContext<T>;
    of : AssertionContext<T>;
  }
}

export const AndOperatorFactory = BinaryOperator.factory(
  'and',
  (lhs, rhs) => lhs.success && rhs.success,
);

Registry.instance
  .addOperatorFactory({
    names: [ 'and', 'with', 'of' ],
    factory: AndOperatorFactory,
  })
;

