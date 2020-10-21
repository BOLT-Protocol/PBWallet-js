class PBBtcSyncMetadata {
  constructor(uid, numberOfUsedExternalPubKey, numberOfUsedInternalPubKey,
    lastSyncTime, lastFullSyncTime) {
    this._uid = uid;
    this._numberOfUsedExternalPubKey = numberOfUsedExternalPubKey;
    this._numberOfUsedInternalPubKey = numberOfUsedInternalPubKey;
    this._lastSyncTime = lastSyncTime;
    this._lastFullSyncTime = lastFullSyncTime;
  }

  static fromMap(map) {
    const syncMetadata = new PBBtcSyncMetadata(
      map[PBBtcSyncMetadata.FieldNameUid],
      map[PBBtcSyncMetadata.FieldNameNumberOfUsedExternalPubKey],
      map[PBBtcSyncMetadata.FieldNameNumberOfUsedInternalPubKey],
      map[PBBtcSyncMetadata.FieldNameLastSyncTime],
      map[PBBtcSyncMetadata.FieldNameLastFullSyncTime],
    );
    return syncMetadata;
  }

  get lastSyncTime() { return this._lastSyncTime; }

  get lastFullSyncTime() { return this._lastFullSyncTime; }

  static get ClassName() { return 'CABtcSyncMetadata'; }

  static get FieldNameUid() { return 'uid'; }

  static get FieldNameNumberOfUsedExternalPubKey() { return 'numberOfUsedExternalPubKey'; }

  static get FieldNameNumberOfUsedInternalPubKey() { return 'numberOfUsedInternalPubKey'; }

  static get FieldNameLastSyncTime() { return 'lastSyncTime'; }

  static get FieldNameLastFullSyncTime() { return 'lastFullSyncTime'; }

  get map() {
    return {
      [PBBtcSyncMetadata.FieldName_Uid]: this._uid,
      [PBBtcSyncMetadata.FieldName_NumberOfUsedExternalPubKey]: this._numberOfUsedExternalPubKey,
      [PBBtcSyncMetadata.FieldName_NumberOfUsedInternalPubKey]: this._numberOfUsedInternalPubKey,
      [PBBtcSyncMetadata.FieldName_LastSyncTime]: this._lastSyncTime,
      [PBBtcSyncMetadata.FieldName_LastFullSyncTime]: this._lastFullSyncTime,
    };
  }
}

module.exports = PBBtcSyncMetadata;
