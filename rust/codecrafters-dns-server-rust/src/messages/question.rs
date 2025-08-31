//! DNS Question consists of domain name bytes + 4 bytes:
//! Name - labels followed by a null byte
//! Type - 2 bytes - Record type
//! Class - 2 bytes - Record class

use crate::messages::{DomainName, RecordClass, RecordType, SizeOf};

#[derive(Clone, Debug)]
pub struct QuestionBuffer(pub Vec<u8>, pub usize);

impl From<QuestionBuffer> for Vec<u8> {
  fn from(QuestionBuffer(buffer, offset): QuestionBuffer) -> Self {
    buffer[offset..].to_vec()
  }
}

impl From<QuestionBuffer> for QuestionProperties {
  fn from(QuestionBuffer(buffer, offset): QuestionBuffer) -> Self {
    let (domain_name, offset) = DomainName::from_bytes(&buffer, offset);
    let record_type = RecordType::from(u16::from_be_bytes([buffer[offset], buffer[offset + 1]]));
    let record_class = RecordClass::from(u16::from_be_bytes([buffer[offset + 2], buffer[offset + 3]]));

    Self {
      domain_name,
      record_type,
      record_class,
    }
  }
}

#[derive(Clone, Debug)]
pub struct QuestionProperties {
  pub domain_name: DomainName,
  pub record_type: RecordType,
  pub record_class: RecordClass,
}

impl From<QuestionProperties> for Vec<u8> {
  fn from(properties: QuestionProperties) -> Self {
    QuestionBuffer::from(properties).into()
  }
}

impl From<QuestionProperties> for QuestionBuffer {
  fn from(properties: QuestionProperties) -> Self {
    let size = properties.size_of();

    let mut buffer: Vec<u8> = Vec::with_capacity(size);

    buffer.extend(properties.domain_name.to_bytes());

    let record_type = properties.record_type.0;
    let record_class = properties.record_class.0;

    buffer.push(((record_type as u16) >> 8) as u8);
    buffer.push((record_type as u16) as u8);
    buffer.push(((record_class as u16) >> 8) as u8);
    buffer.push((record_class as u16) as u8);

    QuestionBuffer(buffer, 0)
  }
}

impl SizeOf for QuestionProperties {
  fn size_of(&self) -> usize {
    self.domain_name.size_of() + 4
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::macros::*;

  #[test]
  fn it_calculates_size_of() {
    let properties = QuestionProperties {
      domain_name: DomainName::from("abc.com"),
      record_type: RecordType::Host,
      record_class: RecordClass::Internet,
    };

    // 3 abc + 3 abc + nullbyte + type + class
    assert_eq!(properties.size_of(), 6 + 2 + 1 + 2 + 2);
  }

  #[test]
  fn it_converts_from_properties_to_buffer() {
    let properties = QuestionProperties {
      domain_name: DomainName::from("abc.com"),
      record_type: RecordType::Host,
      record_class: RecordClass::Internet,
    };

    let buffer = QuestionBuffer::from(properties);

    assert_eq!(
      buffer.0,
      // 3 abc + 3 abc + nullbyte + type + class
      hex!["0361626303636f6d0000010001"]
    );
  }
}
