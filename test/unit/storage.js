'use strict';

/* global BinStorage, CacheStore, JSZhuyinDataPackStorage,
          arrayBufferToStringArray, numberArrayToStringArray,
          arrayToUint16LEArrayBuffer, BopomofoEncoder */

var binStorageResArray = [
  0x0001, 0x0000, // Table0 header
  0x0041,         // Table0 key table
  0x000a, 0x0000, // Table0 ptr table, ptr to table1 (32bit LE)

  0x0001, 0x0000, // Table1 header
  0x0042,         // Table1 key table
  0x0014, 0x0000, // Table1 ptr table, ptr to table2 (32bit LE)

  0x0001, 0x0005, // Table2 header
  0x1111, 0x2222, 0x3333, 0x4444, 0x5555, // Table2 content
  0x0043,         // Table2 key table
  0x0028, 0x0000, // Table2 ptr table, ptr to table3 (32bit LE)

  0x0000, 0x0004, // Table3 header
  0x6666, 0x7777, 0x8888, 0x9999 // Table3 content
];

var binStorageData = arrayToUint16LEArrayBuffer(binStorageResArray);

module('BinStorage');

test('create instance', function() {
  var storage = new BinStorage();
  ok(!storage.loaded, 'Passed!');
});

var binStorageResStringArray = numberArrayToStringArray(binStorageResArray);

test('create instance', function() {
  var storage = new BinStorage();
  ok(!storage.loaded, 'Passed!');
});

test('unload()', function() {
  var storage = new BinStorage();

  storage.load(binStorageData);
  storage.unload();
  ok(!storage.loaded, 'Passed!');
  equal(storage._bin, undefined, 'Data purged');
});

test('get()', function() {
  var storage = new BinStorage();
  storage.load(binStorageData);

  var value = storage.get([0x41, 0x42, 0x43]);
  deepEqual(arrayBufferToStringArray(value[0]), binStorageResStringArray);
  equal(value[1], 0x28 + 4 /* start address of Table3 content */);
  equal(value[2], 4 /* length of Table3 content */, 'Passed!');
});

test('get() (not found)', function() {
  var storage = new BinStorage();
  storage.load(binStorageData);

  var value = storage.get([0x41, 0x42, 0x45]);
  equal(value, undefined, 'Passed!');
});

test('getRange()', function() {
  var storage = new BinStorage();
  storage.load(binStorageData);

  var value = storage.getRange([0x41, 0x42]);
  equal(value.length, 1, 'Passed!');
  deepEqual(arrayBufferToStringArray(value[0][0]), binStorageResStringArray);
  equal(value[0][1], 0x28 + 4 /* start address of Table3 content */);
  equal(value[0][2], 4 /* length of Table3 content */, 'Passed!');
});

test('getRange() (not found)', function() {
  var storage = new BinStorage();
  storage.load(binStorageData);

  var value = storage.getRange([0x41, 0x42, 0x45]);
  deepEqual(value, [], 'Passed!');
});

module('CacheStore');

test('add() and get()', function() {
  var store = new CacheStore();
  var val = {};
  store.add([0x41, 0x42], val);
  equal(store.dataMap.get('\u0041\u0042'), val, 'Passed!');
});

test('get()', function() {
  var store = new CacheStore();
  var val = {};
  store.add([0x41, 0x42], val);
  deepEqual(store.get([0x41, 0x42]), val, 'Passed!');
});

test('cleanup() w/ supersetCodes', function() {
  var store = new CacheStore();
  var val = {};
  var val2 = {};
  var val3 = {};
  store.add([0x41, 0x42], val);
  store.add([0x41, 0x43], val2);
  store.add([0x41, 0x44], val3);

  store.cleanup([0x41, 0x44, 0x41, 0x42]);

  equal(store.get([0x41, 0x42]), val, 'Passed!');
  equal(store.get([0x41, 0x43]), undefined, 'Passed!');
  equal(store.get([0x41, 0x44]), val3, 'Passed!');
});

