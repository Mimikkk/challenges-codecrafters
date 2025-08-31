//! DNS Header consists of 12 bytes:
//! - Packet Identifier (ID) - 16 bits - A random ID assigned to query packets. Response packetsmust reply with the same ID.
//! - Query/Response Indicator (QR) - 1 bit - 1 for a reply packet, 0 for a question packet.
//! - Operation Code (OPCODE) - 4 bits - Specifies the kind of query in a message.
//! - Authoritative Answer (AA) - 1 bit - 1 if the responding server "owns" the domain queried, i.e., it's authoritative.
//! - Truncation (TC) - 1 bit - 1 if the message is larger than 512 bytes. Always 0 in UDP responses.
//! - Recursion Desired (RD) - 1 bit - Sender sets this to 1 if the server should recursively resolve this query, 0 otherwise.
//! - Recursion Available (RA) - 1 bit - Server sets this to 1 to indicate that recursion is available.
//! - Reserved (Z) - 3 bits - Used by DNSSEC queries. At inception, it was reserved for future use.
//! - Response Code (RCODE) - 4 bits - Response code indicating the status of the response.
//! - Question Count (QDCOUNT) - 16 bits - Number of questions in the Question section.
//! - Answer Record Count (ANCOUNT) - 16 bits - Number of records in the Answer section.
//! - Authority Record Count (NSCOUNT) - 16 bits - Number of records in the Authority section.
//! - Additional Record Count (ARCOUNT) - 16 bits - Number of records in the Additional section.

use crate::messages::traits::SizeOf;

#[derive(Clone, Debug)]
pub struct HeaderBuffer(pub Vec<u8>);

impl From<HeaderBuffer> for Vec<u8> {
  fn from(HeaderBuffer(buffer): HeaderBuffer) -> Self {
    buffer
  }
}

impl From<HeaderBuffer> for HeaderProperties {
  fn from(HeaderBuffer(buffer): HeaderBuffer) -> Self {
    Self {
      id: u16::from_be_bytes([buffer[0], buffer[1]]),
      flags: Flags(u16::from_be_bytes([buffer[2], buffer[3]])),
      question_count: u16::from_be_bytes([buffer[4], buffer[5]]),
      answer_record_count: u16::from_be_bytes([buffer[6], buffer[7]]),
      authority_record_count: u16::from_be_bytes([buffer[8], buffer[9]]),
      additional_record_count: u16::from_be_bytes([buffer[10], buffer[11]]),
    }
  }
}

#[derive(Clone, Debug)]
pub struct HeaderProperties {
  pub id: u16,
  pub flags: Flags,
  pub question_count: u16,
  pub answer_record_count: u16,
  pub authority_record_count: u16,
  pub additional_record_count: u16,
}

impl HeaderProperties {
  pub const fn is_query(&self) -> bool {
    self.flags.is_query()
  }

  pub const fn is_response(&self) -> bool {
    self.flags.is_response()
  }

  pub const fn is_authoritative(&self) -> bool {
    self.flags.is_authoritative()
  }

  pub const fn is_truncated(&self) -> bool {
    self.flags.is_truncated()
  }

  pub const fn is_recursion_desired(&self) -> bool {
    self.flags.is_recursion_desired()
  }

  pub const fn is_recursion_available(&self) -> bool {
    self.flags.is_recursion_available()
  }

  pub const fn response_code(&self) -> u8 {
    self.flags.response_code()
  }

  pub const fn operation_code(&self) -> u8 {
    self.flags.operation_code()
  }
}

impl From<HeaderProperties> for Vec<u8> {
  fn from(properties: HeaderProperties) -> Self {
    HeaderBuffer::from(properties).into()
  }
}

impl From<HeaderProperties> for HeaderBuffer {
  fn from(properties: HeaderProperties) -> Self {
    Self(vec![
      (properties.id >> 8) as u8,
      properties.id as u8,
      (properties.flags.0 >> 8) as u8,
      properties.flags.0 as u8,
      (properties.question_count >> 8) as u8,
      properties.question_count as u8,
      (properties.answer_record_count >> 8) as u8,
      properties.answer_record_count as u8,
      (properties.authority_record_count >> 8) as u8,
      properties.authority_record_count as u8,
      (properties.additional_record_count >> 8) as u8,
      properties.additional_record_count as u8,
    ])
  }
}

impl SizeOf for HeaderProperties {
  fn size_of(&self) -> usize {
    12
  }
}

#[derive(Clone, Debug)]
pub struct Flags(u16);

