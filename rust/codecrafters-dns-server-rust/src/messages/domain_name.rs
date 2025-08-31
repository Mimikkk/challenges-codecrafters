use crate::messages::SizeOf;

#[derive(Clone, Debug)]
pub struct DomainName(pub Vec<String>);

impl DomainName {
  pub fn to_bytes(&self) -> Vec<u8> {
    let mut buffer: Vec<u8> = Vec::with_capacity(self.size_of());

    for label in &self.0 {
      buffer.push(label.len() as u8);
      buffer.extend(label.as_bytes());
    }
    buffer.push(0);

    buffer
  }

  pub fn from_bytes(bytes: &[u8], offset: usize) -> (Self, usize) {
    let (str, offset) = decode(bytes, offset);

    (DomainName::from(str.as_str()), offset)
  }
}

impl From<&str> for DomainName {
  fn from(value: &str) -> Self {
    DomainName(value.split(".").map(|s| s.to_string()).collect())
  }
}

impl SizeOf for DomainName {
  fn size_of(&self) -> usize {
    self.0.iter().map(|label| label.len() + 1).sum::<usize>() + 1
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn it_converts_from_str_to_domain_name() {
    let domain_name = DomainName::from("abc.com");

    assert_eq!(domain_name.0, vec!["abc".to_string(), "com".to_string()]);
  }

  #[test]
  fn it_calculates_size_of() {
    let domain_name = DomainName::from("abc.com");

    // 3 abc + 3 abc + nullbyte
    assert_eq!(domain_name.size_of(), 6 + 2 + 1);
  }
}

fn decode(buffer: &[u8], offset: usize) -> (String, usize) {
  let mut labels: Vec<String> = Vec::new();
  let mut offset = offset;

  loop {
    let value = buffer[offset];
    if value == 0 {
      offset += 1;
      break;
    }

    if is_pointer_byte(value) {
      let (label, _) = decode(buffer, read_pointer_offset(buffer, offset));
      labels.push(label);
      offset += 2;
      break;
    }

    offset += 1;
    let label = String::from_utf8(buffer[offset..offset + value as usize].to_vec()).unwrap();
    labels.push(label);
    offset += value as usize;
  }

  (labels.join("."), offset)
}

fn is_pointer_byte(byte: u8) -> bool {
  (byte & 0xc0) == 0xc0
}

fn read_pointer_offset(buffer: &[u8], offset: usize) -> usize {
  (u16::from_be_bytes([buffer[offset], buffer[offset + 1]]) & 0x3fff) as usize
}
