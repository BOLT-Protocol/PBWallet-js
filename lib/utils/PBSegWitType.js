const SegWitType = {
  nonSegWit: 'nonSegWit',
  segWit: 'segWit',
  nativeSegWit: 'nativeSegWit',
};

const PBSegWitType = {
  nonSegWit: { value: 1, purpose: 44, name: 'Legacy' },
  segWit: { value: 2, purpose: 49, name: 'SegWit' },
  nativeSegWit: { value: 3, purpose: 84, name: 'Native SegWit' },
};

module.exports = { SegWitType, PBSegWitType };
