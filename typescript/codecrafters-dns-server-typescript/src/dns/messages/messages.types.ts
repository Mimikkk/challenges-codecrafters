/**
 * The type of record being queried.
 *  - A - Host Address (1)
 *  - NS - Name Server (2)
 *  - CNAME - Canonical Name (5)
 *  - SOA - Start of Authority (6)
 *  - PTR - Pointer (12)
 *  - MX - Mailbox Domain Name (15)
 *  - TXT - Text (16)
 *
 * @see https://www.rfc-editor.org/rfc/rfc1035#section-3.2.2
 */
export const enum RecordType {
  /** A - Host Address */
  HostAddress = 1,
  /** NS - Name Server */
  NameServer = 2,
  /** CNAME - Canonical Name */
  CanonicalName = 5,
  /** SOA - Start of Authority */
  StartOfAuthority = 6,
  /** PTR - Pointer */
  Pointer = 12,
  /** MX - Mailbox Domain Name */
  MailboxDomainName = 15,
  /** TXT - Text */
  Text = 16,
}

/**
 * The class of record being queried.
 *  - IN - Internet (1)
 *  - CH - Class 3 (Chaos) (3)
 *  - HS - Class 4 (Hesiod) (4)
 *
 * @see https://www.rfc-editor.org/rfc/rfc1035#section-3.2.4
 */
export const enum RecordClass {
  /** IN - Internet */
  Internet = 1,
  /** CH - Class 3 (Chaos) */
  Chaos = 3,
  /** HS - Class 4 (Hesiod) */
  Hesiod = 4,
}

/**
 * The type of a DNS message.
 *  - Query (0)
 *  - Response (1)
 *
 * @see https://www.rfc-editor.org/rfc/rfc1035#section-4.1.1
 */
export const enum MessageType {
  /** Query (0) */
  Query = 0,
  /** Response (1) */
  Response = 1,
}

/**
 * The response code of a DNS message.
 *  - No Error (0)
 *  - Format Error (1) - The name server was unable to interpret the query.
 *  - Server Failure (2) - The name server was unable to process this query due to a problem with the name server.
 *  - Name Error (3) - Meaningful only for responses from an authoritative name server, this code signifies that the domain name referenced in the query does not exist.
 *  - Not Implemented (4) - The name server does not support the requested kind of query.
 *  - Refused (5) - The name server refuses to perform the specified operation for policy reasons.
 *
 * @see https://www.rfc-editor.org/rfc/rfc1035#section-4.1.2
 */
export const enum ResponseCode {
  /** No Error (0) - The name server successfully processed the query. */
  NoError = 0,
  /** Format Error (1) - The name server was unable to interpret the query. */
  FormatError = 1,
  /** Server Failure (2) - The name server was unable to process this query due to a problem with the name server. */
  ServerFailure = 2,
  /** Name Error (3) - Meaningful only for responses from an authoritative name server, this code signifies that the domain name referenced in the query does not exist. */
  NameError = 3,
  /** Not Implemented (4) - The name server does not support the requested kind of query. */
  NotImplemented = 4,
  /** Refused (5) - The name server refuses to perform the specified operation for policy reasons. */
  Refused = 5,
}

/**
 * The operation code of a DNS message.
 *  - Standard Query (0)
 *  - Inverse Query (1)
 *  - Server Status Request (2)
 *  - Notify (4)
 *  - Update (5)
 *
 * @see https://www.rfc-editor.org/rfc/rfc1035#section-4.1.3
 */
export const enum OperationCode {
  /** Standard Query (0) - A request for a transfer of an authoritative answer to a question. */
  StandardQuery = 0,
  /** Inverse Query (1) - A request for a transfer of an authoritative answer to an inverse lookup of an IP address. */
  InverseQuery = 1,
  /** Server Status Request (2) - A request for the status of a name server. */
  ServerStatusRequest = 2,
  /** Notify (4) - A notification to a name server that a zone change has occurred. */
  Notify = 4,
  /** Update (5) - A request to update a zone. */
  Update = 5,
}
