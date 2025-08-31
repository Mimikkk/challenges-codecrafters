//! DNS Answer consists of domain name bytes + 10 bytes + data bytes:
//! Name - labels followed by a null byte
//! Type - 2 bytes - Record type
//! Class - 2 bytes - Record class
//! TTL - 4 bytes - Time to live
//! Data length - 2 bytes - Length of the data
//! Data - variable - The data

use crate::messages::{DomainName, RecordClass, RecordType, SizeOf};

#[derive(Clone, Debug)]
pub struct AnswerBuffer(pub Vec<u8>, pub usize);

impl From<AnswerBuffer> for Vec<u8> {
  fn from(AnswerBuffer(buffer, offset): AnswerBuffer) -> Self {
    buffer[offset..].to_vec()
  }
}

impl From<AnswerBuffer> for AnswerProperties {
  fn from(AnswerBuffer(buffer, offset): AnswerBuffer) -> Self {
    let (domain_name, offset) = DomainName::from_bytes(&buffer, offset);
    let record_type = RecordType::from(u16::from_be_bytes([buffer[offset], buffer[offset + 1]]));
    let record_class = RecordClass::from(u16::from_be_bytes([buffer[offset + 2], buffer[offset + 3]]));

    let time_to_live = u32::from_be_bytes([
      buffer[offset + 4],
      buffer[offset + 5],
      buffer[offset + 6],
      buffer[offset + 7],
    ]);

    let data_length = u16::from_be_bytes([buffer[offset + 8], buffer[offset + 9]]);
    let data = buffer[offset + 10..offset + 10 + data_length as usize].to_vec();

    Self {
      domain_name,
      record_type,
      record_class,
      time_to_live,
      data,
    }
  }
}

#[derive(Clone, Debug)]
pub struct AnswerProperties {
  pub domain_name: DomainName,
  pub record_type: RecordType,
  pub record_class: RecordClass,
  pub time_to_live: u32,
  pub data: Vec<u8>,
}

impl From<AnswerProperties> for Vec<u8> {
  fn from(properties: AnswerProperties) -> Self {
    AnswerBuffer::from(properties).into()
  }
}

impl From<AnswerProperties> for AnswerBuffer {
  fn from(properties: AnswerProperties) -> Self {
    let size = properties.size_of();

    let mut buffer: Vec<u8> = Vec::with_capacity(size);
    buffer.extend(properties.domain_name.to_bytes());
    let record_type = properties.record_type.0;
    let record_class = properties.record_class.0;

    buffer.push(((record_type as u16) >> 8) as u8);
    buffer.push((record_type as u16) as u8);
    buffer.push(((record_class as u16) >> 8) as u8);
    buffer.push((record_class as u16) as u8);
    buffer.push(((properties.time_to_live as u32) >> 24) as u8);
    buffer.push(((properties.time_to_live as u32) >> 16) as u8);
    buffer.push(((properties.time_to_live as u32) >> 8) as u8);
    buffer.push((properties.time_to_live as u32) as u8);

    let data_length = properties.data.len() as u16;
    buffer.push(((data_length as u16) >> 8) as u8);
    buffer.push((data_length as u16) as u8);
    buffer.extend(properties.data);

    AnswerBuffer(buffer, 0)
  }
}

impl SizeOf for AnswerProperties {
  fn size_of(&self) -> usize {
    self.domain_name.size_of() + 2 + 2 + 4 + 2 + self.data.len()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::macros::*;

  #[test]
  fn it_calculates_size_of() {
    let properties = AnswerProperties {
      domain_name: DomainName::from("abc.com"),
      record_type: RecordType::Host,
      record_class: RecordClass::Internet,
      time_to_live: 0x12,
      data: vec![],
    };

    // u8 - 1 bytes
    // u16 - 2 bytes
    // u32 - 4 bytes

    // 3 abc + 3 abc + nullbyte + type + class + ttl + data length + data
    assert_eq!(properties.size_of(), (6 + 2 + 1) + 2 + 2 + 4 + 2 + 0);
  }

  #[test]
  fn it_converts_from_properties_to_buffer() {
    let properties = AnswerProperties {
      domain_name: DomainName::from("abc.com"),
      record_type: RecordType::Host,
      record_class: RecordClass::Internet,
      time_to_live: 0x12,
      data: vec![],
    };

    let buffer = AnswerBuffer::from(properties);

    assert_eq!(
      buffer.0,
      // 3 abc + 3 abc + nullbyte + type + class
      // + ttl + data length + data
      hex!["0361626303636f6d0000010001000000120000"]
    );
  }
}
