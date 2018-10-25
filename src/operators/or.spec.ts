
import { BinaryOperator, Result, StandardMessage } from '../model';
import OrOperator from './or';

describe('OrOperator', () => {
  let testedOperator : BinaryOperator;

  beforeEach(() => {
    testedOperator = new OrOperator();
  });

  const messageTests = [
    {
      testName: '3 msgs with same object',
      operandMessages: [ msg('obj0', 'be 0'), msg('obj0', 'be 1'), msg('obj0', 'be 2') ],
      resultMessage: 'obj0 must be 0 or 1 or 2',
    },
    {
      testName: 'first 2 msgs with same object',
      operandMessages: [ msg('obj0', 'be 0'), msg('obj0', 'be 1'), msg('obj1', 'be 2') ],
      resultMessage: 'obj0 must be 0 or 1 or obj1 must be 2',
    },
    {
      testName: 'last 2 msgs with same object',
      operandMessages: [ msg('obj0', 'be 0'), msg('obj1', 'be 1'), msg('obj1', 'be 2') ],
      resultMessage: 'obj0 must be 0 or obj1 must be 1 or 2',
    },
    {
      testName: 'each msg with different object',
      operandMessages: [ msg('obj0', 'be 0'), msg('obj1', 'be 1'), msg('obj2', 'be 2') ],
      resultMessage: 'obj0 must be 0 or obj1 must be 1 or obj2 must be 2',
    },
  ];

  messageTests.forEach(params => {
    const { testName, operandMessages, resultMessage } = params;

    describe(`.apply(${testName})`, () => {
      it(`returns message \'${resultMessage}\'`, () => {
        const success = false;
        const operands = operandMessages.map(message => ({ success, message } as Result));

        const result = testedOperator.apply(operands);
        const msgString = result.message.toString();
        msgString.should.equal(resultMessage);
      });
    });
  });
});

function msg(object : string, requirement : string) {
  return new StandardMessage(object, requirement);
}
