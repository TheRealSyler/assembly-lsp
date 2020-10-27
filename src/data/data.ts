interface Completion {
  name: string;
  description: string;
}

type RegisterBits = 8 | 16 | 32 | 64;

interface Register extends Completion {
  bits: RegisterBits;
}
/**Base registers used to generate derived registers, for example EAX from AX. */
type GeneralRegister = 'AX' | 'CX' | 'DX' | 'BX' | 'SP' | 'BP' | 'SI' | 'DI';

function generateRegisters() {
  const registers: { [key: string]: Register } = {};
  // generate general registers.
  const generalRegisters: GeneralRegister[] = ['AX', 'CX', 'DX', 'BX', 'SP', 'BP', 'SI', 'DI'];
  for (let i = 0; i < generalRegisters.length; i++) {
    const register = generalRegisters[i];

    const rReg = 'R' + register;
    registers[rReg] = generalRegister(rReg, 64, register);

    const eReg = 'E' + register;
    registers[eReg] = generalRegister(eReg, 32, register);

    registers[register] = generalRegister(register, 16, register);

    // generate 8 bit registers
    switch (register) {
      case 'AX':
      case 'DX':
      case 'CX':
      case 'BX':
        const lRegName = register.replace(/X/, 'L');
        registers[lRegName] = generalRegister(lRegName, 8, register);
        const hRegName = register.replace(/X/, 'H');
        registers[hRegName] = generalRegister(hRegName, 8, register);
        break;
      case 'SP':
      case 'BP':
      case 'SI':
      case 'DI':
        const regName = register + 'L';
        registers[regName] = generalRegister(regName, 8, register);
        break;
    }
  }
  // Segment Registers
  registers['SS'] = register('SS', 16, 'Stack Segment. Pointer to the stack.');
  registers['CS'] = register('CS', 16, 'Code Segment. Pointer to the code.');
  registers['DS'] = register('DS', 16, 'Data Segment. Pointer to the data.');
  registers['ES'] = register('ES', 16, 'Extra Segment. Pointer to extra data.');
  registers['FS'] = register('FS', 16, 'F Segment. Pointer to extra data.');
  registers['GS'] = register('GS', 16, 'G Segment. Pointer to extra data.');
  // Flags register
  registers['EFLAGS'] = register(
    'EFLAGS',
    32,
    `The EFLAGS is a 32-bit register used as a collection of bits representing Boolean values to store the results of operations and the state of the processor.
\nThe different use of these flags are:
\n0.  CF : Carry Flag. Set if the last arithmetic operation carried (addition) or borrowed (subtraction) a bit beyond the size of the register. This is then checked when the operation is followed with an add-with-carry or subtract-with-borrow to deal with values too large for just one register to contain.
\n2.  PF : Parity Flag. Set if the number of set bits in the least significant byte is a multiple of 2.
\n4.  AF : Adjust Flag. Carry of Binary Code Decimal (BCD) numbers arithmetic operations.
\n6.  ZF : Zero Flag. Set if the result of an operation is Zero (0).
\n7.  SF : Sign Flag. Set if the result of an operation is negative.
\n8.  TF : Trap Flag. Set if step by step debugging.
\n9.  IF : Interruption Flag. Set if interrupts are enabled.
\n10.  DF : Direction Flag. Stream direction. If set, string operations will decrement their pointer rather than incrementing it, reading memory backwards.
\n11.  OF : Overflow Flag. Set if signed arithmetic operations result in a value too large for the register to contain.
\n12-13.  IOPL : I/O Privilege Level field (2 bits). I/O Privilege Level of the current process.
\n14.  NT : Nested Task flag. Controls chaining of interrupts. Set if the current process is linked to the next process.
\n16.  RF : Resume Flag. Response to debug exceptions.
\n17.  VM : Virtual-8086 Mode. Set if in 8086 compatibility mode.
\n18.  AC : Alignment Check. Set if alignment checking of memory references is done.
\n19.  VIF : Virtual Interrupt Flag. Virtual image of IF.
\n20.  VIP : Virtual Interrupt Pending flag. Set if an interrupt is pending.
\n21.  ID : Identification Flag. Support for CPUID instruction if can be set. `
  );
  // Instruction Pointer Register
  registers['EIP'] = register(
    'EIP',
    32, // TODO figure out if its actually 32 bit.
    'The EIP register contains the address of the next instruction to be executed if no branching is done. \nEIP can only be read through the stack after a call instruction.'
  );
  return registers;
}

function register(name: string, bits: RegisterBits, description: string): Register {
  return {
    bits,
    description: description,
    name,
  };
}
function generalRegister(
  name: string,
  bits: RegisterBits,
  generalRegister: GeneralRegister
): Register {
  return {
    bits,
    description: generalRegisterDescription(generalRegister, bits),
    name,
  };
}

function generalRegisterDescription(name: GeneralRegister, bit: RegisterBits) {
  const bits = `(${bit}-bit)`;

  switch (name) {
    case 'AX':
      return `${bits} Accumulator Register.\nUsed in arithmetic operations.`;
    case 'CX':
      return `${bits} Counter Register.\n Used in shift/rotate instructions and loops.`;
    case 'DX':
      return `${bits} Data Register.\nUsed in arithmetic operations and I/O operations.`;
    case 'BX':
      return `${bits} Base Register.\nUsed as a pointer to data.`;
    case 'SP':
      return `${bits} Stack Pointer Register.\nPointer to the top of the stack.`;
    case 'BP':
      return `${bits} Stack Base Pointer Register.\nUsed to point to the base of the stack.`;
    case 'SI':
      return `${bits} Source Index Register.\nUsed as a pointer to a source in stream operations.`;
    case 'DI':
      return `${bits} Destination Index Register.\nUsed as a pointer to a destination in stream operations.`;
  }
}

const registers = generateRegisters();
