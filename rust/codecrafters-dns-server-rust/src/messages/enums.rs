#[derive(Clone, Debug)]
pub struct RecordType(pub u16);

impl RecordType {
  pub const Host: RecordType = RecordType(1);
}

impl From<u16> for RecordType {
  fn from(value: u16) -> Self {
    RecordType(value)
  }
}

#[derive(Clone, Debug)]
pub struct RecordClass(pub u16);

impl RecordClass {
  pub const Internet: RecordClass = RecordClass(1);
}

impl From<u16> for RecordClass {
  fn from(value: u16) -> Self {
    RecordClass(value)
  }
}