test('cleanup()', function() {
  var store = new CacheStore();
  var val = {};
  var val2 = {};
  var val3 = {};
  store.add([0x41, 0x42], val);
  store.add([0x41, 0x43], val2);
  store.add([0x41, 0x44], val3);

  store.cleanup();

  equal(store.get([0x41, 0x42]), undefined, 'Passed!');
  equal(store.get([0x41, 0x43]), undefined, 'Passed!');
  equal(store.get([0x41, 0x44]), undefined, 'Passed!');
});

// This the simply the number representation of testdata.data
var testdataResArray = [
  0x0004, 0x0000, 0x0233, 0x0c2a, 0x0c62, 0x2204, 0x001c, 0x0000,
  0x0028, 0x0000, 0x00dc, 0x0000, 0x00f4, 0x0000, 0x0000, 0x0004,
  0x0041, 0xc846, 0xc054, 0x5317, 0x0002, 0x0034, 0x0041, 0x8c8b,
  0xc03c, 0x53f0, 0x14ac, 0xc060, 0x81fa, 0xb26b, 0xc098, 0x62ac,
  0xea1c, 0xc099, 0x98b1, 0x927c, 0xc0a8, 0x6aaf, 0xfbee, 0xc0b7,
  0x82d4, 0xfc31, 0xc0c2, 0x8dc6, 0x9cf7, 0xc0c9, 0x90b0, 0xc828,
  0xc0f1, 0x9b90, 0x6a32, 0xc0fb, 0x65f2, 0x6a32, 0xc0fb, 0x70b1,
  0x6a32, 0xc0fb, 0x5b2f, 0x6a32, 0xc0fb, 0x5113, 0x6a32, 0xc0fb,
  0x85b9, 0x6a32, 0xc0fb, 0x99d8, 0x6a32, 0xc0fb, 0x7c49, 0x6a32,
  0xc0fb, 0x79ee, 0x002c, 0x0233, 0x00a0, 0x0000, 0x00ae, 0x0000,
  0x0000, 0x0005, 0x0042, 0xfc3b, 0xc0d4, 0x62ac, 0x611b, 0x0001,
  0x0005, 0x0042, 0x67d1, 0xc051, 0x53f0, 0x5317, 0x2204, 0x00c2,
  0x0000, 0x0000, 0x000b, 0x0043, 0x204d, 0xc055, 0x53f0, 0x5317,
  0x5e02, 0xf3c0, 0xc068, 0x81fa, 0x5317, 0x5e02, 0x0001, 0x0000,
  0x002c, 0x00e6, 0x0000, 0x0000, 0x0005, 0x0042, 0x56cf, 0xc0b1,
  0x75bc, 0x611b, 0x0000, 0x00b2, 0x0041, 0x287e, 0xc00e, 0x662f,
  0x09ad, 0xc044, 0x4e8b, 0xc787, 0xc049, 0x5e02, 0xd061, 0xc052,
  0x5f0f, 0x0642, 0xc05c, 0x793a, 0x9a43, 0xc05c, 0x8996, 0xe67d,
  0xc05d, 0x4e16, 0xe845, 0xc068, 0x58eb, 0xad3c, 0xc06d, 0x8b58,
  0x3a13, 0xc06f, 0x8a66, 0x49f2, 0xc075, 0x52e2, 0xc798, 0xc076,
  0x9069, 0x8714, 0xc077, 0x5ba4, 0x3792, 0xc083, 0x91cb, 0x9a67,
  0xc08e, 0x98fe, 0x163d, 0xc08f, 0x6c0f, 0xd925, 0xc09c, 0x901d,
  0x2f87, 0xc0a4, 0x8a93, 0x8032, 0xc0a8, 0x4ed5, 0x6852, 0xc0aa,
  0x4f8d, 0x01c1, 0xc0ad, 0x55dc, 0xb81e, 0xc0af, 0x62ed, 0x0a5b,
  0xc0b4, 0x566c, 0x8aa6, 0xc0b6, 0x67ff, 0x3a92, 0xc0bf, 0x6043,
  0x790a, 0xc0c3, 0x7b6e, 0x22bc, 0xc0ce, 0x8210, 0x3f81, 0xc0cf,
  0x8efe, 0xe20b, 0xc0d4, 0x5f12, 0xe20b, 0xc0d4, 0x5a9e, 0x999a,
  0xc0d9, 0x8de9, 0x999a, 0xc0d9, 0x87ab, 0x999a, 0xc0d9, 0x4f7f,
  0x6a32, 0xc0db, 0x596d, 0x8394, 0xc0e2, 0x8c49, 0xc828, 0xc0f1,
  0x9bf7, 0xc828, 0xc0f1, 0x8cb0, 0x6a32, 0xc0fb, 0x6220, 0x6a32,
  0xc0fb, 0x623a, 0x6a32, 0xc0fb, 0x8a4d, 0x6a32, 0xc0fb, 0x907e,
  0x6a32, 0xc0fb, 0x5d3c, 0x6a32, 0xc0fb, 0x7c2d, 0x6a32, 0xc0fb,
  0x896b, 0x6a32, 0xc0fb, 0x70d2, 0x6a32, 0xc0fb, 0x8b1a, 0x6a32,
  0xc0fb, 0x5511, 0x6a32, 0xc0fb, 0x8adf, 0x6a32, 0xc0fb, 0x63d3,
  0x6a32, 0xc0fb, 0x9230, 0x6a32, 0xc0fb, 0x8ae1, 0x6a32, 0xc0fb,
  0x92b4, 0x6a32, 0xc0fb, 0x884b, 0x6a32, 0xc0fb, 0x5fa5, 0x6a32,
  0xc0fb, 0x927d, 0x6a32, 0xc0fb, 0x8906, 0x6a32, 0xc0fb, 0x7fe8,
  0x6a32, 0xc0fb, 0x9f5b, 0x6a32, 0xc0fb, 0x6fa8];

