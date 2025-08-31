pub(crate) const fn parse<const N: usize>(hex: &str) -> [u8; N] {
  let hex_bytes = hex.as_bytes();
  let mut result = [0u8; N];
  let mut i = 0;

  while i < N {
    let high = match hex_bytes[i * 2] {
      b'0'..=b'9' => hex_bytes[i * 2] - b'0',
      b'a'..=b'f' => hex_bytes[i * 2] - b'a' + 10,
      b'A'..=b'F' => hex_bytes[i * 2] - b'A' + 10,
      _ => panic!("Invalid hex character"),
    };

    let low = match hex_bytes[i * 2 + 1] {
      b'0'..=b'9' => hex_bytes[i * 2 + 1] - b'0',
      b'a'..=b'f' => hex_bytes[i * 2 + 1] - b'a' + 10,
      b'A'..=b'F' => hex_bytes[i * 2 + 1] - b'A' + 10,
      _ => panic!("Invalid hex character"),
    };

    result[i] = (high << 4) | low;
    i += 1;
  }
  result
}

macro_rules! hex {
  ($hex:literal) => {{
    const LEN: usize = $hex.len();
    const ARRAY_SIZE: usize = LEN / 2;

    parse::<ARRAY_SIZE>($hex)
  }};

  [$hex:literal] => {
    hex!($hex)
  };
}
pub(crate) use hex;

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn it_converts_from_valid_hex() {
    let hex = hex!("abcdef");

    assert_eq!(hex, [0xab, 0xcd, 0xef]);
  }

  #[test]
  #[should_panic]
  fn it_panics_from_invalid_hex() {
    let _ = hex!("ghij");
  }

  #[test]
  fn it_converts_from_zero_values() {
    let hex = hex!("00000000");
    assert_eq!(hex, [0x00, 0x00, 0x00, 0x00]);
  }
}
