import type { Buffer } from "node:buffer";

/**
 * Name Offset   Length  Description
 * Header - 0 - 16 - The header string: "SQLite format 3\000"
 * PageSize - 16 - 2 - The database page size in bytes. Must be a power of two between 512 and 32768 inclusive, or the value 1 representing a page size of 65536.
 * FileFormatWriteVersion - 18 - 1 - File format write version. 1 for legacy; 2 for WAL.
 * FileFormatReadVersion - 19 - 1 - File format read version. 1 for legacy; 2 for WAL.
 * BytesOfUnusedReservedSpace - 20 - 1 - Bytes of unused "reserved" space at the end of each page. Usually 0.
 * MaximumEmbeddedPayloadFraction - 21 - 1 - Maximum embedded payload fraction. Must be 64.
 * MinimumEmbeddedPayloadFraction - 22 - 1 - Minimum embedded payload fraction. Must be 32.
 * LeafPayloadFraction - 23 - 1 - Leaf payload fraction. Must be 32.
 * FileChangeCounter - 24 - 4 - File change counter.
 * SizeOfTheDatabaseFileInPages - 28 - 4 - Size of the database file in pages. The "in-header database size".
 * PageNumberOfTheFirstFreelistTrunkPage - 32 - 4 - Page number of the first freelist trunk page.
 * TotalNumberOfFreelistPages - 36 - 4 - Total number of freelist pages.
 * SchemaCookie - 40 - 4 - The schema cookie.
 * SchemaFormatNumber - 44 - 4 - The schema format number. Supported schema formats are 1, 2, 3, and 4.
 * DefaultPageCacheSize - 48 - 4 - Default page cache size.
 * PageNumberOfTheLargestRootBTreePage - 52 - 4 - The page number of the largest root b-tree page when in auto-vacuum or incremental-vacuum modes, or zero otherwise.
 * DatabaseTextEncoding - 56 - 4 - The database text encoding. A value of 1 means UTF-8. A value of 2 means UTF-16le. A value of 3 means UTF-16be.
 * UserVersion - 60 - 4 - The "user version" as read and set by the user_version pragma.
 * IncrementalVacuumMode - 64 - 4 - True (non-zero) for incremental-vacuum mode. False (zero) otherwise.
 * ApplicationId - 68 - 4 - The "Application ID" set by PRAGMA application_id.
 * ReservedForExpansion - 72 - 20 - Reserved for expansion. Must be zero.
 * VersionValidFor - 92 - 4 - The version-valid-for number.
 * SqliteVersionNumber - 96 - 4 - SQLITE_VERSION_NUMBER
 *
 * @see https://www.sqlite.org/fileformat.html#the_database_header
 */
export class DatabaseHeader {
  static fromBuffer(buffer: Buffer): DatabaseHeader {
    const header = buffer.subarray(0, 16).toString("utf-8");
    const pageSize = buffer.readUInt16BE(16);
    const fileFormatWriteVersion = buffer.readUInt8(18);
    const fileFormatReadVersion = buffer.readUInt8(19);
    const bytesOfUnusedReservedSpace = buffer.readUInt8(20);
    const maximumEmbeddedPayloadFraction = buffer.readUInt8(21);
    const minimumEmbeddedPayloadFraction = buffer.readUInt8(22);
    const leafPayloadFraction = buffer.readUInt8(23);
    const fileChangeCounter = buffer.readUInt32BE(24);
    const sizeOfTheDatabaseFileInPages = buffer.readUInt32BE(28);
    const pageNumberOfTheFirstFreelistTrunkPage = buffer.readUInt32BE(32);
    const totalNumberOfFreelistPages = buffer.readUInt32BE(36);
    const schemaCookie = buffer.readUInt32BE(40);
    const schemaFormatNumber = buffer.readUInt32BE(44);
    const defaultPageCacheSize = buffer.readUInt32BE(48);
    const pageNumberOfTheLargestRootBTreePage = buffer.readUInt32BE(52);
    const databaseTextEncoding = buffer.readUInt32BE(56);
    const userVersion = buffer.readUInt32BE(60);
    const incrementalVacuumMode = buffer.readUInt32BE(64);
    const applicationId = buffer.readUInt32BE(68);
    const reservedForExpansion = buffer.readUInt32BE(72);
    const versionValidFor = buffer.readUInt32BE(92);
    const sqliteVersionNumber = buffer.readUInt32BE(96);

    return new DatabaseHeader(
      header,
      pageSize,
      fileFormatWriteVersion,
      fileFormatReadVersion,
      bytesOfUnusedReservedSpace,
      maximumEmbeddedPayloadFraction,
      minimumEmbeddedPayloadFraction,
      leafPayloadFraction,
      fileChangeCounter,
      sizeOfTheDatabaseFileInPages,
      pageNumberOfTheFirstFreelistTrunkPage,
      totalNumberOfFreelistPages,
      schemaCookie,
      schemaFormatNumber,
      defaultPageCacheSize,
      pageNumberOfTheLargestRootBTreePage,
      databaseTextEncoding,
      userVersion,
      incrementalVacuumMode,
      applicationId,
      reservedForExpansion,
      versionValidFor,
      sqliteVersionNumber,
    );
  }

