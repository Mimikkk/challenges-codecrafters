import { Buffer } from "node:buffer";
import { DomainNameCodec } from "./DomainNameCodec.ts";
import type { RecordClass, RecordType } from "./messages.types.ts";

/**
 * The Answer section of a DNS message contains the following fields:
 *  - Field Size Description
 *  - Domain Name (QNAME) - dynamic bits - a sequence of labels.
 *    - Each label is a 16-bit length field followed by that number of bytes of data.
 *    - The domain name ends with a 0-length label.
 *  - Record Type (QTYPE) - 16 bits - The type of record being queried.
 *  - Record Class (QCLASS) - 16 bits - The class of record being queried.
 *  - Time to Live (TTL) - 32 bits - The time to live for the record.
 *  - Data Length (RDLENGTH) - 16 bits - The length of the data in the RDATA field.
 *  - Data (RDATA) - dynamic bits - the actual data of the record.
 *
 * @see https://www.rfc-editor.org/rfc/rfc1035#section-4.1.3
 */
export interface AnswerFields {
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
  /** Time to Live (TTL) - 32 bits - The time to live for the record. */
  timeToLive: number;
  /** Data Length (RDLENGTH) - 16 bits - The length of the data in the RDATA field. */
  dataLength: number;
  /** Data (RDATA) - dynamic bits - the actual data of the record. */
  data: Buffer;
}

export class AnswerCodec {
  static RecordTypeSizeBytes = 2;
  static RecordClassSizeBytes = 2;
  static TimeToLiveSizeBytes = 4;
  static DataLengthSizeBytes = 2;

  static sizeOf(fields: AnswerFields) {
    return 10 + fields.dataLength + DomainNameCodec.sizeOf(fields.domainName);
  }

  static encode(buffer: Buffer, offset: number, fields: AnswerFields): number {
    offset = DomainNameCodec.encode(buffer, offset, fields.domainName);

    buffer.writeUInt16BE(fields.recordType & 0xffff, offset);
    offset += 2;

    buffer.writeUInt16BE(fields.recordClass & 0xffff, offset);
    offset += 2;

    buffer.writeUInt32BE(fields.timeToLive & 0xffffffff, offset);
    offset += 4;

    buffer.writeUInt16BE(fields.dataLength & 0xffff, offset);
    offset += 2;

    fields.data.copy(buffer, offset);
    offset += fields.dataLength;

    return offset;
  }

  static decode(buffer: Buffer, offset: number): [AnswerFields, number] {
    const [domainName, domainNameEndsAt] = DomainNameCodec.decode(buffer, offset);
    offset = domainNameEndsAt;

    const recordType = buffer.readUInt16BE(offset);
    offset += 2;

    const recordClass = buffer.readUInt16BE(offset);
    offset += 2;

    const timeToLive = buffer.readUInt32BE(offset);
    offset += 4;

    const dataLength = buffer.readUInt16BE(offset);
    offset += 2;

    const data = buffer.subarray(offset, offset + dataLength);
    offset += dataLength;

    return [{ domainName, recordType, recordClass, timeToLive, dataLength, data }, offset];
  }
}