impl Flags {
  pub const None: Flags = Flags(0b0000_0000_0000_0000);
  pub const Query: Flags = Flags(0b0000_0000_0000_0000);
  pub const Response: Flags = Flags(0b1000_0000_0000_0000);
  pub const Authoritative: Flags = Flags(0b0000_0010_0000_0000);
  pub const Truncated: Flags = Flags(0b0000_0100_0000_0000);
  pub const RecursionDesired: Flags = Flags(0b0000_0001_0000_0000);
  pub const RecursionAvailable: Flags = Flags(0b0000_0000_1000_0000);

  pub const fn recursion_desired(value: bool) -> Flags {
    match value {
      true => Flags::RecursionDesired,
      false => Flags::None,
    }
  }

  pub const fn from_response_code(code: u8) -> Flags {
    Flags((code as u16) as u16)
  }

  pub const fn from_operation_code(code: u8) -> Flags {
    Flags(((code as u16) << 11) as u16)
  }

  pub const fn is_query(&self) -> bool {
    !self.is_set(FlagBits::QueryResponse)
  }

  pub const fn is_response(&self) -> bool {
    self.is_set(FlagBits::QueryResponse)
  }

  pub const fn is_authoritative(&self) -> bool {
    self.is_set(FlagBits::Authoritative)
  }

  pub const fn is_truncated(&self) -> bool {
    self.is_set(FlagBits::Truncated)
  }

  pub const fn is_recursion_desired(&self) -> bool {
    self.is_set(FlagBits::RecursionDesired)
  }

  pub const fn is_recursion_available(&self) -> bool {
    self.is_set(FlagBits::RecursionAvailable)
  }

  pub const fn response_code(&self) -> u8 {
    (self.0 & FlagBits::ResponseCode as u16) as u8
  }

  pub const fn operation_code(&self) -> u8 {
    ((self.0 & FlagBits::OperationCode as u16) >> 11) as u8
  }

  const fn is_set(&self, flags: FlagBits) -> bool {
    let flags = flags as u16;
    self.0 & flags == flags
  }
}

#[repr(u16)]
#[derive(Clone, Debug)]
pub enum FlagBits {
  QueryResponse = 0b1000_0000_0000_0000,
  OperationCode = 0b0111_1000_0000_0000,
  Truncated = 0b0000_0100_0000_0000,
  Authoritative = 0b0000_0010_0000_0000,
  RecursionDesired = 0b0000_0001_0000_0000,
  RecursionAvailable = 0b0000_0000_1000_0000,
  Reserved = 0b0000_0000_0111_0000,
  ResponseCode = 0b0000_0000_0000_1111,
}

impl std::ops::BitOr for Flags {
  type Output = Flags;
  fn bitor(self, other: Flags) -> Flags {
    Flags(self.0 | other.0)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::macros::*;

  #[test]
  fn it_converts_from_buffer_to_properties() {
    let test_buffer: HeaderBuffer = HeaderBuffer(hex!["abcd00000000000000000000"].to_vec());
    let header = HeaderProperties::from(test_buffer);
    println!("{:?}", &header.id);

    assert_eq!(header.id, 0xabcd);
    assert_eq!(header.is_query(), true);
    assert_eq!(header.is_response(), false);
    assert_eq!(header.operation_code(), 0);
    assert_eq!(header.is_authoritative(), false);
    assert_eq!(header.is_truncated(), false);
    assert_eq!(header.is_recursion_desired(), false);
    assert_eq!(header.is_recursion_available(), false);
    assert_eq!(header.response_code(), 0);
    assert_eq!(header.question_count, 0);
    assert_eq!(header.answer_record_count, 0);
    assert_eq!(header.authority_record_count, 0);
    assert_eq!(header.additional_record_count, 0);
  }

  #[test]
  fn it_converts_twoway() {
    let test_buffer: HeaderBuffer = HeaderBuffer(hex!["abcd00000000000000000000"].to_vec());

    let properties = HeaderProperties::from(test_buffer.clone());
    let buffer = HeaderBuffer::from(properties);

    assert_eq!(buffer.0, test_buffer.0);
  }

  #[test]
  fn it_convert_op_code_to_flags() {
    let flags = Flags::from_operation_code(7);

    assert_eq!(flags.operation_code(), 7);
  }

  #[test]
  fn it_convert_response_code_to_flags() {
    let flags = Flags::from_response_code(7);

    assert_eq!(flags.response_code(), 7);
  }
}
