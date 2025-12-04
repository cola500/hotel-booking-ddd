describe('Jest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should handle TypeScript', () => {
    const message: string = 'TypeScript is working!';
    expect(message).toContain('TypeScript');
  });
});
