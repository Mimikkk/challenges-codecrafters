import { Buffer } from "node:buffer";
import { DomainNameCodec } from "./DomainNameCodec.ts";
import type { RecordClass, RecordType } from "./messages.types.ts";

/**
 * The Question section of a DNS message contains the following fields:
 *  - Field Size Description
 *  - Domain Name (QNAME) - dynamic bits - a sequence of labels.
 *    - Each label is a 16-bit length field followed by that number of bytes of data.
 *    - The domain name ends with a 0-length label.
 *  - Record Type (QTYPE) - 16 bits - The type of record being queried.
 *  - Record Class (QCLASS) - 16 bits - The class of record being queried.
 *
 * @see https://www.rfc-editor.org/rfc/rfc1035#section-4.1.2
 */
export interface QuestionFields {
  /**
   * Domain Name (QNAME) - dynamic bits - a sequence of labels.
   *  - Each label is a 16-bit length field followed by that number of bytes of data.
   *  - The domain name ends with a 0-length label.
   */
  domainName: string;
  /** Record Type (QTYPE) - 16 bits - The type of record being queried. */
  recordType: RecordType;
  /** Record Class (QCLASS) - 16 bits - The class of record being queried. */
  recordClass: RecordClass;
}

export class QuestionCodec {
  static sizeOf(fields: QuestionFields) {
    return 4 + DomainNameCodec.sizeOf(fields.domainName);
  }

  /**
   * Writes a question to a buffer at the specified offset:
   * - Domain Name (QNAME) - dynamic bits - a sequence of labels.
   *  - Labels are encoded as <length><content>,
   *  - <length> is a single byte that specifies the length of the label
   *  - <content> is the actual content of the label. The sequence of labels is terminated by a null byte (\x00).
   *  - The domain name ends with a 0-length label.
   * - Record Type (QTYPE) - 16 bits - The type of record being queried.
   * - Record Class (QCLASS) - 16 bits - The class of record being queried.
   */
  static encode(buffer: Buffer, offset: number, fields: QuestionFields): number {
    offset = DomainNameCodec.encode(buffer, offset, fields.domainName);

    buffer.writeUInt16BE(fields.recordType & 0xffff, offset);
    offset += 2;
    buffer.writeUInt16BE(fields.recordClass & 0xffff, offset);
    offset += 2;

    return offset;
  }

  static decode(buffer: Buffer, offset: number): [QuestionFields, number] {
    const [domainName, domainNameEndsAt] = DomainNameCodec.decode(buffer, offset);

    offset = domainNameEndsAt;
    const recordType = buffer.readUInt16BE(offset);
    offset += 2;
    const recordClass = buffer.readUInt16BE(offset);
    offset += 2;

    return [{ domainName: domainName, recordType, recordClass }, offset];
  }
}
