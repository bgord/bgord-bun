export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5; // offset basis for initial entropy

  for (let i = 0; i < input.length; i++) {
    // XORs the current hash with the numeric value of the current character
    hash ^= input.charCodeAt(i);

    // Multiply by power of twos
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  // Force into an unsigned 32-bit integer
  return hash >>> 0;
}
