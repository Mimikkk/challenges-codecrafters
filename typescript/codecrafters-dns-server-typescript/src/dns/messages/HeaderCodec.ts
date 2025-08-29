import { Buffer } from "node:buffer";
import type { MessageType, OperationCode, ResponseCode } from "./messages.types.ts";

/**
 * DNS header fields
 * The header section of a DNS message contains the following fields:
 *  - Field Size Description
 *  - Packet Identifier (ID) - 16 bits - A random ID assigned to query packets. Response packets must reply with the same ID.
 *  - Query/Response Indicator (QR) - 1 bit - 1 for a reply packet, 0 for a question packet.
 *  - Operation Code (OPCODE) - 4 bits - Specifies the kind of query in a message.
 *  - Authoritative Answer (AA) - 1 bit - 1 if the responding server "owns" the domain queried, i.e., it's authoritative.
 *  - Truncation (TC) - 1 bit - 1 if the message is larger than 512 bytes. Always 0 in UDP responses.
 *  - Recursion Desired (RD) - 1 bit - Sender sets this to 1 if the server should recursively resolve this query, 0 otherwise.
 *  - Recursion Available (RA) - 1 bit - Server sets this to 1 to indicate that recursion is available.
 *  - Reserved (Z) - 3 bits - Used by DNSSEC queries. At inception, it was reserved for future use.
 *  - Response Code (RCODE) - 4 bits - Response code indicating the status of the response.
 *  - Question Count (QDCOUNT) - 16 bits - Number of questions in the Question section.
 *  - Answer Record Count (ANCOUNT) - 16 bits - Number of records in the Answer section.
 *  - Authority Record Count (NSCOUNT) - 16 bits - Number of records in the Authority section.
 *  - Additional Record Count (ARCOUNT) - 16 bits - Number of records in the Additional section.
 *
 * @see https://www.rfc-editor.org/rfc/rfc1035#section-4.1.1
 */
export interface HeaderFields {
  /** Packet Identifier (ID) - 16 bits - A random ID assigned to query packets. Response packets must reply with the same ID. */
  packetIdentifier: number;
  /** Query/Response Indicator (QR) - 1 bit - 1 for a reply packet, 0 for a question packet. */
  queryResponseIndicator: MessageType;
  /** Operation Code (OPCODE) - 4 bits - Specifies the kind of query in a message. */
  operationCode: OperationCode;
  /** Authoritative Answer (AA) - 1 bit - 1 if the responding server "owns" the domain queried, i.e., it's authoritative. */
  authoritativeAnswer: boolean;
  /** Truncation (TC) - 1 bit - 1 if the message is larger than 512 bytes. Always 0 in UDP responses. */
  truncation: boolean;
  /** Recursion Desired (RD) - 1 bit - Sender sets this to 1 if the server should recursively resolve this query, 0 otherwise. */
  recursionDesired: boolean;
  /** Recursion Available (RA) - 1 bit - Server sets this to 1 to indicate that recursion is available. */
  recursionAvailable: boolean;
  /** Reserved (Z) - 3 bits - Used by DNSSEC queries. At inception, it was reserved for future use. */
  reserved: number;
  /** Response Code (RCODE) - 4 bits - Response code indicating the status of the response. */
  responseCode: ResponseCode;
  /** Question Count (QDCOUNT) - 16 bits - Number of questions in the Question section. */
  questionCount: number;
  /** Answer Record Count (ANCOUNT) - 16 bits - Number of records in the Answer section. */
  answerRecordCount: number;
  /** Authority Record Count (NSCOUNT) - 16 bits - Number of records in the Authority section. */
  authorityRecordCount: number;
  /** Additional Record Count (ARCOUNT) - 16 bits - Number of records in the Additional section. */
  additionalRecordCount: number;
}

export class HeaderCodec {
  static sizeOf() {
    return 12;
  }