  private constructor(
    /**
     * The header string: "SQLite format 3\000"
     */
    public readonly header: string,
    /**
     * The database page size in bytes. Must be a power of two between 512 and 32768 inclusive, or the value 1 representing a page size of 65536.
     */
    public readonly pageSize: number,
    /**
     * File format write version. 1 for legacy; 2 for WAL.
     */
    public readonly fileFormatWriteVersion: number,
    /**
     * File format read version. 1 for legacy; 2 for WAL.
     */
    public readonly fileFormatReadVersion: number,
    /**
     * Bytes of unused "reserved" space at the end of each page. Usually 0.
     */
    public readonly bytesOfUnusedReservedSpace: number,
    /**
     * Maximum embedded payload fraction. Must be 64.
     */
    public readonly maximumEmbeddedPayloadFraction: number,
    /**
     * Minimum embedded payload fraction. Must be 32.
     */
    public readonly minimumEmbeddedPayloadFraction: number,
    /**
     * Leaf payload fraction. Must be 32.
     */
    public readonly leafPayloadFraction: number,
    /**
     * File change counter.
     */
    public readonly fileChangeCounter: number,
    /**
     * Size of the database file in pages. The "in-header database size".
     */
    public readonly sizeOfTheDatabaseFileInPages: number,
    /**
     * Page number of the first freelist trunk page.
     */
    public readonly pageNumberOfTheFirstFreelistTrunkPage: number,
    /**
     * Total number of freelist pages.
     */
    public readonly totalNumberOfFreelistPages: number,
    /**
     * The schema cookie.
     */
    public readonly schemaCookie: number,
    /**
     * The schema format number. Supported schema formats are 1, 2, 3, and 4.
     */
    public readonly schemaFormatNumber: number,
    /**
     * Default page cache size.
     */
    public readonly defaultPageCacheSize: number,
    /**
     * The page number of the largest root b-tree page when in auto-vacuum or incremental-vacuum modes, or zero otherwise.
     */
    public readonly pageNumberOfTheLargestRootBTreePage: number,
    /**
     * The database text encoding. A value of 1 means UTF-8. A value of 2 means UTF-16le. A value of 3 means UTF-16be.
     */
    public readonly databaseTextEncoding: number,
    /**
     * The "user version" as read and set by the user_version pragma.
     */
    public readonly userVersion: number,
    /**
     * True (non-zero) for incremental-vacuum mode. False (zero) otherwise.
     */
    public readonly incrementalVacuumMode: number,
    /**
     * The "Application ID" set by PRAGMA application_id.
     */
    public readonly applicationId: number,
    /**
     * Reserved for expansion. Must be zero.
     */
    public readonly reservedForExpansion: number,
    /**
     * The version-valid-for number.
     */
    public readonly versionValidFor: number,
    /**
     * SQLITE_VERSION_NUMBER
     */
    public readonly sqliteVersionNumber: number,
  ) {}

  static intoBuffer(header: DatabaseHeader, buffer: Buffer): number {
    buffer.write(header.header, 0, 16, "utf-8");
    buffer.writeUInt16BE(header.pageSize, 16);
    buffer.writeUInt8(header.fileFormatWriteVersion, 18);
    buffer.writeUInt8(header.fileFormatReadVersion, 19);
    buffer.writeUInt8(header.bytesOfUnusedReservedSpace, 20);
    buffer.writeUInt8(header.maximumEmbeddedPayloadFraction, 21);
    buffer.writeUInt8(header.minimumEmbeddedPayloadFraction, 22);
    buffer.writeUInt8(header.leafPayloadFraction, 23);
    buffer.writeUInt32BE(header.fileChangeCounter, 24);
    buffer.writeUInt32BE(header.sizeOfTheDatabaseFileInPages, 28);
    buffer.writeUInt32BE(header.pageNumberOfTheFirstFreelistTrunkPage, 32);
    buffer.writeUInt32BE(header.totalNumberOfFreelistPages, 36);
    buffer.writeUInt32BE(header.schemaCookie, 40);
    buffer.writeUInt32BE(header.schemaFormatNumber, 44);
    buffer.writeUInt32BE(header.defaultPageCacheSize, 48);
    buffer.writeUInt32BE(header.pageNumberOfTheLargestRootBTreePage, 52);
    buffer.writeUInt32BE(header.databaseTextEncoding, 56);
    buffer.writeUInt32BE(header.userVersion, 60);
    buffer.writeUInt32BE(header.incrementalVacuumMode, 64);
    buffer.writeUInt32BE(header.applicationId, 68);
    buffer.writeUInt32BE(header.reservedForExpansion, 72);
    buffer.writeUInt32BE(header.versionValidFor, 92);
    buffer.writeUInt32BE(header.sqliteVersionNumber, 96);

    return 100;
  }
}
