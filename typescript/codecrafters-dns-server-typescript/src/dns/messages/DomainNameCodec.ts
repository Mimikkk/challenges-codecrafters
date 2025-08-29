import { Buffer } from "node:buffer";

export class DomainNameCodec {
  static sizeOf(label: string): number {
    return Buffer.byteLength(label) + 2;
  }

  static encode(buffer: Buffer, offset: number, label: string): number {
    const labels = label.split(".");

    for (let i = 0; i < labels.length; ++i) {
      const label = labels[i];
      const length = Buffer.byteLength(label);
      buffer.writeUInt8(length, offset);
      offset += 1;
      buffer.write(label, offset);
      offset += length;
    }

    buffer.writeUInt8(0, offset);
    offset += 1;

    return offset;
  }

  static decode(packet: Buffer, offset: number): [label: string, endsAt: number] {
    const labels: string[] = [];

    while (true) {
      const value = packet.readUInt8(offset);
      if (value === 0) {
        offset += 1;
        break;
      }

      if (this.isPointerByte(value)) {
        const [label] = this.decode(packet, this.readPointerOffset(packet, offset));
        labels.push(label);
        offset += 2;
        break;
      }

      offset += 1;
      labels.push(packet.subarray(offset, offset + value).toString("ascii"));
      offset += value;
    }

    return [labels.join("."), offset];
  }

  private static isPointerByte(byte: number): boolean {
    return (byte & 0xc0) === 0xc0;
  }

  private static readPointerOffset(packet: Buffer, offset: number): number {
    return packet.readUint16BE(offset) & 0x3fff;
  }
}