  /**
   * Writes a header to a buffer at the specified offset:
   * - Packet Identifier (ID) - 16 bits - A random ID assigned to query packets. Response packets must reply with the same ID.
   * - Query/Response Indicator (QR) - 1 bit - 1 for a reply packet, 0 for a question packet.
   * - Operation Code (OPCODE) - 4 bits - Specifies the kind of query in a message.
   * - Authoritative Answer (AA) - 1 bit - 1 if the responding server "owns" the domain queried, i.e., it's authoritative.
   * - Truncation (TC) - 1 bit - 1 if the message is larger than 512 bytes. Always 0 in UDP responses.
   * - Recursion Desired (RD) - 1 bit - Sender sets this to 1 if the server should recursively resolve this query, 0 otherwise.
   * - Recursion Available (RA) - 1 bit - Server sets this to 1 to indicate that recursion is available.
   * - Reserved (Z) - 3 bits - Used by DNSSEC queries. At inception, it was reserved for future use.
   * - Response Code (RCODE) - 4 bits - Response code indicating the status of the response.
   * - Question Count (QDCOUNT) - 16 bits - Number of questions in the Question section.
   * - Answer Record Count (ANCOUNT) - 16 bits - Number of records in the Answer section.
   * - Authority Record Count (NSCOUNT) - 16 bits - Number of records in the Authority section.
   * - Additional Record Count (ARCOUNT) - 16 bits - Number of records in the Additional section.
   */
  static encode(
    buffer: Buffer,
    offset: number,
    {
      packetIdentifier,
      queryResponseIndicator,
      operationCode,
      authoritativeAnswer,
      truncation,
      recursionDesired,
      recursionAvailable,
      reserved,
      responseCode,
      questionCount,
      answerRecordCount,
      authorityRecordCount,
      additionalRecordCount,
    }: HeaderFields,
  ): number {
    buffer.writeUInt16BE(packetIdentifier & 0xffff, offset);
    buffer.writeUInt16BE(
      ((queryResponseIndicator & 0x01) << 15) |
        ((operationCode & 0x0f) << 11) |
        (((authoritativeAnswer ? 1 : 0) & 0x01) << 10) |
        (((truncation ? 1 : 0) & 0x01) << 9) |
        (((recursionDesired ? 1 : 0) & 0x01) << 8) |
        (((recursionAvailable ? 1 : 0) & 0x01) << 7) |
        ((reserved & 0x07) << 4) |
        (responseCode & 0x0f),
      offset + 2,
    );

    buffer.writeUInt16BE(questionCount & 0xffff, offset + 4);
    buffer.writeUInt16BE(answerRecordCount & 0xffff, offset + 6);

    buffer.writeUInt16BE(authorityRecordCount & 0xffff, offset + 8);
    buffer.writeUInt16BE(additionalRecordCount & 0xffff, offset + 10);

    return offset + 12;
  }

  /**
   * Decodes a header into fields:
   * - Packet Identifier (ID) - 16 bits - A random ID assigned to query packets. Response packets must reply with the same ID.
   * - Query/Response Indicator (QR) - 1 bit - 1 for a reply packet, 0 for a question packet.
   * - Operation Code (OPCODE) - 4 bits - Specifies the kind of query in a message.
   * - Authoritative Answer (AA) - 1 bit - 1 if the responding server "owns" the domain queried, i.e., it's authoritative.
   * - Truncation (TC) - 1 bit - 1 if the message is larger than 512 bytes. Always 0 in UDP responses.
   * - Recursion Desired (RD) - 1 bit - Sender sets this to 1 if the server should recursively resolve this query, 0 otherwise.
   * - Recursion Available (RA) - 1 bit - Server sets this to 1 to indicate that recursion is available.
   * - Reserved (Z) - 3 bits - Used by DNSSEC queries. At inception, it was reserved for future use.
   * - Response Code (RCODE) - 4 bits - Response code indicating the status of the response.
   * - Question Count (QDCOUNT) - 16 bits - Number of questions in the Question section.
   * - Answer Record Count (ANCOUNT) - 16 bits - Number of records in the Answer section.
   * - Authority Record Count (NSCOUNT) - 16 bits - Number of records in the Authority section.
   * - Additional Record Count (ARCOUNT) - 16 bits - Number of records in the Additional section.
   */
  static decode(buffer: Buffer, offset: number): [fields: HeaderFields, offset: number] {
    const flags = buffer.readUInt16BE(offset + 2);

    return [
      {
        packetIdentifier: buffer.readUInt16BE(offset),
        queryResponseIndicator: (flags & 0x8000) >> 15,
        operationCode: (flags & 0x7800) >> 11,
        authoritativeAnswer: !!((flags & 0x4000) >> 10),
        truncation: !!((flags & 0x0300) >> 9),
        recursionDesired: !!((flags & 0x0100) >> 8),
        recursionAvailable: !!((flags & 0x0080) >> 7),
        reserved: (flags & 0x0070) >> 4,
        responseCode: flags & 0x000f,
        questionCount: buffer.readUInt16BE(offset + 4),
        answerRecordCount: buffer.readUInt16BE(offset + 6),
        authorityRecordCount: buffer.readUInt16BE(offset + 8),
        additionalRecordCount: buffer.readUInt16BE(offset + 10),
      },
      offset + 12,
    ];
  }
}
