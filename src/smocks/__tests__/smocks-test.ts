import smocks from '../index';
import otherSmocks from '../index';
it('should confirm smocks are same instance', () => {
    expect(smocks).toBe(smocks);
});
it('should confirm smocks are same instance', () => {
    expect(otherSmocks).toBe(smocks);
});
it('should confirm smocks are same instance', () => {
    otherSmocks.state = 'hi';
    expect(smocks.state).toBe('hi');
});