var testdataData = arrayToUint16LEArrayBuffer(testdataResArray);

module('JSZhuyinDataPackStorage');

test('create instance', function() {
  var storage = new JSZhuyinDataPackStorage();
  ok(!storage.loaded, 'Passed!');
});

test('create instance', function() {
  var storage = new JSZhuyinDataPackStorage();
  ok(!storage.loaded, 'Passed!');
});

test('unload()', function() {
  var storage = new JSZhuyinDataPackStorage();

  storage.load(testdataData);
  storage.unload();
  ok(!storage.loaded, 'Passed!');
  equal(storage._bin, undefined, 'Data purged');
});

test('get()', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.get(BopomofoEncoder.encode('ㄊㄞˊㄅㄟˇ'));
  deepEqual(value.getResults(), [ {
    score: -3.2719614505767822,
    str: '台北',
    index: 174 } ]);
});

test('get() should utilize cache', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var codes = BopomofoEncoder.encode('ㄊㄞˊㄅㄟˇ');

  var value = storage.get(codes);
  deepEqual(value.getResults(), [ {
    score: -3.2719614505767822,
    str: '台北',
    index: 174 } ]);

  var value2 = storage.get(codes);

  ok(value === value2, 'Same JSZhuyinDataPack');
});

test('get() (not found)', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.get(BopomofoEncoder.encode('ㄊㄞˊㄅㄟˇㄅㄟˇ'));
  equal(value, undefined, 'Passed!');
});

test('getRange()', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.getRange(BopomofoEncoder.encode('ㄊㄞˊㄅㄟˇ'));
  equal(value.length, 1, 'Passed!');
  deepEqual(value[0].getResults(), [
    { score: -3.330096483230591, str: '台北市', index: 194 },
    { score: -3.6398773193359375, str: '臺北市', index: 194 } ]);
});

test('getRange() (not found)', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.getRange(BopomofoEncoder.encode('ㄊㄞˊㄅㄟˇㄅㄟˇ'));
  deepEqual(value, [], 'Passed!');
});

