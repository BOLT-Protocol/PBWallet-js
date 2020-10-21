class PBBtcFeesPerByte {
  constructor(network, slow, standard, fast, lastSyncTime) {
    this.network = network;
    this.slow = slow;
    this.standard = standard;
    this.fast = fast;
    this.lastSyncTime = lastSyncTime;
  }

  static fromMap(map) {
    const feesPerByte = new PBBtcFeesPerByte(
      map[PBBtcFeesPerByte.FieldNameNetwork],
      map[PBBtcFeesPerByte.FieldNameSlow],
      map[PBBtcFeesPerByte.FieldNameStandard],
      map[PBBtcFeesPerByte.FieldNameFast],
      map[PBBtcFeesPerByte.FieldNameLastSyncTime],
    );
    return feesPerByte;
  }

  static get ClassName() { return 'CABtcFeesPerByte'; }

  static get FieldNameNetwork() { return 'network'; }

  static get FieldNameSlow() { return 'slow'; }

  static get FieldNameStandard() { return 'standard'; }

  static get FieldNameFast() { return 'fast'; }

  static get FieldNameLastSyncTime() { return 'lastSyncTime'; }

  get map() {
    return {
      [PBBtcFeesPerByte.FieldNameNetwork]: this.network,
      [PBBtcFeesPerByte.FieldNameSlow]: this.slow,
      [PBBtcFeesPerByte.FieldNameStandard]: this.standard,
      [PBBtcFeesPerByte.FieldNameFast]: this.fast,
      [PBBtcFeesPerByte.FieldNameLastSyncTime]: this.lastSyncTime,
    };
  }
}

module.exports = PBBtcFeesPerByte;
