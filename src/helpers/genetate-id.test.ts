import { describe, it, expect } from 'vitest';
import { generateID } from './generate-id';

describe('generateID', () => {
  it('should generate a custom ID based on name and type', () => {
    const name = 'draginolns';
    const customID = generateID(name, "standard");
    expect(customID).toBe('a99fb69a20e17f1c32094b35');
  });

  it('should generate different IDs for different types', () => {
    const name1 = 'network1';
    const name2 = 'network2';
    const customID1 = generateID(name1, "standard");
    const customID2 = generateID(name2, "blueprint");
    expect(customID1).not.toBe(customID2);
  });
});