test('getIncompleteMatched(ㄊㄞˊㄅ)', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.getIncompleteMatched(BopomofoEncoder.encode('ㄊㄞˊㄅ'));
  deepEqual(value.getResults(), [
    { score: -3.2719614505767822, str: '台北', index: 174 } ]);
});

test('getIncompleteMatched(ㄊㄞˊㄅ) should utilize cache', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var codes = BopomofoEncoder.encode('ㄊㄞˊㄅ');

  var value = storage.getIncompleteMatched(codes);
  deepEqual(value.getResults(), [
    { score: -3.2719614505767822, str: '台北', index: 174 } ]);

  // Recreate the codes array.
  codes = [].concat(codes);
  var value2 = storage.getIncompleteMatched(codes);

  ok(value === value2, 'Same JSZhuyinDataPackCollection');
});

test('getIncompleteMatched(ㄊㄅㄕ)', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.getIncompleteMatched(BopomofoEncoder.encode('ㄊㄅㄕ'));
  deepEqual(value.getResults(), [
    { score: -3.330096483230591, str: '台北市', index: 194 },
    { score: -3.6398773193359375, str: '臺北市', index: 194 } ]);
});

test('getIncompleteMatched(ㄌ) (not found)', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.getIncompleteMatched(BopomofoEncoder.encode('ㄌ'));
  equal(value, undefined, 'Passed!');
});

test('getIncompleteMatched(ㄊㄞˊㄌ) (not found)', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.getIncompleteMatched(BopomofoEncoder.encode('ㄊㄞˊㄌ'));
  equal(value, undefined, 'Passed!');
});

test('getIncompleteMatched(ㄌㄟˇㄌㄟˇ) (not found)', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value =
    storage.getIncompleteMatched(BopomofoEncoder.encode('ㄌㄟˇㄌㄟˇ'));
  equal(value, undefined, 'Passed!');
});

test('getIncompleteMatched(ㄊㄞ)',
function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.getIncompleteMatched(BopomofoEncoder.encode('ㄊㄞ'));
  deepEqual(value.getResults(), [
    { index: 40, score: -2.946078062057495, str: '台' },
    { index: 40, score: -3.5012617111206055, str: '臺' },
    { index: 40, score: -4.771779537200928, str: '抬' },
    { index: 40, score: -4.80982780456543, str: '颱' },
    { index: 40, score: -5.267881393432617, str: '檯' },
    { index: 40, score: -5.749503135681152, str: '苔' },
    { index: 40, score: -6.093285083770752, str: '跆' },
    { index: 40, score: -6.300410747528076, str: '邰' },
    { index: 40, score: -7.555683135986328, str: '鮐' },
    { index: 40, score: -7.85671329498291, str: '旲' },
    { index: 40, score: -7.85671329498291, str: '炱' },
    { index: 40, score: -7.85671329498291, str: '嬯' },
    { index: 40, score: -7.85671329498291, str: '儓' },
    { index: 40, score: -7.85671329498291, str: '薹' },
    { index: 40, score: -7.85671329498291, str: '駘' },
    { index: 40, score: -7.85671329498291, str: '籉' },
    { index: 40, score: -7.85671329498291, str: '秮' } ]);
});

test('getIncompleteMatched(ㄊ,ㄞ)', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.getIncompleteMatched(
    BopomofoEncoder.encodeExpended('ㄊㄞ'));
  deepEqual(value.getResults(), [
    { index: 230, score: -5.541846752166748, str: '疼愛' },
    { index: 160, score: -6.655789852142334, str: '抬愛' } ]);
});

test('reverseGet(台北)', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.reverseGet('台北');
  deepEqual(value, BopomofoEncoder.encode('ㄊㄞˊㄅㄟˇ'), 'Passed!');
});

test('reverseGet(高雄)', function() {
  var storage = new JSZhuyinDataPackStorage();
  storage.load(testdataData);

  var value = storage.reverseGet('高雄');
  deepEqual(value, [], 'Passed!');
});
